import { createRequire as _nodeRequire } from "node:module";
import { Pool, type QueryResultRow } from "pg";
import { getEnv } from "./env";

// node:sqlite is loaded lazily via createRequire so the Worker module graph stays clean.
type DatabaseSyncType = import("node:sqlite").DatabaseSync;

let pool: Pool | null = null;
let sqliteDb: DatabaseSyncType | null = null;
let migrationPromise: Promise<void> | null = null;
let sqliteMigrationPromise: Promise<void> | null = null;

function getDatabaseUrl(): string | null {
  const value = getEnv("DATABASE_URL");
  return value ? value : null;
}

function getSqlitePath(): string | null {
  const explicit = getEnv("SQLITE_PATH");
  if (explicit) return explicit;

  const dbUrl = getDatabaseUrl();
  if (dbUrl && dbUrl.startsWith("sqlite:")) {
    const rawPath = dbUrl.slice("sqlite:".length).trim();
    return rawPath || null;
  }

  return ".data/brasiltec.sqlite";
}

export function isPostgresEnabled(): boolean {
  const dbUrl = getDatabaseUrl();
  return Boolean(dbUrl && !dbUrl.startsWith("sqlite:"));
}

export function isSqliteEnabled(): boolean {
  return !isPostgresEnabled() && Boolean(getSqlitePath());
}

export function getDatabaseMode(): "postgres" | "sqlite" {
  return isPostgresEnabled() ? "postgres" : "sqlite";
}

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurado.");
  }

  pool = new Pool({ connectionString });
  return pool;
}

function getSqliteDatabase(): DatabaseSyncType {
  if (sqliteDb) return sqliteDb;

  const filePath = getSqlitePath();
  if (!filePath) {
    throw new Error("SQLITE_PATH não configurado.");
  }

  // Unreachable in Cloudflare Workers (isPostgresEnabled() is always true there).
  const req = _nodeRequire(import.meta.url);
  const { DatabaseSync } = req("node:sqlite") as typeof import("node:sqlite");
  const { mkdirSync } = req("node:fs") as typeof import("node:fs");
  const { dirname, join } = req("node:path") as typeof import("node:path");

  const normalizedPath = filePath === ":memory:" ? filePath : join(process.cwd(), filePath);
  if (normalizedPath !== ":memory:") {
    mkdirSync(dirname(normalizedPath), { recursive: true });
  }

  sqliteDb = new DatabaseSync(normalizedPath);
  return sqliteDb;
}

export async function ensureDatabaseSchema(): Promise<void> {
  if (!isPostgresEnabled()) return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const activePool = getPool();
      await activePool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          business_type TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL,
          last_login_at TIMESTAMPTZ NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
      `);

      await activePool.query(`
        CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          price_cents INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          published_at TIMESTAMPTZ
        );
      `);

      await activePool.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'pending_review';
      `);

      await activePool.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS moderation_reason TEXT;
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          buyer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          amount_cents INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          payment_provider TEXT NOT NULL DEFAULT 'mock',
          provider_payment_id TEXT,
          provider_status TEXT,
          payment_reference TEXT,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'mock';
      `);

      await activePool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS provider_payment_id TEXT;
      `);

      await activePool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS provider_status TEXT;
      `);

      await activePool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS payment_reference TEXT;
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS enrollments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          progress_percent INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          UNIQUE(user_id, product_id)
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS product_modules (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS product_lessons (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          module_id TEXT NOT NULL REFERENCES product_modules(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS lesson_progress (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          lesson_id TEXT NOT NULL REFERENCES product_lessons(id) ON DELETE CASCADE,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          UNIQUE (user_id, lesson_id)
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS order_events (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          note TEXT,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS payment_webhook_events (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          event_id TEXT NOT NULL,
          order_id TEXT,
          event_status TEXT,
          signature TEXT,
          payload TEXT,
          processed_at TIMESTAMPTZ,
          processing_result TEXT,
          created_at TIMESTAMPTZ NOT NULL,
          UNIQUE(provider, event_id),
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS withdrawals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount_cents INTEGER NOT NULL,
          method TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS affiliates (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          referral_code TEXT NOT NULL UNIQUE,
          note TEXT,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          link TEXT,
          read_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          assigned_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          approved_at TIMESTAMPTZ,
          approval_note TEXT,
          source TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS approved_by_user_id TEXT;`);
      await activePool.query(`ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;`);
      await activePool.query(`ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS approval_note TEXT;`);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS moderation_audit_logs (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          admin_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS user_role_audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          previous_role TEXT,
          new_role TEXT,
          changed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          source TEXT NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS platform_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS platform_setting_audit_logs (
          id TEXT PRIMARY KEY,
          setting_key TEXT NOT NULL REFERENCES platform_settings(key) ON DELETE CASCADE,
          previous_value TEXT,
          new_value TEXT,
          changed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          action TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      await activePool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ
        );
      `);

      await activePool.query(`CREATE INDEX IF NOT EXISTS products_owner_user_id_idx ON products(owner_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS products_moderation_status_idx ON products(moderation_status);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS orders_buyer_user_id_idx ON orders(buyer_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS orders_payment_provider_idx ON orders(payment_provider);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS orders_provider_payment_id_idx ON orders(provider_payment_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON order_events(order_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS payment_webhook_events_order_id_idx ON payment_webhook_events(order_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS payment_webhook_events_created_at_idx ON payment_webhook_events(created_at);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS enrollments_product_id_idx ON enrollments(product_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS product_modules_product_id_idx ON product_modules(product_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS product_lessons_product_id_idx ON product_lessons(product_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS product_lessons_module_id_idx ON product_lessons(module_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON lesson_progress(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON lesson_progress(lesson_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON withdrawals(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS affiliates_user_id_idx ON affiliates(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates(status);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON notifications(read_at);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles(role);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_roles_assigned_by_user_id_idx ON user_roles(assigned_by_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_roles_approved_by_user_id_idx ON user_roles(approved_by_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_role_audit_logs_user_id_idx ON user_role_audit_logs(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_role_audit_logs_changed_by_user_id_idx ON user_role_audit_logs(changed_by_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS user_role_audit_logs_created_at_idx ON user_role_audit_logs(created_at);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS moderation_audit_logs_product_id_idx ON moderation_audit_logs(product_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS moderation_audit_logs_admin_user_id_idx ON moderation_audit_logs(admin_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS platform_settings_updated_by_user_id_idx ON platform_settings(updated_by_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_setting_key_idx ON platform_setting_audit_logs(setting_key);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_changed_by_user_id_idx ON platform_setting_audit_logs(changed_by_user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_created_at_idx ON platform_setting_audit_logs(created_at);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets(user_id);`);
      await activePool.query(`CREATE INDEX IF NOT EXISTS password_resets_expires_at_idx ON password_resets(expires_at);`);
    })();
  }

  await migrationPromise;
}

export async function ensureSqliteSchema(): Promise<void> {
  if (!isSqliteEnabled()) return;

  if (!sqliteMigrationPromise) {
    sqliteMigrationPromise = (async () => {
      const db = getSqliteDatabase();
      db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          business_type TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          last_login_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          owner_user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          price_cents INTEGER NOT NULL,
          status TEXT NOT NULL,
          moderation_status TEXT NOT NULL DEFAULT 'pending_review',
          moderation_reason TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT,
          FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          buyer_user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          payment_provider TEXT NOT NULL DEFAULT 'mock',
          provider_payment_id TEXT,
          provider_status TEXT,
          payment_reference TEXT,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(buyer_user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS enrollments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          order_id TEXT NOT NULL,
          progress_percent INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(user_id, product_id),
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS product_modules (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          title TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS product_lessons (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          module_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY(module_id) REFERENCES product_modules(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS lesson_progress (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          lesson_id TEXT NOT NULL,
          completed_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (user_id, lesson_id),
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY(lesson_id) REFERENCES product_lessons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_events (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payment_webhook_events (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          event_id TEXT NOT NULL,
          order_id TEXT,
          event_status TEXT,
          signature TEXT,
          payload TEXT,
          processed_at TEXT,
          processing_result TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(provider, event_id),
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS withdrawals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          method TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS affiliates (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL,
          referral_code TEXT NOT NULL UNIQUE,
          note TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          link TEXT,
          read_at TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_roles (
          user_id TEXT PRIMARY KEY,
          role TEXT NOT NULL,
          assigned_by_user_id TEXT,
          approved_by_user_id TEXT,
          approved_at TEXT,
          approval_note TEXT,
          source TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY(approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS moderation_audit_logs (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          admin_user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          reason TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY(admin_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_role_audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          previous_role TEXT,
          new_role TEXT,
          changed_by_user_id TEXT,
          source TEXT NOT NULL,
          reason TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS platform_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_by_user_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS platform_setting_audit_logs (
          id TEXT PRIMARY KEY,
          setting_key TEXT NOT NULL,
          previous_value TEXT,
          new_value TEXT,
          changed_by_user_id TEXT,
          action TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY(setting_key) REFERENCES platform_settings(key) ON DELETE CASCADE,
          FOREIGN KEY(changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS password_resets (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS products_owner_user_id_idx ON products(owner_user_id);
        CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
        CREATE INDEX IF NOT EXISTS orders_buyer_user_id_idx ON orders(buyer_user_id);
        CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);
        CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON order_events(order_id);
        CREATE INDEX IF NOT EXISTS payment_webhook_events_order_id_idx ON payment_webhook_events(order_id);
        CREATE INDEX IF NOT EXISTS payment_webhook_events_created_at_idx ON payment_webhook_events(created_at);
        CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
        CREATE INDEX IF NOT EXISTS enrollments_product_id_idx ON enrollments(product_id);
        CREATE INDEX IF NOT EXISTS product_modules_product_id_idx ON product_modules(product_id);
        CREATE INDEX IF NOT EXISTS product_lessons_product_id_idx ON product_lessons(product_id);
        CREATE INDEX IF NOT EXISTS product_lessons_module_id_idx ON product_lessons(module_id);
        CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx ON lesson_progress(user_id);
        CREATE INDEX IF NOT EXISTS lesson_progress_lesson_id_idx ON lesson_progress(lesson_id);
        CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON withdrawals(user_id);
        CREATE INDEX IF NOT EXISTS affiliates_user_id_idx ON affiliates(user_id);
        CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates(status);
        CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON notifications(read_at);
        CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
        CREATE INDEX IF NOT EXISTS user_roles_role_idx ON user_roles(role);
        CREATE INDEX IF NOT EXISTS user_roles_assigned_by_user_id_idx ON user_roles(assigned_by_user_id);
        CREATE INDEX IF NOT EXISTS user_role_audit_logs_user_id_idx ON user_role_audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS user_role_audit_logs_changed_by_user_id_idx ON user_role_audit_logs(changed_by_user_id);
        CREATE INDEX IF NOT EXISTS user_role_audit_logs_created_at_idx ON user_role_audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS moderation_audit_logs_product_id_idx ON moderation_audit_logs(product_id);
        CREATE INDEX IF NOT EXISTS moderation_audit_logs_admin_user_id_idx ON moderation_audit_logs(admin_user_id);
        CREATE INDEX IF NOT EXISTS platform_settings_updated_by_user_id_idx ON platform_settings(updated_by_user_id);
        CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_setting_key_idx ON platform_setting_audit_logs(setting_key);
        CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_changed_by_user_id_idx ON platform_setting_audit_logs(changed_by_user_id);
        CREATE INDEX IF NOT EXISTS platform_setting_audit_logs_created_at_idx ON platform_setting_audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets(user_id);
        CREATE INDEX IF NOT EXISTS password_resets_expires_at_idx ON password_resets(expires_at);
      `);

      try {
        db.exec(`ALTER TABLE user_roles ADD COLUMN approved_by_user_id TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE user_roles ADD COLUMN approved_at TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE user_roles ADD COLUMN approval_note TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      db.exec(`CREATE INDEX IF NOT EXISTS user_roles_approved_by_user_id_idx ON user_roles(approved_by_user_id);`);

      try {
        db.exec(`ALTER TABLE products ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'pending_review';`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE products ADD COLUMN moderation_reason TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'mock';`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE orders ADD COLUMN provider_payment_id TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE orders ADD COLUMN provider_status TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      try {
        db.exec(`ALTER TABLE orders ADD COLUMN payment_reference TEXT;`);
      } catch {
        // Column already exists on upgraded databases.
      }

      db.exec(`CREATE INDEX IF NOT EXISTS orders_payment_provider_idx ON orders(payment_provider);`);
      db.exec(`CREATE INDEX IF NOT EXISTS orders_provider_payment_id_idx ON orders(provider_payment_id);`);

      db.exec(`CREATE INDEX IF NOT EXISTS products_moderation_status_idx ON products(moderation_status);`);
    })();
  }

  await sqliteMigrationPromise;
}

export async function postgresQuery<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureDatabaseSchema();
  const activePool = getPool();
  const result = await activePool.query<T>(sql, params);
  return result.rows;
}

export async function sqliteGet<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  await ensureSqliteSchema();
  const db = getSqliteDatabase();
  const row = db.prepare(sql).get(...params) as T | undefined;
  return row ?? null;
}

export async function sqliteAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  await ensureSqliteSchema();
  const db = getSqliteDatabase();
  return db.prepare(sql).all(...params) as T[];
}

export async function sqliteRun(sql: string, params: unknown[] = []): Promise<void> {
  await ensureSqliteSchema();
  const db = getSqliteDatabase();
  db.prepare(sql).run(...params);
}
