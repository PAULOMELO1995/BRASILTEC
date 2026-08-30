import { a as deleteCookie, c as getRequestProtocol, l as setCookie, n as createServerFn, o as getCookie, r as TSS_SERVER_FUNCTION, s as getRequestHost } from "./server-tAK7xnTK.js";
import { z } from "zod";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/env.ts
function getRuntimeEnv() {
	const viteEnv = {
		"BASE_URL": "/",
		"DEV": true,
		"MODE": "production",
		"PROD": false,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_USER_NODE_ENV": "development"
	};
	const fromVite = viteEnv && typeof viteEnv === "object" ? viteEnv : {};
	const fromProcess = typeof process !== "undefined" && process && typeof process === "object" && "env" in process && process.env && typeof process.env === "object" ? process.env : {};
	return Object.entries({
		...fromProcess,
		...fromVite
	}).reduce((acc, [key, value]) => {
		if (typeof value === "string" || typeof value === "boolean") acc[key] = value;
		else if (value == null) acc[key] = void 0;
		else acc[key] = String(value);
		return acc;
	}, {});
}
function normalizeEnvValue(value) {
	if (typeof value === "string") return value.trim();
	if (typeof value === "boolean") return value ? "true" : "false";
	return "";
}
function getEnv(key, fallback = "") {
	const runtimeEnv = getRuntimeEnv();
	const candidates = [
		key,
		key.toUpperCase(),
		key.toLowerCase()
	];
	for (const candidate of candidates) {
		const rawValue = runtimeEnv[candidate];
		const normalized = normalizeEnvValue(rawValue);
		if (normalized) return normalized;
	}
	return fallback;
}
function getEnvBoolean(key, fallback = false) {
	const value = getEnv(key);
	if (!value) return fallback;
	return [
		"1",
		"true",
		"yes",
		"on"
	].includes(value.toLowerCase());
}
function getEnvNumber(key, fallback = 0) {
	const value = getEnv(key);
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
function getEnvList(key, fallback = []) {
	const value = getEnv(key);
	if (!value) return fallback;
	return value.split(",").map((item) => item.trim()).filter(Boolean);
}
//#endregion
//#region src/lib/db.ts
var pool = null;
var sqliteDb = null;
var migrationPromise = null;
var sqliteMigrationPromise = null;
function getDatabaseUrl() {
	const value = getEnv("DATABASE_URL");
	return value ? value : null;
}
function getSqlitePath() {
	const explicit = getEnv("SQLITE_PATH");
	if (explicit) return explicit;
	const dbUrl = getDatabaseUrl();
	if (dbUrl && dbUrl.startsWith("sqlite:")) return dbUrl.slice(7).trim() || null;
	return ".data/brasiltec.sqlite";
}
function isPostgresEnabled() {
	const dbUrl = getDatabaseUrl();
	return Boolean(dbUrl && !dbUrl.startsWith("sqlite:"));
}
function isSqliteEnabled() {
	return !isPostgresEnabled() && Boolean(getSqlitePath());
}
function getPool() {
	if (pool) return pool;
	const connectionString = getDatabaseUrl();
	if (!connectionString) throw new Error("DATABASE_URL não configurado.");
	pool = new Pool({ connectionString });
	return pool;
}
function getSqliteDatabase() {
	if (sqliteDb) return sqliteDb;
	const filePath = getSqlitePath();
	if (!filePath) throw new Error("SQLITE_PATH não configurado.");
	const normalizedPath = filePath === ":memory:" ? filePath : join(process.cwd(), filePath);
	if (normalizedPath !== ":memory:") mkdirSync(dirname(normalizedPath), { recursive: true });
	sqliteDb = new DatabaseSync(normalizedPath);
	return sqliteDb;
}
async function ensureDatabaseSchema() {
	if (!isPostgresEnabled()) return;
	if (!migrationPromise) migrationPromise = (async () => {
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
	await migrationPromise;
}
async function ensureSqliteSchema() {
	if (!isSqliteEnabled()) return;
	if (!sqliteMigrationPromise) sqliteMigrationPromise = (async () => {
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
		} catch {}
		try {
			db.exec(`ALTER TABLE user_roles ADD COLUMN approved_at TEXT;`);
		} catch {}
		try {
			db.exec(`ALTER TABLE user_roles ADD COLUMN approval_note TEXT;`);
		} catch {}
		db.exec(`CREATE INDEX IF NOT EXISTS user_roles_approved_by_user_id_idx ON user_roles(approved_by_user_id);`);
		try {
			db.exec(`ALTER TABLE products ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'pending_review';`);
		} catch {}
		try {
			db.exec(`ALTER TABLE products ADD COLUMN moderation_reason TEXT;`);
		} catch {}
		try {
			db.exec(`ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'mock';`);
		} catch {}
		try {
			db.exec(`ALTER TABLE orders ADD COLUMN provider_payment_id TEXT;`);
		} catch {}
		try {
			db.exec(`ALTER TABLE orders ADD COLUMN provider_status TEXT;`);
		} catch {}
		try {
			db.exec(`ALTER TABLE orders ADD COLUMN payment_reference TEXT;`);
		} catch {}
		db.exec(`CREATE INDEX IF NOT EXISTS orders_payment_provider_idx ON orders(payment_provider);`);
		db.exec(`CREATE INDEX IF NOT EXISTS orders_provider_payment_id_idx ON orders(provider_payment_id);`);
		db.exec(`CREATE INDEX IF NOT EXISTS products_moderation_status_idx ON products(moderation_status);`);
	})();
	await sqliteMigrationPromise;
}
async function postgresQuery(sql, params = []) {
	await ensureDatabaseSchema();
	return (await getPool().query(sql, params)).rows;
}
async function sqliteGet(sql, params = []) {
	await ensureSqliteSchema();
	return getSqliteDatabase().prepare(sql).get(...params) ?? null;
}
async function sqliteAll(sql, params = []) {
	await ensureSqliteSchema();
	return getSqliteDatabase().prepare(sql).all(...params);
}
async function sqliteRun(sql, params = []) {
	await ensureSqliteSchema();
	getSqliteDatabase().prepare(sql).run(...params);
}
//#endregion
//#region src/lib/auth-store.ts
var storePath = join(process.cwd(), ".data", "brasiltec-store.json");
var SESSION_DURATION_MS = 288e5;
var SESSION_CLEANUP_INTERVAL_MS = 3e5;
var PASSWORD_RESET_DURATION_MS = 18e5;
var PLATFORM_FEE_RATE = .1;
var GOOGLE_ACCOUNT_DEFAULT_BUSINESS = "Produtor digital";
var sessionRotationFallbacks = /* @__PURE__ */ new Map();
var lastSessionCleanupAt = 0;
var emptyStore = {
	users: [],
	sessions: [],
	passwordResets: [],
	notifications: []
};
function normalizeEmail(email) {
	return email.trim().toLowerCase();
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function toOrderStatus(raw) {
	if (raw === "approved" || raw === "pending" || raw === "declined" || raw === "refunded") return raw;
	if (raw === "failed") return "declined";
	return "pending";
}
function toModerationStatus(raw) {
	if (raw === "pending_review" || raw === "approved" || raw === "rejected") return raw;
	return "approved";
}
function toAdminRole(raw) {
	if (raw === "viewer" || raw === "moderator" || raw === "admin") return raw;
	return "none";
}
function canTransitionOrderStatus(current, next) {
	if (current === next) return true;
	if (current === "pending" && (next === "approved" || next === "declined")) return true;
	if (current === "approved" && next === "refunded") return true;
	return false;
}
function resolvePaymentProviderMode() {
	return "mock";
}
function buildPaymentReference(orderId) {
	return `BT-${orderId.replace(/[^a-z0-9]/gi, "").slice(-10).toUpperCase()}`;
}
function sessionExpiryIso() {
	return new Date(Date.now() + SESSION_DURATION_MS).toISOString();
}
function sessionRotationIntervalMs() {
	const raw = getEnvNumber("SESSION_ROTATION_INTERVAL_SECONDS", 1200);
	return (Number.isFinite(raw) ? Math.max(60, Math.min(86400, Math.trunc(raw))) : 1200) * 1e3;
}
function sessionRotationGraceMs() {
	const raw = getEnvNumber("SESSION_ROTATION_GRACE_SECONDS", 20);
	return (Number.isFinite(raw) ? Math.max(5, Math.min(300, Math.trunc(raw))) : 20) * 1e3;
}
function registerSessionRotationFallback(previousDigest, nextDigest) {
	sessionRotationFallbacks.set(previousDigest, {
		nextTokenDigest: nextDigest,
		expiresAtMs: Date.now() + sessionRotationGraceMs()
	});
}
function resolveSessionRotationFallback(digest) {
	const fallback = sessionRotationFallbacks.get(digest);
	if (!fallback) return null;
	if (fallback.expiresAtMs <= Date.now()) {
		sessionRotationFallbacks.delete(digest);
		return null;
	}
	return fallback.nextTokenDigest;
}
function shouldRotateSessionByLastLogin(lastLoginAtIso) {
	const lastLoginAtMs = new Date(lastLoginAtIso).getTime();
	if (!Number.isFinite(lastLoginAtMs)) return true;
	return Date.now() - lastLoginAtMs >= sessionRotationIntervalMs();
}
function passwordResetExpiryIso() {
	return new Date(Date.now() + PASSWORD_RESET_DURATION_MS).toISOString();
}
function hashToken(token) {
	return createHash("sha256").update(token).digest("hex");
}
function isSessionExpired(session) {
	return new Date(session.expiresAt).getTime() <= Date.now();
}
function retentionByBusiness(users) {
	const byBusiness = {
		"Produtor digital": 0,
		Infoprodutor: 0,
		Afiliado: 0,
		"Agência": 0,
		"E-commerce": 0,
		"Serviços": 0
	};
	for (const user of users) byBusiness[user.businessType] += 1;
	return byBusiness;
}
async function readStoreFile() {
	try {
		const raw = await readFile(storePath, "utf8");
		const parsed = JSON.parse(raw);
		return {
			users: Array.isArray(parsed.users) ? parsed.users : [],
			sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
			passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
			notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
		};
	} catch {
		return { ...emptyStore };
	}
}
async function writeStoreFile(store) {
	await mkdir(dirname(storePath), { recursive: true });
	await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
function shouldRunSessionCleanup(now) {
	return now - lastSessionCleanupAt >= SESSION_CLEANUP_INTERVAL_MS;
}
async function cleanupExpiredSessionsLocal(force = false) {
	const now = Date.now();
	if (!force && !shouldRunSessionCleanup(now)) return;
	const store = await readStoreFile();
	const activeSessions = store.sessions.filter((candidate) => !isSessionExpired(candidate));
	if (activeSessions.length !== store.sessions.length) {
		store.sessions = activeSessions;
		await writeStoreFile(store);
	}
	lastSessionCleanupAt = now;
}
async function cleanupExpiredSessionsPostgres(force = false) {
	const now = Date.now();
	if (!force && !shouldRunSessionCleanup(now)) return;
	await ensureDatabaseSchema();
	await postgresQuery(`DELETE FROM sessions WHERE expires_at <= NOW()`);
	lastSessionCleanupAt = now;
}
async function cleanupExpiredSessionsSqlite(force = false) {
	const now = Date.now();
	if (!force && !shouldRunSessionCleanup(now)) return;
	await sqliteRun(`DELETE FROM sessions WHERE expires_at <= ?`, [nowIso()]);
	lastSessionCleanupAt = now;
}
function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, passwordHash) {
	const [salt, storedKey] = passwordHash.split(":");
	if (!salt || !storedKey) return false;
	const derivedKey = scryptSync(password, salt, 64);
	const storedKeyBuffer = Buffer.from(storedKey, "hex");
	if (storedKeyBuffer.length !== derivedKey.length) return false;
	return timingSafeEqual(storedKeyBuffer, derivedKey);
}
function mapUserRow(row) {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		businessType: row.business_type,
		passwordHash: row.password_hash,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	};
}
function toProductRecord(row) {
	return {
		id: row.id,
		ownerUserId: row.owner_user_id,
		name: row.name,
		description: row.description,
		category: row.category,
		priceCents: Number(row.price_cents),
		status: row.status,
		moderationStatus: toModerationStatus(row.moderation_status),
		moderationReason: row.moderation_reason ?? null,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString(),
		publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null
	};
}
function validateProductOwnership(userId, product) {
	if (product.ownerUserId !== userId) throw new Error("Produto não encontrado para este usuário.");
}
function createId(seed) {
	return createHash("sha256").update(seed).digest("hex").slice(0, 24);
}
async function listMyProductsPostgres(userId) {
	return (await postgresQuery(`SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE owner_user_id = $1
     ORDER BY created_at DESC`, [userId])).map(toProductRecord);
}
async function listMyProductsSqlite(userId) {
	return (await sqliteAll(`SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE owner_user_id = ?
     ORDER BY created_at DESC`, [userId])).map(toProductRecord);
}
async function listMarketplaceProductsPostgres() {
	return (await postgresQuery(`SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE status = 'published'
       AND COALESCE(moderation_status, 'approved') <> 'rejected'
     ORDER BY published_at DESC NULLS LAST, created_at DESC`)).map(toProductRecord);
}
async function listMarketplaceProductsSqlite() {
	return (await sqliteAll(`SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE status = 'published'
       AND IFNULL(moderation_status, 'approved') <> 'rejected'
     ORDER BY published_at DESC, created_at DESC`)).map(toProductRecord);
}
async function createProductPostgres(userId, input) {
	const now = nowIso();
	const product = {
		id: createId(`${userId}:${input.name}:${now}`),
		ownerUserId: userId,
		name: input.name.trim(),
		description: input.description.trim(),
		category: input.category.trim(),
		priceCents: Math.max(100, Math.round(input.priceCents)),
		status: "draft",
		moderationStatus: "pending_review",
		moderationReason: null,
		createdAt: now,
		updatedAt: now,
		publishedAt: null
	};
	await postgresQuery(`INSERT INTO products (id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [
		product.id,
		product.ownerUserId,
		product.name,
		product.description,
		product.category,
		product.priceCents,
		product.status,
		product.moderationStatus,
		product.moderationReason,
		product.createdAt,
		product.updatedAt,
		product.publishedAt
	]);
	return product;
}
async function createProductSqlite(userId, input) {
	const now = nowIso();
	const product = {
		id: createId(`${userId}:${input.name}:${now}`),
		ownerUserId: userId,
		name: input.name.trim(),
		description: input.description.trim(),
		category: input.category.trim(),
		priceCents: Math.max(100, Math.round(input.priceCents)),
		status: "draft",
		moderationStatus: "pending_review",
		moderationReason: null,
		createdAt: now,
		updatedAt: now,
		publishedAt: null
	};
	await sqliteRun(`INSERT INTO products (id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
		product.id,
		product.ownerUserId,
		product.name,
		product.description,
		product.category,
		product.priceCents,
		product.status,
		product.moderationStatus,
		product.moderationReason,
		product.createdAt,
		product.updatedAt,
		product.publishedAt
	]);
	return product;
}
async function publishProductPostgres(userId, productId) {
	const rows = await postgresQuery(`SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
     LIMIT 1`, [productId]);
	const current = rows[0] ? toProductRecord(rows[0]) : null;
	if (!current) throw new Error("Produto não encontrado.");
	validateProductOwnership(userId, current);
	const now = nowIso();
	await postgresQuery(`UPDATE products
     SET status = 'published', moderation_status = 'pending_review', moderation_reason = NULL, updated_at = $2, published_at = COALESCE(published_at, $2)
     WHERE id = $1`, [productId, now]);
	await ensureDefaultLearningTrackPostgres({
		...current,
		status: "published",
		moderationStatus: "pending_review",
		moderationReason: null,
		updatedAt: now,
		publishedAt: current.publishedAt ?? now
	});
	return {
		...current,
		status: "published",
		moderationStatus: "pending_review",
		moderationReason: null,
		updatedAt: now,
		publishedAt: current.publishedAt ?? now
	};
}
async function publishProductSqlite(userId, productId) {
	const row = await sqliteGet(`SELECT id, owner_user_id, name, description, category, price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
     LIMIT 1`, [productId]);
	const current = row ? toProductRecord(row) : null;
	if (!current) throw new Error("Produto não encontrado.");
	validateProductOwnership(userId, current);
	const now = nowIso();
	await sqliteRun(`UPDATE products
     SET status = 'published', moderation_status = 'pending_review', moderation_reason = NULL, updated_at = ?, published_at = COALESCE(published_at, ?)
     WHERE id = ?`, [
		now,
		now,
		productId
	]);
	await ensureDefaultLearningTrackSqlite({
		...current,
		status: "published",
		moderationStatus: "pending_review",
		moderationReason: null,
		updatedAt: now,
		publishedAt: current.publishedAt ?? now
	});
	return {
		...current,
		status: "published",
		moderationStatus: "pending_review",
		moderationReason: null,
		updatedAt: now,
		publishedAt: current.publishedAt ?? now
	};
}
async function findPublishedProductPostgres(productId) {
	const rows = await postgresQuery(`SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
       AND status = 'published'
       AND COALESCE(moderation_status, 'approved') <> 'rejected'
     LIMIT 1`, [productId]);
	return rows[0] ? toProductRecord(rows[0]) : null;
}
async function findPublishedProductSqlite(productId) {
	const row = await sqliteGet(`SELECT id, owner_user_id, name, description, category, price_cents, status, moderation_status, moderation_reason, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
       AND status = 'published'
       AND IFNULL(moderation_status, 'approved') <> 'rejected'
     LIMIT 1`, [productId]);
	return row ? toProductRecord(row) : null;
}
async function ensureDefaultLearningTrackPostgres(product) {
	if ((await postgresQuery(`SELECT id FROM product_modules WHERE product_id = $1 LIMIT 1`, [product.id])).length > 0) return;
	const now = nowIso();
	const moduleId = createId(`module:${product.id}:1`);
	const lessonId = createId(`lesson:${product.id}:1`);
	await postgresQuery(`INSERT INTO product_modules (id, product_id, title, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, 1, $4, $4)`, [
		moduleId,
		product.id,
		"Módulo 1 - Introdução",
		now
	]);
	await postgresQuery(`INSERT INTO product_lessons (id, product_id, module_id, title, content, sort_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 1, $6, $6)`, [
		lessonId,
		product.id,
		moduleId,
		"Aula 1 - Boas-vindas",
		product.description,
		now
	]);
}
async function ensureDefaultLearningTrackSqlite(product) {
	if (await sqliteGet(`SELECT id FROM product_modules WHERE product_id = ? LIMIT 1`, [product.id])) return;
	const now = nowIso();
	const moduleId = createId(`module:${product.id}:1`);
	const lessonId = createId(`lesson:${product.id}:1`);
	await sqliteRun(`INSERT INTO product_modules (id, product_id, title, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)`, [
		moduleId,
		product.id,
		"Módulo 1 - Introdução",
		now,
		now
	]);
	await sqliteRun(`INSERT INTO product_lessons (id, product_id, module_id, title, content, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`, [
		lessonId,
		product.id,
		moduleId,
		"Aula 1 - Boas-vindas",
		product.description,
		now,
		now
	]);
}
async function listLearningTrackPostgres(userId, productId) {
	if ((await postgresQuery(`SELECT id FROM enrollments WHERE user_id = $1 AND product_id = $2 LIMIT 1`, [userId, productId])).length === 0) throw new Error("Sem acesso ao conteúdo deste produto.");
	const productRows = await postgresQuery(`SELECT id, owner_user_id, name, description, category, price_cents::text AS price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = $1
     LIMIT 1`, [productId]);
	if (productRows[0]) await ensureDefaultLearningTrackPostgres(toProductRecord(productRows[0]));
	const rows = await postgresQuery(`SELECT m.id AS module_id,
            m.title AS module_title,
            m.sort_order AS module_sort_order,
            l.id AS lesson_id,
            l.title AS lesson_title,
            l.content AS lesson_content,
            l.sort_order AS lesson_sort_order,
            lp.completed_at
     FROM product_modules m
     LEFT JOIN product_lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = $2
     WHERE m.product_id = $1
     ORDER BY m.sort_order ASC, l.sort_order ASC`, [productId, userId]);
	const byModule = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (!byModule.has(row.module_id)) byModule.set(row.module_id, {
			id: row.module_id,
			productId,
			title: row.module_title,
			sortOrder: Number(row.module_sort_order),
			lessons: []
		});
		if (row.lesson_id && row.lesson_title && row.lesson_content !== null) byModule.get(row.module_id)?.lessons.push({
			id: row.lesson_id,
			moduleId: row.module_id,
			title: row.lesson_title,
			content: row.lesson_content,
			sortOrder: Number(row.lesson_sort_order ?? 0),
			completed: Boolean(row.completed_at),
			completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null
		});
	}
	return Array.from(byModule.values());
}
async function listLearningTrackSqlite(userId, productId) {
	if (!await sqliteGet(`SELECT id FROM enrollments WHERE user_id = ? AND product_id = ? LIMIT 1`, [userId, productId])) throw new Error("Sem acesso ao conteúdo deste produto.");
	const productRow = await sqliteGet(`SELECT id, owner_user_id, name, description, category, price_cents, status, created_at, updated_at, published_at
     FROM products
     WHERE id = ?
     LIMIT 1`, [productId]);
	if (productRow) await ensureDefaultLearningTrackSqlite(toProductRecord(productRow));
	const rows = await sqliteAll(`SELECT m.id AS module_id,
            m.title AS module_title,
            m.sort_order AS module_sort_order,
            l.id AS lesson_id,
            l.title AS lesson_title,
            l.content AS lesson_content,
            l.sort_order AS lesson_sort_order,
            lp.completed_at
     FROM product_modules m
     LEFT JOIN product_lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE m.product_id = ?
     ORDER BY m.sort_order ASC, l.sort_order ASC`, [userId, productId]);
	const byModule = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (!byModule.has(row.module_id)) byModule.set(row.module_id, {
			id: row.module_id,
			productId,
			title: row.module_title,
			sortOrder: Number(row.module_sort_order),
			lessons: []
		});
		if (row.lesson_id && row.lesson_title && row.lesson_content !== null) byModule.get(row.module_id)?.lessons.push({
			id: row.lesson_id,
			moduleId: row.module_id,
			title: row.lesson_title,
			content: row.lesson_content,
			sortOrder: Number(row.lesson_sort_order ?? 0),
			completed: Boolean(row.completed_at),
			completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null
		});
	}
	return Array.from(byModule.values());
}
async function updateLessonProgressPostgres(userId, lessonId, completed) {
	const lesson = (await postgresQuery(`SELECT l.product_id
     FROM product_lessons l
     JOIN enrollments e ON e.product_id = l.product_id
     WHERE l.id = $1 AND e.user_id = $2
     LIMIT 1`, [lessonId, userId]))[0];
	if (!lesson) throw new Error("Aula não encontrada para este usuário.");
	const now = nowIso();
	await postgresQuery(`INSERT INTO lesson_progress (id, user_id, product_id, lesson_id, completed_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT (user_id, lesson_id)
     DO UPDATE SET completed_at = EXCLUDED.completed_at, updated_at = EXCLUDED.updated_at`, [
		createId(`lesson-progress:${userId}:${lessonId}`),
		userId,
		lesson.product_id,
		lessonId,
		completed ? now : null,
		now
	]);
	const totals = await postgresQuery(`SELECT
      (SELECT COUNT(*)::text FROM product_lessons WHERE product_id = $1) AS total_lessons,
      (SELECT COUNT(*)::text FROM lesson_progress WHERE user_id = $2 AND product_id = $1 AND completed_at IS NOT NULL) AS completed_lessons`, [lesson.product_id, userId]);
	const totalLessons = Number(totals[0]?.total_lessons ?? 0);
	const completedLessons = Number(totals[0]?.completed_lessons ?? 0);
	const progressPercent = totalLessons > 0 ? Math.round(completedLessons / totalLessons * 100) : 0;
	await postgresQuery(`UPDATE enrollments
     SET progress_percent = $1, updated_at = $2
     WHERE user_id = $3 AND product_id = $4`, [
		progressPercent,
		now,
		userId,
		lesson.product_id
	]);
	return {
		productId: lesson.product_id,
		progressPercent,
		completedLessons,
		totalLessons
	};
}
async function updateLessonProgressSqlite(userId, lessonId, completed) {
	const lesson = await sqliteGet(`SELECT l.product_id
     FROM product_lessons l
     JOIN enrollments e ON e.product_id = l.product_id
     WHERE l.id = ? AND e.user_id = ?
     LIMIT 1`, [lessonId, userId]);
	if (!lesson) throw new Error("Aula não encontrada para este usuário.");
	const now = nowIso();
	await sqliteRun(`INSERT INTO lesson_progress (id, user_id, product_id, lesson_id, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, lesson_id)
     DO UPDATE SET completed_at = excluded.completed_at, updated_at = excluded.updated_at`, [
		createId(`lesson-progress:${userId}:${lessonId}`),
		userId,
		lesson.product_id,
		lessonId,
		completed ? now : null,
		now,
		now
	]);
	const totalRow = await sqliteGet(`SELECT COUNT(*) AS total_lessons FROM product_lessons WHERE product_id = ?`, [lesson.product_id]);
	const completedRow = await sqliteGet(`SELECT COUNT(*) AS completed_lessons
     FROM lesson_progress
     WHERE user_id = ? AND product_id = ? AND completed_at IS NOT NULL`, [userId, lesson.product_id]);
	const totalLessons = Number(totalRow?.total_lessons ?? 0);
	const completedLessons = Number(completedRow?.completed_lessons ?? 0);
	const progressPercent = totalLessons > 0 ? Math.round(completedLessons / totalLessons * 100) : 0;
	await sqliteRun(`UPDATE enrollments
     SET progress_percent = ?, updated_at = ?
     WHERE user_id = ? AND product_id = ?`, [
		progressPercent,
		now,
		userId,
		lesson.product_id
	]);
	return {
		productId: lesson.product_id,
		progressPercent,
		completedLessons,
		totalLessons
	};
}
async function buyProductPostgres(userId, productId, paymentMethod) {
	const product = await findPublishedProductPostgres(productId);
	if (!product) throw new Error("Produto indisponível para compra.");
	const now = nowIso();
	const orderId = createId(`order:${userId}:${product.id}:${now}`);
	const enrollmentId = createId(`enrollment:${userId}:${product.id}:${now}`);
	await postgresQuery(`INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'approved', $6, $6)`, [
		orderId,
		userId,
		product.id,
		product.priceCents,
		paymentMethod,
		now
	]);
	await postgresQuery(`INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES ($1, $2, 'approved', $3, $4)`, [
		createId(`order-event:approved:${orderId}:${now}`),
		orderId,
		"Compra aprovada no checkout.",
		now
	]);
	await postgresQuery(`INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 0, $5, $5)
     ON CONFLICT (user_id, product_id) DO UPDATE SET updated_at = EXCLUDED.updated_at`, [
		enrollmentId,
		userId,
		product.id,
		orderId,
		now
	]);
	return {
		orderId,
		enrollmentId
	};
}
async function buyProductSqlite(userId, productId, paymentMethod) {
	const product = await findPublishedProductSqlite(productId);
	if (!product) throw new Error("Produto indisponível para compra.");
	const now = nowIso();
	const orderId = createId(`order:${userId}:${product.id}:${now}`);
	const enrollmentId = createId(`enrollment:${userId}:${product.id}:${now}`);
	await sqliteRun(`INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)`, [
		orderId,
		userId,
		product.id,
		product.priceCents,
		paymentMethod,
		now,
		now
	]);
	await sqliteRun(`INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES (?, ?, 'approved', ?, ?)`, [
		createId(`order-event:approved:${orderId}:${now}`),
		orderId,
		"Compra aprovada no checkout.",
		now
	]);
	await sqliteRun(`INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)
     ON CONFLICT(user_id, product_id) DO UPDATE SET updated_at = excluded.updated_at`, [
		enrollmentId,
		userId,
		product.id,
		orderId,
		now,
		now
	]);
	return {
		orderId,
		enrollmentId
	};
}
async function createCheckoutOrderPostgres(userId, productId, paymentMethod) {
	const product = await findPublishedProductPostgres(productId);
	if (!product) throw new Error("Produto indisponível para compra.");
	const now = nowIso();
	const orderId = createId(`order:${userId}:${product.id}:${now}`);
	const paymentProvider = resolvePaymentProviderMode();
	const paymentReference = buildPaymentReference(orderId);
	const providerStatus = "created";
	const providerPaymentId = null;
	const providerCheckoutUrl = null;
	await postgresQuery(`INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, payment_provider, provider_payment_id, provider_status, payment_reference, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $10)`, [
		orderId,
		userId,
		product.id,
		product.priceCents,
		paymentMethod,
		paymentProvider,
		providerPaymentId,
		providerStatus,
		paymentReference,
		now
	]);
	await postgresQuery(`INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES ($1, $2, 'pending', $3, $4)`, [
		createId(`order-event:pending:${orderId}:${now}`),
		orderId,
		"Pedido criado e aguardando confirmação de pagamento.",
		now
	]);
	return {
		orderId,
		status: "pending",
		paymentProvider,
		paymentReference,
		providerCheckoutUrl
	};
}
async function createCheckoutOrderSqlite(userId, productId, paymentMethod) {
	const product = await findPublishedProductSqlite(productId);
	if (!product) throw new Error("Produto indisponível para compra.");
	const now = nowIso();
	const orderId = createId(`order:${userId}:${product.id}:${now}`);
	const paymentProvider = resolvePaymentProviderMode();
	const paymentReference = buildPaymentReference(orderId);
	const providerStatus = "created";
	const providerPaymentId = null;
	const providerCheckoutUrl = null;
	await sqliteRun(`INSERT INTO orders (id, buyer_user_id, product_id, amount_cents, payment_method, payment_provider, provider_payment_id, provider_status, payment_reference, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`, [
		orderId,
		userId,
		product.id,
		product.priceCents,
		paymentMethod,
		paymentProvider,
		providerPaymentId,
		providerStatus,
		paymentReference,
		now,
		now
	]);
	await sqliteRun(`INSERT INTO order_events (id, order_id, status, note, created_at)
     VALUES (?, ?, 'pending', ?, ?)`, [
		createId(`order-event:pending:${orderId}:${now}`),
		orderId,
		"Pedido criado e aguardando confirmação de pagamento.",
		now
	]);
	return {
		orderId,
		status: "pending",
		paymentProvider,
		paymentReference,
		providerCheckoutUrl
	};
}
async function transitionOrderStatusPostgres(userId, orderId, nextStatus) {
	const current = (await postgresQuery(`SELECT id, buyer_user_id, product_id, status, updated_at
     FROM orders
     WHERE id = $1 AND buyer_user_id = $2
     LIMIT 1`, [orderId, userId]))[0];
	if (!current) throw new Error("Pedido não encontrado.");
	const currentStatus = toOrderStatus(current.status);
	if (!canTransitionOrderStatus(currentStatus, nextStatus)) throw new Error(`Transição inválida de status: ${currentStatus} -> ${nextStatus}.`);
	const now = nowIso();
	let enrollmentCreated = false;
	if (currentStatus !== nextStatus) {
		await postgresQuery(`UPDATE orders
       SET status = $1, updated_at = $2
       WHERE id = $3 AND buyer_user_id = $4`, [
			nextStatus,
			now,
			orderId,
			userId
		]);
		await postgresQuery(`INSERT INTO order_events (id, order_id, status, note, created_at)
       VALUES ($1, $2, $3, $4, $5)`, [
			createId(`order-event:${nextStatus}:${orderId}:${now}`),
			orderId,
			nextStatus,
			`Status alterado para ${nextStatus}.`,
			now
		]);
	}
	if (nextStatus === "approved" && currentStatus !== "approved") {
		await postgresQuery(`INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, $5, $5)
       ON CONFLICT (user_id, product_id) DO UPDATE SET updated_at = EXCLUDED.updated_at`, [
			createId(`enrollment:${userId}:${current.product_id}:${now}`),
			userId,
			current.product_id,
			orderId,
			now
		]);
		await createNotification(userId, "order_approved", "Compra aprovada", "Seu pagamento foi confirmado e o conteúdo já está disponível na área de membros.", "/membros");
		enrollmentCreated = true;
	}
	return {
		orderId,
		status: nextStatus,
		enrollmentCreated
	};
}
async function transitionOrderStatusSqlite(userId, orderId, nextStatus) {
	const current = await sqliteGet(`SELECT id, buyer_user_id, product_id, status, updated_at
     FROM orders
     WHERE id = ? AND buyer_user_id = ?
     LIMIT 1`, [orderId, userId]);
	if (!current) throw new Error("Pedido não encontrado.");
	const currentStatus = toOrderStatus(current.status);
	if (!canTransitionOrderStatus(currentStatus, nextStatus)) throw new Error(`Transição inválida de status: ${currentStatus} -> ${nextStatus}.`);
	const now = nowIso();
	let enrollmentCreated = false;
	if (currentStatus !== nextStatus) {
		await sqliteRun(`UPDATE orders
       SET status = ?, updated_at = ?
       WHERE id = ? AND buyer_user_id = ?`, [
			nextStatus,
			now,
			orderId,
			userId
		]);
		await sqliteRun(`INSERT INTO order_events (id, order_id, status, note, created_at)
       VALUES (?, ?, ?, ?, ?)`, [
			createId(`order-event:${nextStatus}:${orderId}:${now}`),
			orderId,
			nextStatus,
			`Status alterado para ${nextStatus}.`,
			now
		]);
	}
	if (nextStatus === "approved" && currentStatus !== "approved") {
		await sqliteRun(`INSERT INTO enrollments (id, user_id, product_id, order_id, progress_percent, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET updated_at = excluded.updated_at`, [
			createId(`enrollment:${userId}:${current.product_id}:${now}`),
			userId,
			current.product_id,
			orderId,
			now,
			now
		]);
		await createNotification(userId, "order_approved", "Compra aprovada", "Seu pagamento foi confirmado e o conteúdo já está disponível na área de membros.", "/membros");
		enrollmentCreated = true;
	}
	return {
		orderId,
		status: nextStatus,
		enrollmentCreated
	};
}
async function listMyOrdersPostgres(userId, filters) {
	const where = ["o.buyer_user_id = $1"];
	const params = [userId];
	if (filters?.status) {
		params.push(filters.status);
		where.push(`o.status = $${params.length}`);
	}
	if (filters?.productId) {
		params.push(filters.productId);
		where.push(`o.product_id = $${params.length}`);
	}
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		where.push(`o.created_at >= $${params.length}`);
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		where.push(`o.created_at <= $${params.length}`);
	}
	return (await postgresQuery(`SELECT o.id,
            o.buyer_user_id,
            o.product_id,
            p.name AS product_name,
            o.amount_cents::text AS amount_cents,
            o.payment_method,
            o.status,
            o.created_at,
            o.updated_at
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE ${where.join(" AND ")}
     ORDER BY o.created_at DESC`, params)).map((row) => ({
		id: row.id,
		buyerUserId: row.buyer_user_id,
		productId: row.product_id,
		productName: row.product_name,
		amountCents: Number(row.amount_cents),
		paymentMethod: row.payment_method,
		status: toOrderStatus(row.status),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function listMyOrdersSqlite(userId, filters) {
	const where = ["o.buyer_user_id = ?"];
	const params = [userId];
	if (filters?.status) {
		params.push(filters.status);
		where.push("o.status = ?");
	}
	if (filters?.productId) {
		params.push(filters.productId);
		where.push("o.product_id = ?");
	}
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		where.push("o.created_at >= ?");
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		where.push("o.created_at <= ?");
	}
	return (await sqliteAll(`SELECT o.id,
            o.buyer_user_id,
            o.product_id,
            p.name AS product_name,
            o.amount_cents,
            o.payment_method,
            o.status,
            o.created_at,
            o.updated_at
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE ${where.join(" AND ")}
     ORDER BY o.created_at DESC`, params)).map((row) => ({
		id: row.id,
		buyerUserId: row.buyer_user_id,
		productId: row.product_id,
		productName: row.product_name,
		amountCents: Number(row.amount_cents),
		paymentMethod: row.payment_method,
		status: toOrderStatus(row.status),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function listOrderTimelinePostgres(userId, orderId) {
	return (await postgresQuery(`SELECT e.id, e.order_id, e.status, e.note, e.created_at
     FROM order_events e
     JOIN orders o ON o.id = e.order_id
     WHERE e.order_id = $1 AND o.buyer_user_id = $2
     ORDER BY e.created_at ASC`, [orderId, userId])).map((row) => ({
		id: row.id,
		orderId: row.order_id,
		status: toOrderStatus(row.status),
		note: row.note,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listOrderTimelineSqlite(userId, orderId) {
	return (await sqliteAll(`SELECT e.id, e.order_id, e.status, e.note, e.created_at
     FROM order_events e
     JOIN orders o ON o.id = e.order_id
     WHERE e.order_id = ? AND o.buyer_user_id = ?
     ORDER BY e.created_at ASC`, [orderId, userId])).map((row) => ({
		id: row.id,
		orderId: row.order_id,
		status: toOrderStatus(row.status),
		note: row.note,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listEnrollmentsPostgres(userId) {
	return (await postgresQuery(`SELECT e.id, e.user_id, e.product_id, e.order_id, e.progress_percent::text AS progress_percent,
            e.created_at, e.updated_at, p.name AS product_name, p.description AS product_description
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     WHERE e.user_id = $1
     ORDER BY e.created_at DESC`, [userId])).map((row) => ({
		id: row.id,
		userId: row.user_id,
		productId: row.product_id,
		orderId: row.order_id,
		progressPercent: Number(row.progress_percent),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString(),
		productName: row.product_name,
		productDescription: row.product_description
	}));
}
async function listEnrollmentsSqlite(userId) {
	return (await sqliteAll(`SELECT e.id, e.user_id, e.product_id, e.order_id, e.progress_percent,
            e.created_at, e.updated_at, p.name AS product_name, p.description AS product_description
     FROM enrollments e
     JOIN products p ON p.id = e.product_id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`, [userId])).map((row) => ({
		id: row.id,
		userId: row.user_id,
		productId: row.product_id,
		orderId: row.order_id,
		progressPercent: Number(row.progress_percent),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString(),
		productName: row.product_name,
		productDescription: row.product_description
	}));
}
async function getFinanceSummaryPostgres(userId) {
	const grossRow = await postgresQuery(`SELECT COALESCE(SUM(o.amount_cents), 0)::text AS total
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE p.owner_user_id = $1 AND o.status = 'approved'`, [userId]);
	const withdrawRows = await postgresQuery(`SELECT status, COALESCE(SUM(amount_cents), 0)::text AS total
     FROM withdrawals
     WHERE user_id = $1 AND status IN ('requested', 'approved')
     GROUP BY status`, [userId]);
	const recentRows = await postgresQuery(`SELECT id, amount_cents::text AS amount_cents, method, status, created_at
     FROM withdrawals
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 10`, [userId]);
	const grossSalesCents = Number(grossRow[0]?.total ?? 0);
	const withdrawRequestedCents = Number(withdrawRows.find((row) => row.status === "requested")?.total ?? 0);
	const withdrawApprovedCents = Number(withdrawRows.find((row) => row.status === "approved")?.total ?? 0);
	const reservedWithdrawCents = withdrawRequestedCents + withdrawApprovedCents;
	const platformFeeCents = Math.round(grossSalesCents * PLATFORM_FEE_RATE);
	const netSalesCents = Math.max(0, grossSalesCents - platformFeeCents);
	return {
		grossSalesCents,
		platformFeeRate: PLATFORM_FEE_RATE,
		platformFeeCents,
		netSalesCents,
		withdrawApprovedCents,
		withdrawRequestedCents,
		reservedWithdrawCents,
		availableBalanceCents: Math.max(0, netSalesCents - reservedWithdrawCents),
		recentWithdrawals: recentRows.map((row) => ({
			id: row.id,
			amountCents: Number(row.amount_cents),
			method: row.method,
			status: row.status,
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
async function getFinanceSummarySqlite(userId) {
	const grossRow = await sqliteGet(`SELECT COALESCE(SUM(o.amount_cents), 0) AS total
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE p.owner_user_id = ? AND o.status = 'approved'`, [userId]);
	const withdrawRows = await sqliteAll(`SELECT status, COALESCE(SUM(amount_cents), 0) AS total
     FROM withdrawals
     WHERE user_id = ? AND status IN ('requested', 'approved')
     GROUP BY status`, [userId]);
	const recentRows = await sqliteAll(`SELECT id, amount_cents, method, status, created_at
     FROM withdrawals
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 10`, [userId]);
	const grossSalesCents = Number(grossRow?.total ?? 0);
	const withdrawRequestedCents = Number(withdrawRows.find((row) => row.status === "requested")?.total ?? 0);
	const withdrawApprovedCents = Number(withdrawRows.find((row) => row.status === "approved")?.total ?? 0);
	const reservedWithdrawCents = withdrawRequestedCents + withdrawApprovedCents;
	const platformFeeCents = Math.round(grossSalesCents * PLATFORM_FEE_RATE);
	const netSalesCents = Math.max(0, grossSalesCents - platformFeeCents);
	return {
		grossSalesCents,
		platformFeeRate: PLATFORM_FEE_RATE,
		platformFeeCents,
		netSalesCents,
		withdrawApprovedCents,
		withdrawRequestedCents,
		reservedWithdrawCents,
		availableBalanceCents: Math.max(0, netSalesCents - reservedWithdrawCents),
		recentWithdrawals: recentRows.map((row) => ({
			id: row.id,
			amountCents: Number(row.amount_cents),
			method: row.method,
			status: row.status,
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
function mapNotificationRow(row) {
	return {
		id: row.id,
		userId: row.user_id,
		type: row.type,
		title: row.title,
		message: row.message,
		link: row.link,
		readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
		createdAt: new Date(row.created_at).toISOString()
	};
}
async function createNotificationPostgres(userId, type, title, message, link) {
	const now = nowIso();
	await postgresQuery(`INSERT INTO notifications (id, user_id, type, title, message, link, read_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NULL, $7)`, [
		createId(`notification:${type}:${userId}:${now}:${title}`),
		userId,
		type,
		title,
		message,
		link,
		now
	]);
}
async function createNotificationSqlite(userId, type, title, message, link) {
	const now = nowIso();
	await sqliteRun(`INSERT INTO notifications (id, user_id, type, title, message, link, read_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`, [
		createId(`notification:${type}:${userId}:${now}:${title}`),
		userId,
		type,
		title,
		message,
		link,
		now
	]);
}
async function createNotificationLocal(userId, type, title, message, link) {
	const store = await readStoreFile();
	const now = nowIso();
	store.notifications.unshift({
		id: createId(`notification:${type}:${userId}:${now}:${title}`),
		userId,
		type,
		title,
		message,
		link,
		readAt: null,
		createdAt: now
	});
	store.notifications = store.notifications.slice(0, 200);
	await writeStoreFile(store);
}
async function createNotification(userId, type, title, message, link) {
	if (isPostgresEnabled()) {
		await createNotificationPostgres(userId, type, title, message, link);
		return;
	}
	if (isSqliteEnabled()) {
		await createNotificationSqlite(userId, type, title, message, link);
		return;
	}
	await createNotificationLocal(userId, type, title, message, link);
}
async function listNotificationsPostgres(userId, limit) {
	return (await postgresQuery(`SELECT id, user_id, type, title, message, link, read_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`, [userId, Math.max(1, Math.min(100, Math.floor(limit)))])).map(mapNotificationRow);
}
async function listNotificationsSqlite(userId, limit) {
	return (await sqliteAll(`SELECT id, user_id, type, title, message, link, read_at, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`, [userId, Math.max(1, Math.min(100, Math.floor(limit)))])).map(mapNotificationRow);
}
async function listNotificationsLocal(userId, limit) {
	const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
	return (await readStoreFile()).notifications.filter((item) => item.userId === userId).sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, safeLimit);
}
async function markNotificationReadPostgres(userId, notificationId) {
	await postgresQuery(`UPDATE notifications
     SET read_at = COALESCE(read_at, $3)
     WHERE user_id = $1 AND id = $2`, [
		userId,
		notificationId,
		nowIso()
	]);
}
async function markNotificationReadSqlite(userId, notificationId) {
	await sqliteRun(`UPDATE notifications
     SET read_at = COALESCE(read_at, ?)
     WHERE user_id = ? AND id = ?`, [
		nowIso(),
		userId,
		notificationId
	]);
}
async function markNotificationReadLocal(userId, notificationId) {
	const store = await readStoreFile();
	const now = nowIso();
	store.notifications = store.notifications.map((item) => item.userId === userId && item.id === notificationId && !item.readAt ? {
		...item,
		readAt: now
	} : item);
	await writeStoreFile(store);
}
async function markAllNotificationsReadPostgres(userId) {
	await postgresQuery(`UPDATE notifications
     SET read_at = COALESCE(read_at, $2)
     WHERE user_id = $1`, [userId, nowIso()]);
}
async function markAllNotificationsReadSqlite(userId) {
	await sqliteRun(`UPDATE notifications
     SET read_at = COALESCE(read_at, ?)
     WHERE user_id = ?`, [nowIso(), userId]);
}
async function markAllNotificationsReadLocal(userId) {
	const store = await readStoreFile();
	const now = nowIso();
	store.notifications = store.notifications.map((item) => item.userId === userId && !item.readAt ? {
		...item,
		readAt: now
	} : item);
	await writeStoreFile(store);
}
async function requestWithdrawalPostgres(userId, amountCents, method) {
	const summary = await getFinanceSummaryPostgres(userId);
	const normalizedAmount = Math.max(100, Math.round(amountCents));
	if (normalizedAmount > summary.availableBalanceCents) throw new Error("Saldo insuficiente para saque.");
	const now = nowIso();
	const id = createId(`withdraw:${userId}:${now}:${normalizedAmount}`);
	await postgresQuery(`INSERT INTO withdrawals (id, user_id, amount_cents, method, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'requested', $5, $5)`, [
		id,
		userId,
		normalizedAmount,
		method,
		now
	]);
	await createNotification(userId, "withdrawal_requested", "Saque solicitado", "Recebemos sua solicitação de saque e ela já está em análise.", "/financeiro");
	return { id };
}
async function requestWithdrawalSqlite(userId, amountCents, method) {
	const summary = await getFinanceSummarySqlite(userId);
	const normalizedAmount = Math.max(100, Math.round(amountCents));
	if (normalizedAmount > summary.availableBalanceCents) throw new Error("Saldo insuficiente para saque.");
	const now = nowIso();
	const id = createId(`withdraw:${userId}:${now}:${normalizedAmount}`);
	await sqliteRun(`INSERT INTO withdrawals (id, user_id, amount_cents, method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'requested', ?, ?)`, [
		id,
		userId,
		normalizedAmount,
		method,
		now,
		now
	]);
	await createNotification(userId, "withdrawal_requested", "Saque solicitado", "Recebemos sua solicitação de saque e ela já está em análise.", "/financeiro");
	return { id };
}
async function getAffiliateSummaryPostgres(userId) {
	const row = (await postgresQuery(`SELECT id, status, referral_code, note, created_at, updated_at
     FROM affiliates
     WHERE user_id = $1
     LIMIT 1`, [userId]))[0];
	if (!row) return null;
	return {
		id: row.id,
		status: row.status,
		referralCode: row.referral_code,
		referralLink: `/marketplace?ref=${encodeURIComponent(row.referral_code)}`,
		note: row.note,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	};
}
async function getAffiliateSummarySqlite(userId) {
	const row = await sqliteGet(`SELECT id, status, referral_code, note, created_at, updated_at
     FROM affiliates
     WHERE user_id = ?
     LIMIT 1`, [userId]);
	if (!row) return null;
	return {
		id: row.id,
		status: row.status,
		referralCode: row.referral_code,
		referralLink: `/marketplace?ref=${encodeURIComponent(row.referral_code)}`,
		note: row.note,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	};
}
async function requestAffiliatePostgres(userId) {
	const now = nowIso();
	const existing = await getAffiliateSummaryPostgres(userId);
	if (existing) {
		if (existing.status !== "pending") {
			await postgresQuery(`UPDATE affiliates
         SET status = 'pending', note = NULL, updated_at = $2
         WHERE user_id = $1`, [userId, now]);
			const refreshed = await getAffiliateSummaryPostgres(userId);
			if (refreshed) return refreshed;
		}
		return existing;
	}
	await postgresQuery(`INSERT INTO affiliates (id, user_id, status, referral_code, note, created_at, updated_at)
     VALUES ($1, $2, 'pending', $3, NULL, $4, $4)`, [
		createId(`affiliate:${userId}:${now}`),
		userId,
		createHash("sha256").update(`ref:${userId}`).digest("hex").slice(0, 10),
		now
	]);
	await createNotification(userId, "affiliate_pending", "Afiliação solicitada", "Sua solicitação de afiliação foi registrada e está em análise.", "/afiliados");
	const created = await getAffiliateSummaryPostgres(userId);
	if (!created) throw new Error("Não foi possível criar solicitação de afiliação.");
	return created;
}
async function requestAffiliateSqlite(userId) {
	const now = nowIso();
	const existing = await getAffiliateSummarySqlite(userId);
	if (existing) {
		if (existing.status !== "pending") {
			await sqliteRun(`UPDATE affiliates
         SET status = 'pending', note = NULL, updated_at = ?
         WHERE user_id = ?`, [now, userId]);
			const refreshed = await getAffiliateSummarySqlite(userId);
			if (refreshed) return refreshed;
		}
		return existing;
	}
	await sqliteRun(`INSERT INTO affiliates (id, user_id, status, referral_code, note, created_at, updated_at)
     VALUES (?, ?, 'pending', ?, NULL, ?, ?)`, [
		createId(`affiliate:${userId}:${now}`),
		userId,
		createHash("sha256").update(`ref:${userId}`).digest("hex").slice(0, 10),
		now,
		now
	]);
	await createNotification(userId, "affiliate_pending", "Afiliação solicitada", "Sua solicitação de afiliação foi registrada e está em análise.", "/afiliados");
	const created = await getAffiliateSummarySqlite(userId);
	if (!created) throw new Error("Não foi possível criar solicitação de afiliação.");
	return created;
}
async function listUsersPostgres() {
	await ensureDatabaseSchema();
	return (await postgresQuery(`SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`)).map(mapUserRow);
}
async function createUserPostgres(input) {
	await ensureDatabaseSchema();
	const email = normalizeEmail(input.email);
	if ((await postgresQuery(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])).length > 0) throw new Error("Já existe um cadastro com este email.");
	const now = nowIso();
	const user = {
		id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
		name: input.name.trim(),
		email,
		businessType: input.businessType,
		passwordHash: hashPassword(input.password),
		createdAt: now,
		updatedAt: now
	};
	await postgresQuery(`INSERT INTO users (id, name, email, business_type, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
		user.id,
		user.name,
		user.email,
		user.businessType,
		user.passwordHash,
		user.createdAt,
		user.updatedAt
	]);
	return user;
}
async function findUserByEmailPostgres(emailInput) {
	await ensureDatabaseSchema();
	const rows = await postgresQuery(`SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`, [normalizeEmail(emailInput)]);
	return rows[0] ? mapUserRow(rows[0]) : null;
}
async function authenticateUserPostgres(input) {
	const user = await findUserByEmailPostgres(input.email);
	if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("Email ou senha inválidos.");
	user.updatedAt = nowIso();
	await postgresQuery(`UPDATE users SET updated_at = $2 WHERE id = $1`, [user.id, user.updatedAt]);
	return user;
}
async function authenticateOrCreateGoogleUserPostgres(input) {
	const existing = await findUserByEmailPostgres(input.email);
	const normalizedName = input.name.trim() || input.email;
	if (existing) {
		const updatedAt = nowIso();
		await postgresQuery(`UPDATE users SET name = $2, updated_at = $3 WHERE id = $1`, [
			existing.id,
			normalizedName,
			updatedAt
		]);
		existing.name = normalizedName;
		existing.updatedAt = updatedAt;
		return existing;
	}
	return createUserPostgres({
		name: normalizedName,
		email: input.email,
		password: randomBytes(24).toString("hex"),
		businessType: input.businessType ?? GOOGLE_ACCOUNT_DEFAULT_BUSINESS
	});
}
async function createSessionPostgres(userId) {
	await ensureDatabaseSchema();
	await cleanupExpiredSessionsPostgres();
	const now = nowIso();
	const token = randomBytes(24).toString("hex");
	const tokenDigest = hashToken(token);
	const expiresAt = sessionExpiryIso();
	await postgresQuery(`DELETE FROM sessions WHERE user_id = $1 OR expires_at <= NOW()`, [userId]);
	await postgresQuery(`INSERT INTO sessions (token_hash, user_id, created_at, last_login_at, expires_at)
     VALUES ($1, $2, $3, $4, $5)`, [
		tokenDigest,
		userId,
		now,
		now,
		expiresAt
	]);
	return {
		tokenHash: token,
		userId,
		createdAt: now,
		lastLoginAt: now,
		expiresAt
	};
}
async function getSessionPostgres(token) {
	await ensureDatabaseSchema();
	await cleanupExpiredSessionsPostgres();
	const tokenDigest = hashToken(token);
	const queryRowsByDigest = async (digest) => postgresQuery(`SELECT s.token_hash, s.user_id, s.created_at, s.last_login_at, s.expires_at,
            u.id, u.name, u.email, u.business_type, u.password_hash,
            u.created_at AS user_created_at, u.updated_at AS user_updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
     LIMIT 1`, [digest]);
	let rows = await queryRowsByDigest(tokenDigest);
	let row = rows[0];
	let resolvedDigest = tokenDigest;
	if (!row) {
		const fallbackDigest = resolveSessionRotationFallback(tokenDigest);
		if (fallbackDigest) {
			rows = await queryRowsByDigest(fallbackDigest);
			row = rows[0];
			resolvedDigest = fallbackDigest;
		}
	}
	if (!row) return null;
	const updatedAt = nowIso();
	await postgresQuery(`UPDATE sessions SET last_login_at = $2 WHERE token_hash = $1`, [resolvedDigest, updatedAt]);
	return {
		session: {
			tokenHash: row.token_hash,
			userId: row.user_id,
			createdAt: new Date(row.created_at).toISOString(),
			lastLoginAt: updatedAt,
			expiresAt: new Date(row.expires_at).toISOString()
		},
		user: {
			id: row.id,
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			passwordHash: row.password_hash,
			createdAt: new Date(row.user_created_at).toISOString(),
			updatedAt: new Date(row.user_updated_at).toISOString()
		}
	};
}
async function deleteSessionPostgres(token) {
	await ensureDatabaseSchema();
	await postgresQuery(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)]);
}
async function requestPasswordResetPostgres(emailInput) {
	await ensureDatabaseSchema();
	const user = await findUserByEmailPostgres(emailInput);
	if (!user) return { ok: true };
	const createdAt = nowIso();
	const expiresAt = passwordResetExpiryIso();
	const token = randomBytes(24).toString("hex");
	const tokenDigest = hashToken(token);
	await postgresQuery(`DELETE FROM password_resets WHERE user_id = $1 OR expires_at <= NOW() OR used_at IS NOT NULL`, [user.id]);
	await postgresQuery(`INSERT INTO password_resets (token_hash, user_id, created_at, expires_at, used_at)
     VALUES ($1, $2, $3, $4, NULL)`, [
		tokenDigest,
		user.id,
		createdAt,
		expiresAt
	]);
	return {
		ok: true,
		resetToken: token
	};
}
async function resetPasswordWithTokenPostgres(token, newPassword) {
	await ensureDatabaseSchema();
	const tokenDigest = hashToken(token);
	const reset = (await postgresQuery(`SELECT user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = $1
     LIMIT 1`, [tokenDigest]))[0];
	if (!reset) throw new Error("Token de recuperação inválido.");
	if (reset.used_at) throw new Error("Este token já foi utilizado.");
	if (new Date(reset.expires_at).getTime() <= Date.now()) throw new Error("Token de recuperação expirado.");
	const updatedAt = nowIso();
	await postgresQuery(`UPDATE users SET password_hash = $2, updated_at = $3 WHERE id = $1`, [
		reset.user_id,
		hashPassword(newPassword),
		updatedAt
	]);
	await postgresQuery(`UPDATE password_resets SET used_at = $2 WHERE token_hash = $1`, [tokenDigest, updatedAt]);
	await postgresQuery(`DELETE FROM sessions WHERE user_id = $1`, [reset.user_id]);
}
async function listUsersSqlite() {
	return (await sqliteAll(`SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`)).map((row) => mapUserRow({
		...row,
		created_at: row.created_at,
		updated_at: row.updated_at
	}));
}
async function createUserSqlite(input) {
	const email = normalizeEmail(input.email);
	if (await sqliteGet(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email])) throw new Error("Já existe um cadastro com este email.");
	const now = nowIso();
	const user = {
		id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
		name: input.name.trim(),
		email,
		businessType: input.businessType,
		passwordHash: hashPassword(input.password),
		createdAt: now,
		updatedAt: now
	};
	await sqliteRun(`INSERT INTO users (id, name, email, business_type, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
		user.id,
		user.name,
		user.email,
		user.businessType,
		user.passwordHash,
		user.createdAt,
		user.updatedAt
	]);
	return user;
}
async function findUserByEmailSqlite(emailInput) {
	const row = await sqliteGet(`SELECT id, name, email, business_type, password_hash, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`, [normalizeEmail(emailInput)]);
	if (!row) return null;
	return mapUserRow({
		...row,
		created_at: row.created_at,
		updated_at: row.updated_at
	});
}
async function authenticateUserSqlite(input) {
	const user = await findUserByEmailSqlite(input.email);
	if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("Email ou senha inválidos.");
	user.updatedAt = nowIso();
	await sqliteRun(`UPDATE users SET updated_at = ? WHERE id = ?`, [user.updatedAt, user.id]);
	return user;
}
async function authenticateOrCreateGoogleUserSqlite(input) {
	const existing = await findUserByEmailSqlite(input.email);
	const normalizedName = input.name.trim() || input.email;
	if (existing) {
		const updatedAt = nowIso();
		await sqliteRun(`UPDATE users SET name = ?, updated_at = ? WHERE id = ?`, [
			normalizedName,
			updatedAt,
			existing.id
		]);
		existing.name = normalizedName;
		existing.updatedAt = updatedAt;
		return existing;
	}
	return createUserSqlite({
		name: normalizedName,
		email: input.email,
		password: randomBytes(24).toString("hex"),
		businessType: input.businessType ?? GOOGLE_ACCOUNT_DEFAULT_BUSINESS
	});
}
async function createSessionSqlite(userId) {
	await cleanupExpiredSessionsSqlite();
	const now = nowIso();
	const token = randomBytes(24).toString("hex");
	const tokenDigest = hashToken(token);
	const expiresAt = sessionExpiryIso();
	await sqliteRun(`DELETE FROM sessions WHERE user_id = ? OR expires_at <= ?`, [userId, now]);
	await sqliteRun(`INSERT INTO sessions (token_hash, user_id, created_at, last_login_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`, [
		tokenDigest,
		userId,
		now,
		now,
		expiresAt
	]);
	return {
		tokenHash: token,
		userId,
		createdAt: now,
		lastLoginAt: now,
		expiresAt
	};
}
async function getSessionSqlite(token) {
	await cleanupExpiredSessionsSqlite();
	const tokenDigest = hashToken(token);
	const queryRowByDigest = async (digest) => sqliteGet(`SELECT s.token_hash, s.user_id, s.created_at, s.last_login_at, s.expires_at,
            u.id, u.name, u.email, u.business_type, u.password_hash,
            u.created_at AS user_created_at, u.updated_at AS user_updated_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?
     LIMIT 1`, [digest]);
	let row = await queryRowByDigest(tokenDigest);
	let resolvedDigest = tokenDigest;
	if (!row) {
		const fallbackDigest = resolveSessionRotationFallback(tokenDigest);
		if (fallbackDigest) {
			row = await queryRowByDigest(fallbackDigest);
			resolvedDigest = fallbackDigest;
		}
	}
	if (!row) return null;
	const updatedAt = nowIso();
	await sqliteRun(`UPDATE sessions SET last_login_at = ? WHERE token_hash = ?`, [updatedAt, resolvedDigest]);
	return {
		session: {
			tokenHash: row.token_hash,
			userId: row.user_id,
			createdAt: new Date(row.created_at).toISOString(),
			lastLoginAt: updatedAt,
			expiresAt: new Date(row.expires_at).toISOString()
		},
		user: {
			id: row.id,
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			passwordHash: row.password_hash,
			createdAt: new Date(row.user_created_at).toISOString(),
			updatedAt: new Date(row.user_updated_at).toISOString()
		}
	};
}
async function deleteSessionSqlite(token) {
	await sqliteRun(`DELETE FROM sessions WHERE token_hash = ?`, [hashToken(token)]);
}
async function requestPasswordResetSqlite(emailInput) {
	const user = await findUserByEmailSqlite(emailInput);
	if (!user) return { ok: true };
	const createdAt = nowIso();
	const expiresAt = passwordResetExpiryIso();
	const token = randomBytes(24).toString("hex");
	const tokenDigest = hashToken(token);
	await sqliteRun(`DELETE FROM password_resets WHERE user_id = ? OR expires_at <= ? OR used_at IS NOT NULL`, [user.id, createdAt]);
	await sqliteRun(`INSERT INTO password_resets (token_hash, user_id, created_at, expires_at, used_at)
     VALUES (?, ?, ?, ?, NULL)`, [
		tokenDigest,
		user.id,
		createdAt,
		expiresAt
	]);
	return {
		ok: true,
		resetToken: token
	};
}
async function resetPasswordWithTokenSqlite(token, newPassword) {
	const tokenDigest = hashToken(token);
	const reset = await sqliteGet(`SELECT user_id, expires_at, used_at
     FROM password_resets
     WHERE token_hash = ?
     LIMIT 1`, [tokenDigest]);
	if (!reset) throw new Error("Token de recuperação inválido.");
	if (reset.used_at) throw new Error("Este token já foi utilizado.");
	if (new Date(reset.expires_at).getTime() <= Date.now()) throw new Error("Token de recuperação expirado.");
	const updatedAt = nowIso();
	await sqliteRun(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`, [
		hashPassword(newPassword),
		updatedAt,
		reset.user_id
	]);
	await sqliteRun(`UPDATE password_resets SET used_at = ? WHERE token_hash = ?`, [updatedAt, tokenDigest]);
	await sqliteRun(`DELETE FROM sessions WHERE user_id = ?`, [reset.user_id]);
}
async function rotateSessionSqlite(token) {
	await cleanupExpiredSessionsSqlite();
	const oldDigest = hashToken(token);
	const row = await sqliteGet(`SELECT user_id, created_at, last_login_at FROM sessions WHERE token_hash = ? LIMIT 1`, [oldDigest]);
	if (!row) return null;
	if (!shouldRotateSessionByLastLogin(row.last_login_at)) return null;
	const rotatedToken = randomBytes(24).toString("hex");
	const rotatedDigest = hashToken(rotatedToken);
	const lastLoginAt = nowIso();
	const expiresAt = sessionExpiryIso();
	await sqliteRun(`UPDATE sessions
     SET token_hash = ?,
         last_login_at = ?,
         expires_at = ?
     WHERE token_hash = ?`, [
		rotatedDigest,
		lastLoginAt,
		expiresAt,
		oldDigest
	]);
	registerSessionRotationFallback(oldDigest, rotatedDigest);
	return {
		token: rotatedToken,
		session: {
			tokenHash: rotatedDigest,
			userId: row.user_id,
			createdAt: new Date(row.created_at).toISOString(),
			lastLoginAt,
			expiresAt
		}
	};
}
async function getDashboardSummarySqlite() {
	await cleanupExpiredSessionsSqlite();
	const userCountRow = await sqliteGet(`SELECT COUNT(*) AS total FROM users`);
	const sessionCountRow = await sqliteGet(`SELECT COUNT(*) AS total FROM sessions`);
	const businessRows = await sqliteAll(`SELECT business_type, COUNT(*) AS total FROM users GROUP BY business_type`);
	const latestRows = await sqliteAll(`SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`);
	const sessionsExpiringSoon = (await sqliteAll(`SELECT expires_at FROM sessions`)).filter((session) => {
		const timeToExpire = new Date(session.expires_at).getTime() - Date.now();
		return timeToExpire > 0 && timeToExpire <= 36e5;
	}).length;
	const byBusiness = {
		"Produtor digital": 0,
		Infoprodutor: 0,
		Afiliado: 0,
		"Agência": 0,
		"E-commerce": 0,
		"Serviços": 0
	};
	for (const row of businessRows) {
		const key = row.business_type;
		if (key in byBusiness) byBusiness[key] = Number(row.total);
	}
	return {
		userCount: Number(userCountRow?.total ?? 0),
		sessionCount: Number(sessionCountRow?.total ?? 0),
		sessionsExpiringSoon,
		byBusiness,
		latestUsers: latestRows.map((row) => ({
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
async function getDashboardSummaryPostgres() {
	await ensureDatabaseSchema();
	await cleanupExpiredSessionsPostgres();
	const userCountRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM users`);
	const sessionCountRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM sessions`);
	const expiringRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM sessions WHERE expires_at > NOW() AND expires_at <= NOW() + INTERVAL '1 hour'`);
	const businessRows = await postgresQuery(`SELECT business_type, COUNT(*)::text AS total FROM users GROUP BY business_type`);
	const latestRows = await postgresQuery(`SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`);
	const byBusiness = {
		"Produtor digital": 0,
		Infoprodutor: 0,
		Afiliado: 0,
		"Agência": 0,
		"E-commerce": 0,
		"Serviços": 0
	};
	for (const row of businessRows) {
		const key = row.business_type;
		if (key in byBusiness) byBusiness[key] = Number(row.total);
	}
	return {
		userCount: Number(userCountRows[0]?.total ?? 0),
		sessionCount: Number(sessionCountRows[0]?.total ?? 0),
		sessionsExpiringSoon: Number(expiringRows[0]?.total ?? 0),
		byBusiness,
		latestUsers: latestRows.map((row) => ({
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
async function listUsers() {
	if (isPostgresEnabled()) return listUsersPostgres();
	if (isSqliteEnabled()) return listUsersSqlite();
	return [...(await readStoreFile()).users].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
async function createUser(input) {
	if (isPostgresEnabled()) return createUserPostgres(input);
	if (isSqliteEnabled()) return createUserSqlite(input);
	const store = await readStoreFile();
	const email = normalizeEmail(input.email);
	if (store.users.some((user) => normalizeEmail(user.email) === email)) throw new Error("Já existe um cadastro com este email.");
	const now = nowIso();
	const user = {
		id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
		name: input.name.trim(),
		email,
		businessType: input.businessType,
		passwordHash: hashPassword(input.password),
		createdAt: now,
		updatedAt: now
	};
	store.users.push(user);
	await writeStoreFile(store);
	return user;
}
async function authenticateUser(input) {
	if (isPostgresEnabled()) return authenticateUserPostgres(input);
	if (isSqliteEnabled()) return authenticateUserSqlite(input);
	const store = await readStoreFile();
	const email = normalizeEmail(input.email);
	const user = store.users.find((candidate) => normalizeEmail(candidate.email) === email);
	if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("Email ou senha inválidos.");
	user.updatedAt = nowIso();
	await writeStoreFile(store);
	return user;
}
async function authenticateOrCreateGoogleUser(input) {
	if (isPostgresEnabled()) return authenticateOrCreateGoogleUserPostgres(input);
	if (isSqliteEnabled()) return authenticateOrCreateGoogleUserSqlite(input);
	const store = await readStoreFile();
	const email = normalizeEmail(input.email);
	const normalizedName = input.name.trim() || email;
	const existing = store.users.find((candidate) => normalizeEmail(candidate.email) === email);
	if (existing) {
		existing.name = normalizedName;
		existing.updatedAt = nowIso();
		await writeStoreFile(store);
		return existing;
	}
	const now = nowIso();
	const user = {
		id: createHash("sha256").update(`${email}:${now}`).digest("hex").slice(0, 24),
		name: normalizedName,
		email,
		businessType: input.businessType ?? GOOGLE_ACCOUNT_DEFAULT_BUSINESS,
		passwordHash: hashPassword(randomBytes(24).toString("hex")),
		createdAt: now,
		updatedAt: now
	};
	store.users.push(user);
	await writeStoreFile(store);
	return user;
}
async function requestPasswordReset(emailInput) {
	if (isPostgresEnabled()) return requestPasswordResetPostgres(emailInput);
	if (isSqliteEnabled()) return requestPasswordResetSqlite(emailInput);
	const store = await readStoreFile();
	const email = normalizeEmail(emailInput);
	const user = store.users.find((candidate) => normalizeEmail(candidate.email) === email);
	if (!user) return { ok: true };
	const createdAt = nowIso();
	const expiresAt = passwordResetExpiryIso();
	const token = randomBytes(24).toString("hex");
	const tokenDigest = hashToken(token);
	store.passwordResets = store.passwordResets.filter((candidate) => candidate.userId !== user.id && candidate.expiresAt > createdAt && !candidate.usedAt);
	store.passwordResets.push({
		tokenHash: tokenDigest,
		userId: user.id,
		createdAt,
		expiresAt,
		usedAt: null
	});
	await writeStoreFile(store);
	return {
		ok: true,
		resetToken: token
	};
}
async function resetPasswordWithToken(token, newPassword) {
	if (isPostgresEnabled()) return resetPasswordWithTokenPostgres(token, newPassword);
	if (isSqliteEnabled()) return resetPasswordWithTokenSqlite(token, newPassword);
	const store = await readStoreFile();
	const tokenDigest = hashToken(token);
	const reset = store.passwordResets.find((candidate) => candidate.tokenHash === tokenDigest);
	if (!reset) throw new Error("Token de recuperação inválido.");
	if (reset.usedAt) throw new Error("Este token já foi utilizado.");
	if (new Date(reset.expiresAt).getTime() <= Date.now()) throw new Error("Token de recuperação expirado.");
	const user = store.users.find((candidate) => candidate.id === reset.userId);
	if (!user) throw new Error("Usuário não encontrado para redefinir senha.");
	const updatedAt = nowIso();
	user.passwordHash = hashPassword(newPassword);
	user.updatedAt = updatedAt;
	reset.usedAt = updatedAt;
	store.sessions = store.sessions.filter((candidate) => candidate.userId !== user.id);
	await writeStoreFile(store);
}
async function createSession(userId) {
	if (isPostgresEnabled()) return createSessionPostgres(userId);
	if (isSqliteEnabled()) return createSessionSqlite(userId);
	await cleanupExpiredSessionsLocal();
	const store = await readStoreFile();
	const now = nowIso();
	const rawToken = randomBytes(24).toString("hex");
	const expiresAt = sessionExpiryIso();
	const session = {
		tokenHash: hashToken(rawToken),
		userId,
		createdAt: now,
		lastLoginAt: now,
		expiresAt
	};
	store.sessions = store.sessions.filter((candidate) => candidate.userId !== userId && !isSessionExpired(candidate));
	store.sessions.push(session);
	await writeStoreFile(store);
	return {
		...session,
		tokenHash: rawToken
	};
}
async function getSession(token) {
	if (isPostgresEnabled()) return getSessionPostgres(token);
	if (isSqliteEnabled()) return getSessionSqlite(token);
	await cleanupExpiredSessionsLocal();
	const store = await readStoreFile();
	const tokenDigest = hashToken(token);
	const resolvedDigest = resolveSessionRotationFallback(tokenDigest) ?? tokenDigest;
	const session = store.sessions.find((candidate) => candidate.tokenHash === resolvedDigest);
	if (!session) return null;
	const user = store.users.find((candidate) => candidate.id === session.userId);
	if (!user) return null;
	session.lastLoginAt = nowIso();
	await writeStoreFile(store);
	return {
		session,
		user
	};
}
async function rotateSessionPostgres(token) {
	await ensureDatabaseSchema();
	await cleanupExpiredSessionsPostgres();
	const oldDigest = hashToken(token);
	const sessionRow = (await postgresQuery(`SELECT user_id, created_at, last_login_at FROM sessions WHERE token_hash = $1 LIMIT 1`, [oldDigest]))[0];
	if (!sessionRow) return null;
	if (!shouldRotateSessionByLastLogin(String(sessionRow.last_login_at))) return null;
	const rotatedToken = randomBytes(24).toString("hex");
	const rotatedDigest = hashToken(rotatedToken);
	const lastLoginAt = nowIso();
	const expiresAt = sessionExpiryIso();
	await postgresQuery(`UPDATE sessions
     SET token_hash = $2,
         last_login_at = $3,
         expires_at = $4
     WHERE token_hash = $1`, [
		oldDigest,
		rotatedDigest,
		lastLoginAt,
		expiresAt
	]);
	registerSessionRotationFallback(oldDigest, rotatedDigest);
	return {
		token: rotatedToken,
		session: {
			tokenHash: rotatedDigest,
			userId: sessionRow.user_id,
			createdAt: new Date(sessionRow.created_at).toISOString(),
			lastLoginAt,
			expiresAt
		}
	};
}
async function rotateSessionLocal(token) {
	await cleanupExpiredSessionsLocal();
	const store = await readStoreFile();
	const tokenDigest = hashToken(token);
	const session = store.sessions.find((candidate) => candidate.tokenHash === tokenDigest);
	if (!session) return null;
	if (!shouldRotateSessionByLastLogin(session.lastLoginAt)) return null;
	const rotatedToken = randomBytes(24).toString("hex");
	const rotatedDigest = hashToken(rotatedToken);
	session.tokenHash = rotatedDigest;
	session.lastLoginAt = nowIso();
	session.expiresAt = sessionExpiryIso();
	await writeStoreFile(store);
	registerSessionRotationFallback(tokenDigest, rotatedDigest);
	return {
		token: rotatedToken,
		session: { ...session }
	};
}
async function rotateSession(token) {
	if (isPostgresEnabled()) return rotateSessionPostgres(token);
	if (isSqliteEnabled()) return rotateSessionSqlite(token);
	return rotateSessionLocal(token);
}
async function deleteSession(token) {
	if (isPostgresEnabled()) {
		await deleteSessionPostgres(token);
		return;
	}
	if (isSqliteEnabled()) {
		await deleteSessionSqlite(token);
		return;
	}
	const store = await readStoreFile();
	const tokenDigest = hashToken(token);
	store.sessions = store.sessions.filter((candidate) => candidate.tokenHash !== tokenDigest);
	await writeStoreFile(store);
}
async function listMyProducts(userId) {
	if (isPostgresEnabled()) return listMyProductsPostgres(userId);
	if (isSqliteEnabled()) return listMyProductsSqlite(userId);
	throw new Error("Persistência de produtos não configurada.");
}
async function listMarketplaceProducts() {
	if (isPostgresEnabled()) return listMarketplaceProductsPostgres();
	if (isSqliteEnabled()) return listMarketplaceProductsSqlite();
	throw new Error("Persistência de produtos não configurada.");
}
async function getMarketplaceProductById(productId) {
	if (isPostgresEnabled()) return findPublishedProductPostgres(productId);
	if (isSqliteEnabled()) return findPublishedProductSqlite(productId);
	throw new Error("Persistência de produtos não configurada.");
}
async function createProduct(userId, input) {
	if (isPostgresEnabled()) return createProductPostgres(userId, input);
	if (isSqliteEnabled()) return createProductSqlite(userId, input);
	throw new Error("Persistência de produtos não configurada.");
}
async function publishProduct(userId, productId) {
	if (isPostgresEnabled()) return publishProductPostgres(userId, productId);
	if (isSqliteEnabled()) return publishProductSqlite(userId, productId);
	throw new Error("Persistência de produtos não configurada.");
}
async function buyProduct(userId, productId, paymentMethod) {
	if (isPostgresEnabled()) return buyProductPostgres(userId, productId, paymentMethod);
	if (isSqliteEnabled()) return buyProductSqlite(userId, productId, paymentMethod);
	throw new Error("Persistência de pedidos não configurada.");
}
async function createCheckoutOrder(userId, productId, paymentMethod) {
	if (isPostgresEnabled()) return createCheckoutOrderPostgres(userId, productId, paymentMethod);
	if (isSqliteEnabled()) return createCheckoutOrderSqlite(userId, productId, paymentMethod);
	throw new Error("Persistência de pedidos não configurada.");
}
async function transitionCheckoutOrderStatus(userId, orderId, nextStatus) {
	if (isPostgresEnabled()) return transitionOrderStatusPostgres(userId, orderId, nextStatus);
	if (isSqliteEnabled()) return transitionOrderStatusSqlite(userId, orderId, nextStatus);
	throw new Error("Persistência de pedidos não configurada.");
}
async function listMyOrders(userId, filters) {
	if (isPostgresEnabled()) return listMyOrdersPostgres(userId, filters);
	if (isSqliteEnabled()) return listMyOrdersSqlite(userId, filters);
	throw new Error("Persistência de pedidos não configurada.");
}
async function listMyOrderTimeline(userId, orderId) {
	if (isPostgresEnabled()) return listOrderTimelinePostgres(userId, orderId);
	if (isSqliteEnabled()) return listOrderTimelineSqlite(userId, orderId);
	throw new Error("Persistência de pedidos não configurada.");
}
async function listMyLearningTrack(userId, productId) {
	if (isPostgresEnabled()) return listLearningTrackPostgres(userId, productId);
	if (isSqliteEnabled()) return listLearningTrackSqlite(userId, productId);
	throw new Error("Persistência de conteúdo não configurada.");
}
async function updateMyLessonProgress(userId, lessonId, completed) {
	if (isPostgresEnabled()) return updateLessonProgressPostgres(userId, lessonId, completed);
	if (isSqliteEnabled()) return updateLessonProgressSqlite(userId, lessonId, completed);
	throw new Error("Persistência de conteúdo não configurada.");
}
async function listMyEnrollments(userId) {
	if (isPostgresEnabled()) return listEnrollmentsPostgres(userId);
	if (isSqliteEnabled()) return listEnrollmentsSqlite(userId);
	throw new Error("Persistência de matrículas não configurada.");
}
async function getFinanceSummary(userId) {
	if (isPostgresEnabled()) return getFinanceSummaryPostgres(userId);
	if (isSqliteEnabled()) return getFinanceSummarySqlite(userId);
	throw new Error("Persistência financeira não configurada.");
}
async function getAffiliateSummary(userId) {
	if (isPostgresEnabled()) return getAffiliateSummaryPostgres(userId);
	if (isSqliteEnabled()) return getAffiliateSummarySqlite(userId);
	throw new Error("Persistência de afiliados não configurada.");
}
async function requestAffiliate(userId) {
	if (isPostgresEnabled()) return requestAffiliatePostgres(userId);
	if (isSqliteEnabled()) return requestAffiliateSqlite(userId);
	throw new Error("Persistência de afiliados não configurada.");
}
async function listMyNotifications(userId, limit = 20) {
	if (isPostgresEnabled()) return listNotificationsPostgres(userId, limit);
	if (isSqliteEnabled()) return listNotificationsSqlite(userId, limit);
	return listNotificationsLocal(userId, limit);
}
async function markMyNotificationRead(userId, notificationId) {
	if (isPostgresEnabled()) {
		await markNotificationReadPostgres(userId, notificationId);
		return;
	}
	if (isSqliteEnabled()) {
		await markNotificationReadSqlite(userId, notificationId);
		return;
	}
	await markNotificationReadLocal(userId, notificationId);
}
async function markAllMyNotificationsRead(userId) {
	if (isPostgresEnabled()) {
		await markAllNotificationsReadPostgres(userId);
		return;
	}
	if (isSqliteEnabled()) {
		await markAllNotificationsReadSqlite(userId);
		return;
	}
	await markAllNotificationsReadLocal(userId);
}
async function requestWithdrawal(userId, amountCents, method) {
	if (isPostgresEnabled()) return requestWithdrawalPostgres(userId, amountCents, method);
	if (isSqliteEnabled()) return requestWithdrawalSqlite(userId, amountCents, method);
	throw new Error("Persistência financeira não configurada.");
}
async function listAdminModerationQueue(limit = 20, filters) {
	if (isPostgresEnabled()) return listAdminModerationQueuePostgres(limit, filters);
	if (isSqliteEnabled()) return listAdminModerationQueueSqlite(limit, filters);
	return [];
}
async function listAdminModerationAudit(limit = 20) {
	if (isPostgresEnabled()) return listAdminModerationAuditPostgres(limit);
	if (isSqliteEnabled()) return listAdminModerationAuditSqlite(limit);
	return [];
}
async function listAdminRoleAudit(limit = 20, filters) {
	if (isPostgresEnabled()) return listAdminRoleAuditPostgres(limit, filters);
	if (isSqliteEnabled()) return listAdminRoleAuditSqlite(limit, filters);
	return [];
}
async function listPlatformSettings(limit = 100) {
	if (isPostgresEnabled()) return listPlatformSettingsPostgres(limit);
	if (isSqliteEnabled()) return listPlatformSettingsSqlite(limit);
	return [];
}
async function upsertPlatformSetting(key, value, updatedByUserId) {
	if (isPostgresEnabled()) return upsertPlatformSettingPostgres(key, value, updatedByUserId);
	if (isSqliteEnabled()) return upsertPlatformSettingSqlite(key, value, updatedByUserId);
	throw new Error("Persistência de configurações de plataforma não configurada.");
}
async function listAdminConsolidatedAudit(limit = 30, filters) {
	if (isPostgresEnabled()) return listAdminConsolidatedAuditPostgres(limit, filters);
	if (isSqliteEnabled()) return listAdminConsolidatedAuditSqlite(limit, filters);
	return [];
}
async function listAdminUserRoles(limit = 30) {
	if (isPostgresEnabled()) return listAdminUserRolesPostgres(limit);
	if (isSqliteEnabled()) return listAdminUserRolesSqlite(limit);
	return (await listUsers()).slice(0, Math.max(1, Math.min(100, limit))).map((user) => ({
		userId: user.id,
		name: user.name,
		email: user.email,
		businessType: user.businessType,
		role: "none",
		assignedByUserId: null,
		source: null,
		approvedByUserId: null,
		approvedByName: null,
		approvedByEmail: null,
		approvedAt: null,
		approvalNote: null,
		updatedAt: user.updatedAt
	}));
}
async function getUserAdminRole(userId) {
	if (isPostgresEnabled()) return getUserAdminRolePostgres(userId);
	if (isSqliteEnabled()) return getUserAdminRoleSqlite(userId);
	return "none";
}
async function countAdminUsers() {
	if (isPostgresEnabled()) return countAdminUsersPostgres();
	if (isSqliteEnabled()) return countAdminUsersSqlite();
	return 0;
}
async function setUserAdminRole(userId, role, assignedByUserId, source = "manual", approval) {
	const reason = role === "admin" ? approval?.approvalNote?.trim() || null : null;
	if (role === "none") {
		const previousRole = isPostgresEnabled() ? await getUserAdminRolePostgres(userId) : isSqliteEnabled() ? await getUserAdminRoleSqlite(userId) : "none";
		if (previousRole === "none") return;
		if (isPostgresEnabled()) {
			await clearUserAdminRolePostgres(userId);
			await writeUserRoleAuditLogPostgres(userId, previousRole, "none", assignedByUserId, source, reason);
			return;
		}
		if (isSqliteEnabled()) {
			await clearUserAdminRoleSqlite(userId);
			await writeUserRoleAuditLogSqlite(userId, previousRole, "none", assignedByUserId, source, reason);
			return;
		}
		return;
	}
	const previousRole = isPostgresEnabled() ? await getUserAdminRolePostgres(userId) : isSqliteEnabled() ? await getUserAdminRoleSqlite(userId) : "none";
	if (isPostgresEnabled()) {
		await setUserAdminRolePostgres(userId, role, assignedByUserId, source, approval);
		if (previousRole !== role) await writeUserRoleAuditLogPostgres(userId, previousRole, role, assignedByUserId, source, reason);
		return;
	}
	if (isSqliteEnabled()) {
		await setUserAdminRoleSqlite(userId, role, assignedByUserId, source, approval);
		if (previousRole !== role) await writeUserRoleAuditLogSqlite(userId, previousRole, role, assignedByUserId, source, reason);
		return;
	}
}
async function moderateAdminProduct(adminUserId, productId, decision, reason) {
	if (isPostgresEnabled()) return moderateProductPostgres(adminUserId, productId, decision, reason);
	if (isSqliteEnabled()) return moderateProductSqlite(adminUserId, productId, decision, reason);
	throw new Error("Persistência de moderação não configurada.");
}
async function getDashboardSummary() {
	if (isPostgresEnabled()) return {
		...await getDashboardSummaryPostgres(),
		storageMode: "postgres"
	};
	if (isSqliteEnabled()) return {
		...await getDashboardSummarySqlite(),
		storageMode: "sqlite"
	};
	await cleanupExpiredSessionsLocal();
	const store = await readStoreFile();
	return {
		userCount: store.users.length,
		sessionCount: store.sessions.length,
		sessionsExpiringSoon: store.sessions.filter((session) => {
			const timeToExpire = new Date(session.expiresAt).getTime() - Date.now();
			return timeToExpire > 0 && timeToExpire <= 36e5;
		}).length,
		storageMode: "local-file",
		byBusiness: retentionByBusiness(store.users),
		latestUsers: store.users.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 5).map((user) => ({
			name: user.name,
			email: user.email,
			businessType: user.businessType,
			createdAt: user.createdAt
		}))
	};
}
async function getAdminOverviewPostgres() {
	await ensureDatabaseSchema();
	const usersCountRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM users`);
	const productCountRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM products`);
	const publishedRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM products WHERE status = 'published'`);
	const draftRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM products WHERE status = 'draft'`);
	const pendingReviewRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM products WHERE COALESCE(moderation_status, 'approved') = 'pending_review'`);
	const rejectedRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM products WHERE COALESCE(moderation_status, 'approved') = 'rejected'`);
	const approvedOrdersRows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM orders WHERE status = 'approved'`);
	const grossSalesRows = await postgresQuery(`SELECT COALESCE(SUM(amount_cents), 0)::text AS total FROM orders WHERE status = 'approved'`);
	const categoryRows = await postgresQuery(`SELECT category, COUNT(*)::text AS total
     FROM products
     GROUP BY category
     ORDER BY COUNT(*) DESC, category ASC
     LIMIT 8`);
	const latestUserRows = await postgresQuery(`SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 8`);
	const latestProductRows = await postgresQuery(`SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            p.name,
            p.category,
            p.status,
                 COALESCE(p.moderation_status, 'approved') AS moderation_status,
                 p.moderation_reason,
            p.price_cents::text AS price_cents,
            p.created_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.created_at DESC
     LIMIT 8`);
	const grossSalesCents = Number(grossSalesRows[0]?.total ?? 0);
	return {
		userCount: Number(usersCountRows[0]?.total ?? 0),
		productCount: Number(productCountRows[0]?.total ?? 0),
		publishedProductCount: Number(publishedRows[0]?.total ?? 0),
		draftProductCount: Number(draftRows[0]?.total ?? 0),
		pendingReviewCount: Number(pendingReviewRows[0]?.total ?? 0),
		rejectedProductCount: Number(rejectedRows[0]?.total ?? 0),
		approvedOrdersCount: Number(approvedOrdersRows[0]?.total ?? 0),
		grossSalesCents,
		platformFeeRate: PLATFORM_FEE_RATE,
		platformRevenueCents: Math.round(grossSalesCents * PLATFORM_FEE_RATE),
		categories: categoryRows.map((row) => ({
			category: row.category,
			productCount: Number(row.total)
		})),
		latestUsers: latestUserRows.map((row) => ({
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			createdAt: new Date(row.created_at).toISOString()
		})),
		latestProducts: latestProductRows.map((row) => ({
			id: row.id,
			ownerUserId: row.owner_user_id,
			ownerName: row.owner_name,
			name: row.name,
			category: row.category,
			status: row.status,
			moderationStatus: toModerationStatus(row.moderation_status),
			moderationReason: row.moderation_reason,
			priceCents: Number(row.price_cents),
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
async function getAdminOverviewSqlite() {
	const usersCountRow = await sqliteGet(`SELECT COUNT(*) AS total FROM users`);
	const productCountRow = await sqliteGet(`SELECT COUNT(*) AS total FROM products`);
	const publishedRow = await sqliteGet(`SELECT COUNT(*) AS total FROM products WHERE status = 'published'`);
	const draftRow = await sqliteGet(`SELECT COUNT(*) AS total FROM products WHERE status = 'draft'`);
	const pendingReviewRow = await sqliteGet(`SELECT COUNT(*) AS total FROM products WHERE IFNULL(moderation_status, 'approved') = 'pending_review'`);
	const rejectedRow = await sqliteGet(`SELECT COUNT(*) AS total FROM products WHERE IFNULL(moderation_status, 'approved') = 'rejected'`);
	const approvedOrdersRow = await sqliteGet(`SELECT COUNT(*) AS total FROM orders WHERE status = 'approved'`);
	const grossSalesRow = await sqliteGet(`SELECT COALESCE(SUM(amount_cents), 0) AS total FROM orders WHERE status = 'approved'`);
	const categoryRows = await sqliteAll(`SELECT category, COUNT(*) AS total
     FROM products
     GROUP BY category
     ORDER BY COUNT(*) DESC, category ASC
     LIMIT 8`);
	const latestUserRows = await sqliteAll(`SELECT name, email, business_type, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 8`);
	const latestProductRows = await sqliteAll(`SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            p.name,
            p.category,
            p.status,
                 IFNULL(p.moderation_status, 'approved') AS moderation_status,
                 p.moderation_reason,
            p.price_cents,
            p.created_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.created_at DESC
     LIMIT 8`);
	const grossSalesCents = Number(grossSalesRow?.total ?? 0);
	return {
		userCount: Number(usersCountRow?.total ?? 0),
		productCount: Number(productCountRow?.total ?? 0),
		publishedProductCount: Number(publishedRow?.total ?? 0),
		draftProductCount: Number(draftRow?.total ?? 0),
		pendingReviewCount: Number(pendingReviewRow?.total ?? 0),
		rejectedProductCount: Number(rejectedRow?.total ?? 0),
		approvedOrdersCount: Number(approvedOrdersRow?.total ?? 0),
		grossSalesCents,
		platformFeeRate: PLATFORM_FEE_RATE,
		platformRevenueCents: Math.round(grossSalesCents * PLATFORM_FEE_RATE),
		categories: categoryRows.map((row) => ({
			category: row.category,
			productCount: Number(row.total)
		})),
		latestUsers: latestUserRows.map((row) => ({
			name: row.name,
			email: row.email,
			businessType: row.business_type,
			createdAt: new Date(row.created_at).toISOString()
		})),
		latestProducts: latestProductRows.map((row) => ({
			id: row.id,
			ownerUserId: row.owner_user_id,
			ownerName: row.owner_name,
			name: row.name,
			category: row.category,
			status: row.status,
			moderationStatus: toModerationStatus(row.moderation_status),
			moderationReason: row.moderation_reason,
			priceCents: Number(row.price_cents),
			createdAt: new Date(row.created_at).toISOString()
		}))
	};
}
async function getAdminOverviewLocal() {
	const store = await readStoreFile();
	return {
		userCount: store.users.length,
		productCount: 0,
		publishedProductCount: 0,
		draftProductCount: 0,
		pendingReviewCount: 0,
		rejectedProductCount: 0,
		approvedOrdersCount: 0,
		grossSalesCents: 0,
		platformFeeRate: PLATFORM_FEE_RATE,
		platformRevenueCents: 0,
		categories: [],
		latestUsers: store.users.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 8).map((user) => ({
			name: user.name,
			email: user.email,
			businessType: user.businessType,
			createdAt: user.createdAt
		})),
		latestProducts: []
	};
}
function normalizeWindowHours(hours) {
	if (!Number.isFinite(hours)) return 24;
	return Math.min(168, Math.max(1, Math.trunc(hours)));
}
function normalizeFailureLimit(limit) {
	if (!Number.isFinite(limit)) return 10;
	return Math.min(50, Math.max(1, Math.trunc(limit)));
}
async function getPaymentWebhookOpsSummaryPostgres(windowHours, failureLimit) {
	await ensureDatabaseSchema();
	const summaryRows = await postgresQuery(`SELECT COUNT(*)::text AS total_events,
            COUNT(*) FILTER (WHERE processed_at IS NULL)::text AS pending_processing,
            COUNT(*) FILTER (WHERE processing_result LIKE 'applied:%')::text AS applied_events,
            COUNT(*) FILTER (
              WHERE processed_at IS NOT NULL
                AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
            )::text AS failed_events,
            MAX(created_at) AS last_event_at,
            MAX(CASE WHEN processing_result LIKE 'applied:%' THEN processed_at END) AS last_success_at
     FROM payment_webhook_events
     WHERE created_at >= NOW() - make_interval(hours => $1)`, [windowHours]);
	const failureRows = await postgresQuery(`SELECT id,
            provider,
            event_id,
            order_id,
            event_status,
            processing_result,
            created_at,
            processed_at
     FROM payment_webhook_events
     WHERE created_at >= NOW() - make_interval(hours => $1)
       AND processed_at IS NOT NULL
       AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
     ORDER BY created_at DESC
     LIMIT $2`, [windowHours, failureLimit]);
	const summary = summaryRows[0];
	return {
		windowHours,
		totalEvents: Number(summary?.total_events ?? 0),
		pendingProcessing: Number(summary?.pending_processing ?? 0),
		appliedEvents: Number(summary?.applied_events ?? 0),
		failedEvents: Number(summary?.failed_events ?? 0),
		lastEventAt: summary?.last_event_at ? new Date(summary.last_event_at).toISOString() : null,
		lastSuccessAt: summary?.last_success_at ? new Date(summary.last_success_at).toISOString() : null,
		recentFailures: failureRows.map((row) => ({
			id: row.id,
			provider: row.provider,
			eventId: row.event_id,
			orderId: row.order_id,
			eventStatus: row.event_status,
			processingResult: row.processing_result,
			createdAt: new Date(row.created_at).toISOString(),
			processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : null
		}))
	};
}
async function getPaymentWebhookOpsSummarySqlite(windowHours, failureLimit) {
	const summary = await sqliteGet(`SELECT COUNT(*) AS total_events,
            SUM(CASE WHEN processed_at IS NULL THEN 1 ELSE 0 END) AS pending_processing,
            SUM(CASE WHEN processing_result LIKE 'applied:%' THEN 1 ELSE 0 END) AS applied_events,
            SUM(CASE
                  WHEN processed_at IS NOT NULL
                   AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
                  THEN 1 ELSE 0 END) AS failed_events,
            MAX(created_at) AS last_event_at,
            MAX(CASE WHEN processing_result LIKE 'applied:%' THEN processed_at END) AS last_success_at
     FROM payment_webhook_events
     WHERE julianday(created_at) >= julianday('now') - (? / 24.0)`, [windowHours]);
	const failureRows = await sqliteAll(`SELECT id,
            provider,
            event_id,
            order_id,
            event_status,
            processing_result,
            created_at,
            processed_at
     FROM payment_webhook_events
     WHERE julianday(created_at) >= julianday('now') - (? / 24.0)
       AND processed_at IS NOT NULL
       AND (processing_result IS NULL OR processing_result NOT LIKE 'applied:%')
     ORDER BY created_at DESC
     LIMIT ?`, [windowHours, failureLimit]);
	return {
		windowHours,
		totalEvents: Number(summary?.total_events ?? 0),
		pendingProcessing: Number(summary?.pending_processing ?? 0),
		appliedEvents: Number(summary?.applied_events ?? 0),
		failedEvents: Number(summary?.failed_events ?? 0),
		lastEventAt: summary?.last_event_at ? new Date(summary.last_event_at).toISOString() : null,
		lastSuccessAt: summary?.last_success_at ? new Date(summary.last_success_at).toISOString() : null,
		recentFailures: failureRows.map((row) => ({
			id: row.id,
			provider: row.provider,
			eventId: row.event_id,
			orderId: row.order_id,
			eventStatus: row.event_status,
			processingResult: row.processing_result,
			createdAt: new Date(row.created_at).toISOString(),
			processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : null
		}))
	};
}
async function getPaymentWebhookOpsSummaryLocal(windowHours) {
	return {
		windowHours,
		totalEvents: 0,
		pendingProcessing: 0,
		appliedEvents: 0,
		failedEvents: 0,
		lastEventAt: null,
		lastSuccessAt: null,
		recentFailures: []
	};
}
function normalizeReconciliationLimit(limit) {
	if (!Number.isFinite(limit)) return 50;
	return Math.min(300, Math.max(1, Math.trunc(limit)));
}
function normalizeReconciliationMinAgeMinutes(minutes) {
	if (!Number.isFinite(minutes)) return 2;
	return Math.min(1440, Math.max(0, Math.trunc(minutes)));
}
async function listPendingGatewayOrdersPostgres(limit) {
	await ensureDatabaseSchema();
	return (await postgresQuery(`SELECT id, created_at
     FROM orders
     WHERE payment_provider = 'mock'
       AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT $1`, [limit])).map((row) => ({
		id: row.id,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listPendingGatewayOrdersSqlite(limit) {
	return (await sqliteAll(`SELECT id, created_at
     FROM orders
     WHERE payment_provider = 'mock'
       AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT ?`, [limit])).map((row) => ({
		id: row.id,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function runPaymentGatewayReconciliationPostgres(limit, minOrderAgeMinutes) {
	const startedAt = nowIso();
	const minAgeMs = minOrderAgeMinutes * 60 * 1e3;
	const orders = await listPendingGatewayOrdersPostgres(limit);
	const checkedOrders = orders.filter((order) => Date.now() - new Date(order.createdAt).getTime() >= minAgeMs).length;
	return {
		provider: "disabled",
		checkedOrders,
		updatedOrders: 0,
		unchangedOrders: checkedOrders,
		skippedOrders: Math.max(0, orders.length - checkedOrders),
		issues: [{
			orderId: "*",
			message: "Integrações externas de gateway estão desativadas neste projeto."
		}],
		startedAt,
		completedAt: nowIso()
	};
}
async function runPaymentGatewayReconciliationSqlite(limit, minOrderAgeMinutes) {
	const startedAt = nowIso();
	const minAgeMs = minOrderAgeMinutes * 60 * 1e3;
	const orders = await listPendingGatewayOrdersSqlite(limit);
	const checkedOrders = orders.filter((order) => Date.now() - new Date(order.createdAt).getTime() >= minAgeMs).length;
	return {
		provider: "disabled",
		checkedOrders,
		updatedOrders: 0,
		unchangedOrders: checkedOrders,
		skippedOrders: Math.max(0, orders.length - checkedOrders),
		issues: [{
			orderId: "*",
			message: "Integrações externas de gateway estão desativadas neste projeto."
		}],
		startedAt,
		completedAt: nowIso()
	};
}
async function runPaymentGatewayReconciliationLocal() {
	return {
		provider: "disabled",
		checkedOrders: 0,
		updatedOrders: 0,
		unchangedOrders: 0,
		skippedOrders: 0,
		issues: [],
		startedAt: nowIso(),
		completedAt: nowIso()
	};
}
async function listAdminModerationQueuePostgres(limit, filters) {
	await ensureDatabaseSchema();
	const conditions = [`p.status = 'published'`];
	const params = [];
	const normalizedStatus = filters?.status ?? "pending_review";
	params.push(normalizedStatus);
	conditions.push(`COALESCE(p.moderation_status, 'approved') = $${params.length}`);
	if (filters?.category?.trim()) {
		params.push(filters.category.trim());
		conditions.push(`p.category = $${params.length}`);
	}
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		conditions.push(`p.created_at >= $${params.length}`);
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		conditions.push(`p.created_at <= $${params.length}`);
	}
	params.push(Math.max(1, Math.min(100, limit)));
	return (await postgresQuery(`SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            u.email AS owner_email,
            p.name,
            p.category,
            p.status,
            COALESCE(p.moderation_status, 'approved') AS moderation_status,
            p.moderation_reason,
            p.price_cents::text AS price_cents,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.updated_at DESC
     LIMIT $${params.length}`, params)).map((row) => ({
		id: row.id,
		ownerUserId: row.owner_user_id,
		ownerName: row.owner_name,
		ownerEmail: row.owner_email,
		name: row.name,
		category: row.category,
		status: row.status,
		moderationStatus: toModerationStatus(row.moderation_status),
		moderationReason: row.moderation_reason,
		priceCents: Number(row.price_cents),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function listAdminModerationQueueSqlite(limit, filters) {
	const conditions = [`p.status = 'published'`];
	const params = [];
	const normalizedStatus = filters?.status ?? "pending_review";
	params.push(normalizedStatus);
	conditions.push(`IFNULL(p.moderation_status, 'approved') = ?`);
	if (filters?.category?.trim()) {
		params.push(filters.category.trim());
		conditions.push(`p.category = ?`);
	}
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		conditions.push(`p.created_at >= ?`);
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		conditions.push(`p.created_at <= ?`);
	}
	params.push(Math.max(1, Math.min(100, limit)));
	return (await sqliteAll(`SELECT p.id,
            p.owner_user_id,
            u.name AS owner_name,
            u.email AS owner_email,
            p.name,
            p.category,
            p.status,
            IFNULL(p.moderation_status, 'approved') AS moderation_status,
            p.moderation_reason,
            p.price_cents,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN users u ON u.id = p.owner_user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.updated_at DESC
     LIMIT ?`, params)).map((row) => ({
		id: row.id,
		ownerUserId: row.owner_user_id,
		ownerName: row.owner_name,
		ownerEmail: row.owner_email,
		name: row.name,
		category: row.category,
		status: row.status,
		moderationStatus: toModerationStatus(row.moderation_status),
		moderationReason: row.moderation_reason,
		priceCents: Number(row.price_cents),
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function listAdminModerationAuditPostgres(limit) {
	await ensureDatabaseSchema();
	return (await postgresQuery(`SELECT l.id,
            l.product_id,
            p.name AS product_name,
            l.admin_user_id,
            u.name AS admin_name,
            u.email AS admin_email,
            l.action,
            l.reason,
            l.created_at
     FROM moderation_audit_logs l
     JOIN products p ON p.id = l.product_id
     JOIN users u ON u.id = l.admin_user_id
     ORDER BY l.created_at DESC
     LIMIT $1`, [Math.max(1, Math.min(100, limit))])).map((row) => ({
		id: row.id,
		productId: row.product_id,
		productName: row.product_name,
		adminUserId: row.admin_user_id,
		adminName: row.admin_name,
		adminEmail: row.admin_email,
		action: row.action,
		reason: row.reason,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
function mapAdminRoleAuditAction(previousRoleValue, newRoleValue) {
	const previousRole = toAdminRole(previousRoleValue);
	const newRole = toAdminRole(newRoleValue);
	if (previousRole !== "admin" && newRole === "admin") return "promote_admin";
	if (previousRole === "admin" && newRole !== "admin") return "demote_admin";
	if (previousRole === "none" && newRole !== "none") return "grant";
	if (previousRole !== "none" && newRole === "none") return "revoke";
	return "change";
}
function applyAdminRoleAuditActionPostgresWhere(action) {
	switch (action) {
		case "grant": return "COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none'";
		case "revoke": return "COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none'";
		case "promote_admin": return "COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin'";
		case "demote_admin": return "COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin'";
		default: return "COALESCE(l.previous_role, 'none') <> COALESCE(l.new_role, 'none')";
	}
}
function applyAdminRoleAuditActionSqliteWhere(action) {
	switch (action) {
		case "grant": return "COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none'";
		case "revoke": return "COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none'";
		case "promote_admin": return "COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin'";
		case "demote_admin": return "COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin'";
		default: return "COALESCE(l.previous_role, 'none') <> COALESCE(l.new_role, 'none')";
	}
}
async function listAdminRoleAuditPostgres(limit, filters) {
	await ensureDatabaseSchema();
	const clauses = [];
	const params = [];
	if (filters?.userQuery) {
		params.push(`%${filters.userQuery.trim()}%`);
		clauses.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
	}
	if (filters?.action) clauses.push(applyAdminRoleAuditActionPostgresWhere(filters.action));
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		clauses.push(`l.created_at >= $${params.length}`);
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		clauses.push(`l.created_at <= $${params.length}`);
	}
	const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
	params.push(Math.max(1, Math.min(200, limit)));
	return (await postgresQuery(`SELECT l.id,
            l.user_id,
            u.name AS user_name,
            u.email AS user_email,
            l.previous_role,
            l.new_role,
            l.changed_by_user_id,
            cu.name AS changed_by_name,
            cu.email AS changed_by_email,
            l.source,
            l.reason,
            l.created_at
     FROM user_role_audit_logs l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN users cu ON cu.id = l.changed_by_user_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT $${params.length}`, params)).map((row) => ({
		id: row.id,
		userId: row.user_id,
		userName: row.user_name,
		userEmail: row.user_email,
		action: mapAdminRoleAuditAction(row.previous_role, row.new_role),
		previousRole: toAdminRole(row.previous_role),
		newRole: toAdminRole(row.new_role),
		changedByUserId: row.changed_by_user_id,
		changedByName: row.changed_by_name,
		changedByEmail: row.changed_by_email,
		source: row.source,
		reason: row.reason,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listAdminModerationAuditSqlite(limit) {
	return (await sqliteAll(`SELECT l.id,
            l.product_id,
            p.name AS product_name,
            l.admin_user_id,
            u.name AS admin_name,
            u.email AS admin_email,
            l.action,
            l.reason,
            l.created_at
     FROM moderation_audit_logs l
     JOIN products p ON p.id = l.product_id
     JOIN users u ON u.id = l.admin_user_id
     ORDER BY l.created_at DESC
     LIMIT ?`, [Math.max(1, Math.min(100, limit))])).map((row) => ({
		id: row.id,
		productId: row.product_id,
		productName: row.product_name,
		adminUserId: row.admin_user_id,
		adminName: row.admin_name,
		adminEmail: row.admin_email,
		action: row.action,
		reason: row.reason,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listPlatformSettingsPostgres(limit) {
	await ensureDatabaseSchema();
	return (await postgresQuery(`SELECT s.key,
            s.value,
            s.updated_by_user_id,
            u.name AS updated_by_name,
            u.email AS updated_by_email,
            s.created_at,
            s.updated_at
     FROM platform_settings s
     LEFT JOIN users u ON u.id = s.updated_by_user_id
     ORDER BY s.key ASC
     LIMIT $1`, [Math.max(1, Math.min(200, limit))])).map((row) => ({
		key: row.key,
		value: row.value,
		updatedByUserId: row.updated_by_user_id,
		updatedByName: row.updated_by_name,
		updatedByEmail: row.updated_by_email,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function listPlatformSettingsSqlite(limit) {
	return (await sqliteAll(`SELECT s.key,
            s.value,
            s.updated_by_user_id,
            u.name AS updated_by_name,
            u.email AS updated_by_email,
            s.created_at,
            s.updated_at
     FROM platform_settings s
     LEFT JOIN users u ON u.id = s.updated_by_user_id
     ORDER BY s.key ASC
     LIMIT ?`, [Math.max(1, Math.min(200, limit))])).map((row) => ({
		key: row.key,
		value: row.value,
		updatedByUserId: row.updated_by_user_id,
		updatedByName: row.updated_by_name,
		updatedByEmail: row.updated_by_email,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString()
	}));
}
async function upsertPlatformSettingPostgres(key, value, updatedByUserId) {
	await ensureDatabaseSchema();
	const now = nowIso();
	const previousValue = (await postgresQuery(`SELECT value FROM platform_settings WHERE key = $1 LIMIT 1`, [key]))[0]?.value ?? null;
	await postgresQuery(`INSERT INTO platform_settings (key, value, updated_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value,
                   updated_by_user_id = EXCLUDED.updated_by_user_id,
                   updated_at = EXCLUDED.updated_at`, [
		key,
		value,
		updatedByUserId,
		now,
		now
	]);
	await postgresQuery(`INSERT INTO platform_setting_audit_logs (id, setting_key, previous_value, new_value, changed_by_user_id, action, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
		createId(`platform_setting:${key}:${now}`),
		key,
		previousValue,
		value,
		updatedByUserId,
		previousValue === null ? "create" : "update",
		now
	]);
	const stored = (await listPlatformSettingsPostgres(200)).find((item) => item.key === key);
	if (!stored) throw new Error("Falha ao persistir configuração de plataforma.");
	return stored;
}
async function upsertPlatformSettingSqlite(key, value, updatedByUserId) {
	const now = nowIso();
	const previousValue = (await sqliteGet(`SELECT value FROM platform_settings WHERE key = ? LIMIT 1`, [key]))?.value ?? null;
	await sqliteRun(`INSERT INTO platform_settings (key, value, updated_by_user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key)
     DO UPDATE SET value = excluded.value,
                   updated_by_user_id = excluded.updated_by_user_id,
                   updated_at = excluded.updated_at`, [
		key,
		value,
		updatedByUserId,
		now,
		now
	]);
	await sqliteRun(`INSERT INTO platform_setting_audit_logs (id, setting_key, previous_value, new_value, changed_by_user_id, action, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
		createId(`platform_setting:${key}:${now}`),
		key,
		previousValue,
		value,
		updatedByUserId,
		previousValue === null ? "create" : "update",
		now
	]);
	const stored = (await listPlatformSettingsSqlite(200)).find((item) => item.key === key);
	if (!stored) throw new Error("Falha ao persistir configuração de plataforma.");
	return stored;
}
async function listAdminConsolidatedAuditPostgres(limit, filters) {
	await ensureDatabaseSchema();
	const clauses = [];
	const params = [];
	if (filters?.eventType) {
		params.push(filters.eventType);
		clauses.push(`e.event_type = $${params.length}`);
	}
	if (filters?.actorQuery) {
		params.push(`%${filters.actorQuery.trim()}%`);
		clauses.push(`(COALESCE(e.actor_name, '') ILIKE $${params.length} OR COALESCE(e.actor_email, '') ILIKE $${params.length})`);
	}
	if (filters?.fromCreatedAt) {
		params.push(filters.fromCreatedAt);
		clauses.push(`e.created_at >= $${params.length}`);
	}
	if (filters?.toCreatedAt) {
		params.push(filters.toCreatedAt);
		clauses.push(`e.created_at <= $${params.length}`);
	}
	const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
	params.push(Math.max(1, Math.min(200, limit)));
	return (await postgresQuery(`SELECT e.id,
            e.event_type,
            e.action,
            e.actor_user_id,
            e.actor_name,
            e.actor_email,
            e.target,
            e.detail,
            e.created_at
     FROM (
       SELECT l.id,
              'moderation'::text AS event_type,
              l.action,
              l.admin_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              p.name AS target,
              l.reason AS detail,
              l.created_at
       FROM moderation_audit_logs l
       JOIN products p ON p.id = l.product_id
       JOIN users u ON u.id = l.admin_user_id

       UNION ALL

       SELECT l.id,
              'rbac'::text AS event_type,
              CASE
                WHEN COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin' THEN 'promote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin' THEN 'demote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none' THEN 'grant'
                WHEN COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none' THEN 'revoke'
                ELSE 'change'
              END AS action,
              l.changed_by_user_id AS actor_user_id,
              cu.name AS actor_name,
              cu.email AS actor_email,
              u.email AS target,
              l.reason AS detail,
              l.created_at
       FROM user_role_audit_logs l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN users cu ON cu.id = l.changed_by_user_id

       UNION ALL

       SELECT l.id,
              'platform_setting'::text AS event_type,
              l.action,
              l.changed_by_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              l.setting_key AS target,
              CONCAT('de: ', COALESCE(l.previous_value, '<vazio>'), ' -> para: ', COALESCE(l.new_value, '<vazio>')) AS detail,
              l.created_at
       FROM platform_setting_audit_logs l
       LEFT JOIN users u ON u.id = l.changed_by_user_id
     ) e
     ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT $${params.length}`, params)).map((row) => ({
		id: row.id,
		eventType: row.event_type,
		action: row.action,
		actorUserId: row.actor_user_id,
		actorName: row.actor_name,
		actorEmail: row.actor_email,
		target: row.target,
		detail: row.detail,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listAdminConsolidatedAuditSqlite(limit, filters) {
	const clauses = [];
	const params = [];
	if (filters?.eventType) {
		clauses.push("e.event_type = ?");
		params.push(filters.eventType);
	}
	if (filters?.actorQuery) {
		const query = `%${filters.actorQuery.trim().toLowerCase()}%`;
		clauses.push("(LOWER(COALESCE(e.actor_name, '')) LIKE ? OR LOWER(COALESCE(e.actor_email, '')) LIKE ?)");
		params.push(query, query);
	}
	if (filters?.fromCreatedAt) {
		clauses.push("e.created_at >= ?");
		params.push(filters.fromCreatedAt);
	}
	if (filters?.toCreatedAt) {
		clauses.push("e.created_at <= ?");
		params.push(filters.toCreatedAt);
	}
	const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
	params.push(Math.max(1, Math.min(200, limit)));
	return (await sqliteAll(`SELECT e.id,
            e.event_type,
            e.action,
            e.actor_user_id,
            e.actor_name,
            e.actor_email,
            e.target,
            e.detail,
            e.created_at
     FROM (
       SELECT l.id,
              'moderation' AS event_type,
              l.action,
              l.admin_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              p.name AS target,
              l.reason AS detail,
              l.created_at
       FROM moderation_audit_logs l
       JOIN products p ON p.id = l.product_id
       JOIN users u ON u.id = l.admin_user_id

       UNION ALL

       SELECT l.id,
              'rbac' AS event_type,
              CASE
                WHEN COALESCE(l.previous_role, 'none') <> 'admin' AND COALESCE(l.new_role, 'none') = 'admin' THEN 'promote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'admin' AND COALESCE(l.new_role, 'none') <> 'admin' THEN 'demote_admin'
                WHEN COALESCE(l.previous_role, 'none') = 'none' AND COALESCE(l.new_role, 'none') <> 'none' THEN 'grant'
                WHEN COALESCE(l.previous_role, 'none') <> 'none' AND COALESCE(l.new_role, 'none') = 'none' THEN 'revoke'
                ELSE 'change'
              END AS action,
              l.changed_by_user_id AS actor_user_id,
              cu.name AS actor_name,
              cu.email AS actor_email,
              u.email AS target,
              l.reason AS detail,
              l.created_at
       FROM user_role_audit_logs l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN users cu ON cu.id = l.changed_by_user_id

       UNION ALL

       SELECT l.id,
              'platform_setting' AS event_type,
              l.action,
              l.changed_by_user_id AS actor_user_id,
              u.name AS actor_name,
              u.email AS actor_email,
              l.setting_key AS target,
              ('de: ' || COALESCE(l.previous_value, '<vazio>') || ' -> para: ' || COALESCE(l.new_value, '<vazio>')) AS detail,
              l.created_at
       FROM platform_setting_audit_logs l
       LEFT JOIN users u ON u.id = l.changed_by_user_id
     ) e
     ${whereClause}
     ORDER BY e.created_at DESC
     LIMIT ?`, params)).map((row) => ({
		id: row.id,
		eventType: row.event_type,
		action: row.action,
		actorUserId: row.actor_user_id,
		actorName: row.actor_name,
		actorEmail: row.actor_email,
		target: row.target,
		detail: row.detail,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function listAdminRoleAuditSqlite(limit, filters) {
	const clauses = [];
	const params = [];
	if (filters?.userQuery) {
		const query = `%${filters.userQuery.trim().toLowerCase()}%`;
		clauses.push("(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)");
		params.push(query, query);
	}
	if (filters?.action) clauses.push(applyAdminRoleAuditActionSqliteWhere(filters.action));
	if (filters?.fromCreatedAt) {
		clauses.push("l.created_at >= ?");
		params.push(filters.fromCreatedAt);
	}
	if (filters?.toCreatedAt) {
		clauses.push("l.created_at <= ?");
		params.push(filters.toCreatedAt);
	}
	const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
	params.push(Math.max(1, Math.min(200, limit)));
	return (await sqliteAll(`SELECT l.id,
            l.user_id,
            u.name AS user_name,
            u.email AS user_email,
            l.previous_role,
            l.new_role,
            l.changed_by_user_id,
            cu.name AS changed_by_name,
            cu.email AS changed_by_email,
            l.source,
            l.reason,
            l.created_at
     FROM user_role_audit_logs l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN users cu ON cu.id = l.changed_by_user_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT ?`, params)).map((row) => ({
		id: row.id,
		userId: row.user_id,
		userName: row.user_name,
		userEmail: row.user_email,
		action: mapAdminRoleAuditAction(row.previous_role, row.new_role),
		previousRole: toAdminRole(row.previous_role),
		newRole: toAdminRole(row.new_role),
		changedByUserId: row.changed_by_user_id,
		changedByName: row.changed_by_name,
		changedByEmail: row.changed_by_email,
		source: row.source,
		reason: row.reason,
		createdAt: new Date(row.created_at).toISOString()
	}));
}
async function writeUserRoleAuditLogPostgres(userId, previousRole, newRole, changedByUserId, source, reason) {
	const createdAt = nowIso();
	await postgresQuery(`INSERT INTO user_role_audit_logs (id, user_id, previous_role, new_role, changed_by_user_id, source, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
		createId(`role_audit:${userId}:${createdAt}:${newRole}`),
		userId,
		previousRole,
		newRole,
		changedByUserId,
		source,
		reason,
		createdAt
	]);
}
async function writeUserRoleAuditLogSqlite(userId, previousRole, newRole, changedByUserId, source, reason) {
	const createdAt = nowIso();
	await sqliteRun(`INSERT INTO user_role_audit_logs (id, user_id, previous_role, new_role, changed_by_user_id, source, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
		createId(`role_audit:${userId}:${createdAt}:${newRole}`),
		userId,
		previousRole,
		newRole,
		changedByUserId,
		source,
		reason,
		createdAt
	]);
}
async function getUserAdminRolePostgres(userId) {
	await ensureDatabaseSchema();
	return toAdminRole((await postgresQuery(`SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1`, [userId]))[0]?.role);
}
async function countAdminUsersPostgres() {
	await ensureDatabaseSchema();
	const rows = await postgresQuery(`SELECT COUNT(*)::text AS total FROM user_roles WHERE role = 'admin'`);
	return Number(rows[0]?.total ?? "0");
}
async function listAdminUserRolesPostgres(limit) {
	await ensureDatabaseSchema();
	return (await postgresQuery(`SELECT u.id AS user_id,
            u.name,
            u.email,
            u.business_type,
            r.role,
            r.assigned_by_user_id,
            r.source,
                 r.approved_by_user_id,
                 au.name AS approved_by_name,
                 au.email AS approved_by_email,
                 r.approved_at,
                 r.approval_note,
            r.updated_at AS role_updated_at,
            u.updated_at AS user_updated_at
     FROM users u
     LEFT JOIN user_roles r ON r.user_id = u.id
               LEFT JOIN users au ON au.id = r.approved_by_user_id
     ORDER BY u.created_at DESC
     LIMIT $1`, [Math.max(1, Math.min(100, limit))])).map((row) => ({
		userId: row.user_id,
		name: row.name,
		email: row.email,
		businessType: row.business_type,
		role: toAdminRole(row.role),
		assignedByUserId: row.assigned_by_user_id,
		source: row.source,
		approvedByUserId: row.approved_by_user_id,
		approvedByName: row.approved_by_name,
		approvedByEmail: row.approved_by_email,
		approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
		approvalNote: row.approval_note,
		updatedAt: new Date(row.role_updated_at ?? row.user_updated_at).toISOString()
	}));
}
async function getUserAdminRoleSqlite(userId) {
	return toAdminRole((await sqliteGet(`SELECT role FROM user_roles WHERE user_id = ? LIMIT 1`, [userId]))?.role);
}
async function countAdminUsersSqlite() {
	const row = await sqliteGet(`SELECT COUNT(*) AS total FROM user_roles WHERE role = 'admin'`);
	return Number(row?.total ?? 0);
}
async function listAdminUserRolesSqlite(limit) {
	return (await sqliteAll(`SELECT u.id AS user_id,
            u.name,
            u.email,
            u.business_type,
            r.role,
            r.assigned_by_user_id,
            r.source,
                 r.approved_by_user_id,
                 au.name AS approved_by_name,
                 au.email AS approved_by_email,
                 r.approved_at,
                 r.approval_note,
            r.updated_at AS role_updated_at,
            u.updated_at AS user_updated_at
     FROM users u
     LEFT JOIN user_roles r ON r.user_id = u.id
               LEFT JOIN users au ON au.id = r.approved_by_user_id
     ORDER BY u.created_at DESC
     LIMIT ?`, [Math.max(1, Math.min(100, limit))])).map((row) => ({
		userId: row.user_id,
		name: row.name,
		email: row.email,
		businessType: row.business_type,
		role: toAdminRole(row.role),
		assignedByUserId: row.assigned_by_user_id,
		source: row.source,
		approvedByUserId: row.approved_by_user_id,
		approvedByName: row.approved_by_name,
		approvedByEmail: row.approved_by_email,
		approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
		approvalNote: row.approval_note,
		updatedAt: new Date(row.role_updated_at ?? row.user_updated_at).toISOString()
	}));
}
async function setUserAdminRolePostgres(userId, role, assignedByUserId, source, approval) {
	await ensureDatabaseSchema();
	const now = nowIso();
	await postgresQuery(`INSERT INTO user_roles (user_id, role, assigned_by_user_id, source, approved_by_user_id, approved_at, approval_note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (user_id)
     DO UPDATE SET role = EXCLUDED.role,
                   assigned_by_user_id = EXCLUDED.assigned_by_user_id,
                   source = EXCLUDED.source,
                   approved_by_user_id = EXCLUDED.approved_by_user_id,
                   approved_at = EXCLUDED.approved_at,
                   approval_note = EXCLUDED.approval_note,
                   updated_at = EXCLUDED.updated_at`, [
		userId,
		role,
		assignedByUserId,
		source,
		role === "admin" ? approval?.approvedByUserId ?? null : null,
		role === "admin" ? approval?.approvedAt ?? now : null,
		role === "admin" ? approval?.approvalNote?.trim() || null : null,
		now
	]);
}
async function setUserAdminRoleSqlite(userId, role, assignedByUserId, source, approval) {
	const now = nowIso();
	await sqliteRun(`INSERT INTO user_roles (user_id, role, assigned_by_user_id, source, approved_by_user_id, approved_at, approval_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id)
     DO UPDATE SET role = excluded.role,
                   assigned_by_user_id = excluded.assigned_by_user_id,
                   source = excluded.source,
                   approved_by_user_id = excluded.approved_by_user_id,
                   approved_at = excluded.approved_at,
                   approval_note = excluded.approval_note,
                   updated_at = excluded.updated_at`, [
		userId,
		role,
		assignedByUserId,
		source,
		role === "admin" ? approval?.approvedByUserId ?? null : null,
		role === "admin" ? approval?.approvedAt ?? now : null,
		role === "admin" ? approval?.approvalNote?.trim() || null : null,
		now,
		now
	]);
}
async function clearUserAdminRolePostgres(userId) {
	await ensureDatabaseSchema();
	await postgresQuery(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
}
async function clearUserAdminRoleSqlite(userId) {
	await sqliteRun(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);
}
async function moderateProductPostgres(adminUserId, productId, decision, reason) {
	await ensureDatabaseSchema();
	const nextStatus = decision === "approve" ? "approved" : "rejected";
	const normalizedReason = reason?.trim() ? reason.trim() : null;
	const now = nowIso();
	if ((await postgresQuery(`UPDATE products
     SET moderation_status = $2,
         moderation_reason = $3,
         updated_at = $4
     WHERE id = $1
     RETURNING id`, [
		productId,
		nextStatus,
		normalizedReason,
		now
	])).length === 0) throw new Error("Produto não encontrado para moderação.");
	await postgresQuery(`INSERT INTO moderation_audit_logs (id, product_id, admin_user_id, action, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`, [
		createId(`mod:${productId}:${adminUserId}:${now}`),
		productId,
		adminUserId,
		decision,
		normalizedReason,
		now
	]);
	return {
		productId,
		moderationStatus: nextStatus,
		moderationReason: normalizedReason
	};
}
async function moderateProductSqlite(adminUserId, productId, decision, reason) {
	if (!await sqliteGet(`SELECT id FROM products WHERE id = ? LIMIT 1`, [productId])) throw new Error("Produto não encontrado para moderação.");
	const nextStatus = decision === "approve" ? "approved" : "rejected";
	const normalizedReason = reason?.trim() ? reason.trim() : null;
	const now = nowIso();
	await sqliteRun(`UPDATE products
     SET moderation_status = ?,
         moderation_reason = ?,
         updated_at = ?
     WHERE id = ?`, [
		nextStatus,
		normalizedReason,
		now,
		productId
	]);
	await sqliteRun(`INSERT INTO moderation_audit_logs (id, product_id, admin_user_id, action, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`, [
		createId(`mod:${productId}:${adminUserId}:${now}`),
		productId,
		adminUserId,
		decision,
		normalizedReason,
		now
	]);
	return {
		productId,
		moderationStatus: nextStatus,
		moderationReason: normalizedReason
	};
}
async function getAdminOverview() {
	if (isPostgresEnabled()) return getAdminOverviewPostgres();
	if (isSqliteEnabled()) return getAdminOverviewSqlite();
	return getAdminOverviewLocal();
}
async function getPaymentWebhookOpsSummary(hours = 24, failureLimit = 10) {
	const windowHours = normalizeWindowHours(hours);
	const normalizedFailureLimit = normalizeFailureLimit(failureLimit);
	if (isPostgresEnabled()) return getPaymentWebhookOpsSummaryPostgres(windowHours, normalizedFailureLimit);
	if (isSqliteEnabled()) return getPaymentWebhookOpsSummarySqlite(windowHours, normalizedFailureLimit);
	return getPaymentWebhookOpsSummaryLocal(windowHours);
}
async function runPaymentGatewayReconciliation(options) {
	const configuredLimit = getEnvNumber("PAYMENT_RECONCILE_MAX_ORDERS", 50);
	const configuredMinAge = getEnvNumber("PAYMENT_RECONCILE_MIN_ORDER_AGE_MINUTES", 2);
	const limit = normalizeReconciliationLimit(options?.limit ?? configuredLimit);
	const minOrderAgeMinutes = normalizeReconciliationMinAgeMinutes(options?.minOrderAgeMinutes ?? configuredMinAge);
	if (isPostgresEnabled()) return runPaymentGatewayReconciliationPostgres(limit, minOrderAgeMinutes);
	if (isSqliteEnabled()) return runPaymentGatewayReconciliationSqlite(limit, minOrderAgeMinutes);
	return runPaymentGatewayReconciliationLocal();
}
//#endregion
//#region src/lib/auth-server.ts?tss-serverfn-split
var sessionCookieName = "brasiltec_session";
var RATE_LIMIT_WINDOW_MS = 6e5;
var RATE_LIMIT_MAX_ATTEMPTS = 8;
var attemptStore = /* @__PURE__ */ new Map();
function setSessionCookie(token) {
	const protocol = getRequestProtocol();
	const host = getRequestHost();
	const isLocalHost = host.includes("localhost") || host.includes("127.0.0.1");
	setCookie(sessionCookieName, token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: protocol === "https" && !isLocalHost,
		maxAge: 28800
	});
}
function normalizeKeyValue(value) {
	return value.trim().toLowerCase();
}
function getRateLimitKey(action, email) {
	return `${action}:${getRequestHost().toLowerCase()}:${normalizeKeyValue(email)}`;
}
function enforceRateLimit(key) {
	const now = Date.now();
	const current = attemptStore.get(key);
	if (!current || current.resetAt <= now) {
		attemptStore.set(key, {
			count: 1,
			resetAt: now + RATE_LIMIT_WINDOW_MS
		});
		return;
	}
	if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) {
		const waitSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1e3));
		throw new Error(`Muitas tentativas. Aguarde ${waitSeconds}s e tente novamente.`);
	}
	current.count += 1;
	attemptStore.set(key, current);
}
function clearRateLimit(key) {
	attemptStore.delete(key);
}
function readSessionCookie() {
	const token = getCookie(sessionCookieName);
	if (!token) throw new Error("Sessão não encontrada.");
	return token;
}
async function requireSessionUser() {
	const session = await getSession(readSessionCookie());
	if (!session) throw new Error("Sessão não encontrada.");
	return session.user;
}
function resolveAdminRoleFromEnv(email) {
	const normalizedEmail = email.trim().toLowerCase();
	const admins = getEnvList("ADMIN_EMAILS");
	const moderators = getEnvList("MODERATOR_EMAILS");
	const viewers = getEnvList("ADMIN_VIEWER_EMAILS");
	if (!(admins.length > 0 || moderators.length > 0 || viewers.length > 0)) return "none";
	if (admins.includes(normalizedEmail)) return "admin";
	if (moderators.includes(normalizedEmail)) return "moderator";
	if (viewers.includes(normalizedEmail)) return "viewer";
	return "none";
}
async function resolveAdminRole(user) {
	const persisted = await getUserAdminRole(user.id);
	if (persisted !== "none") return persisted;
	const fromEnv = resolveAdminRoleFromEnv(user.email);
	if (fromEnv !== "none") {
		await setUserAdminRole(user.id, fromEnv, null, "env-sync");
		return fromEnv;
	}
	if (!(getEnvList("ADMIN_EMAILS").length > 0 || getEnvList("MODERATOR_EMAILS").length > 0 || getEnvList("ADMIN_VIEWER_EMAILS").length > 0)) {
		await setUserAdminRole(user.id, "admin", null, "local-bootstrap");
		return "admin";
	}
	return "none";
}
function hasAdminPermission(role, permission) {
	if (permission === "view") return role === "viewer" || role === "moderator" || role === "admin";
	if (permission === "moderate") return role === "moderator" || role === "admin";
	if (permission === "manage_roles") return role === "admin";
	return false;
}
async function requireAdminAccess(user, permission = "view") {
	const role = await resolveAdminRole(user);
	if (!hasAdminPermission(role, permission)) throw new Error("Acesso administrativo não autorizado.");
	return role;
}
var businessTypes = [
	"Produtor digital",
	"Infoprodutor",
	"Afiliado",
	"Agência",
	"E-commerce",
	"Serviços"
];
var registerSchema = z.object({
	name: z.string().trim().min(3),
	email: z.string().trim().email(),
	password: z.string().min(8),
	businessType: z.enum(businessTypes)
});
var loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1)
});
var googleAuthSchema = z.object({
	credential: z.string().trim().min(20),
	businessType: z.enum(businessTypes).optional()
});
var forgotPasswordSchema = z.object({ email: z.string().trim().email() });
var supportContactSchema = z.object({
	name: z.string().trim().min(2).max(120),
	senderEmail: z.string().trim().email(),
	recipientEmail: z.string().trim().email().optional(),
	subject: z.string().trim().min(3).max(160),
	message: z.string().trim().min(10).max(4e3)
});
var resetPasswordSchema = z.object({
	token: z.string().trim().min(12),
	password: z.string().min(8)
});
var createProductSchema = z.object({
	name: z.string().trim().min(3),
	description: z.string().trim().min(10),
	category: z.string().trim().min(2),
	priceCents: z.number().int().positive()
});
var publishProductSchema = z.object({ productId: z.string().trim().min(6) });
var buyProductSchema = z.object({
	productId: z.string().trim().min(6),
	paymentMethod: z.enum([
		"PIX",
		"Cartão",
		"Transferência",
		"Boleto"
	])
});
var transitionOrderSchema = z.object({
	orderId: z.string().trim().min(6),
	status: z.enum([
		"approved",
		"declined",
		"refunded"
	])
});
var orderTimelineSchema = z.object({ orderId: z.string().trim().min(6) });
var learningTrackSchema = z.object({ productId: z.string().trim().min(6) });
var lessonProgressSchema = z.object({
	lessonId: z.string().trim().min(6),
	completed: z.boolean()
});
var orderFiltersSchema = z.object({
	status: z.enum([
		"pending",
		"approved",
		"declined",
		"refunded"
	]).optional(),
	productId: z.string().trim().min(6).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var marketplaceProductSchema = z.object({ productId: z.string().trim().min(6) });
var requestWithdrawalSchema = z.object({
	amountCents: z.number().int().positive(),
	method: z.string().trim().min(2)
});
var readNotificationSchema = z.object({ notificationId: z.string().trim().min(6) });
var adminModerationQuerySchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
	status: z.enum([
		"pending_review",
		"approved",
		"rejected"
	]).optional(),
	category: z.string().trim().min(2).max(60).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminModerationAuditQuerySchema = z.object({ limit: z.number().int().min(1).max(100).optional() });
var adminConsolidatedAuditQuerySchema = z.object({
	limit: z.number().int().min(1).max(200).optional(),
	eventType: z.enum([
		"moderation",
		"rbac",
		"platform_setting"
	]).optional(),
	actorQuery: z.string().trim().min(2).max(120).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminRoleDirectoryQuerySchema = z.object({ limit: z.number().int().min(1).max(100).optional() });
var adminRoleAuditQuerySchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
	userQuery: z.string().trim().min(2).max(120).optional(),
	action: z.enum([
		"grant",
		"revoke",
		"change",
		"promote_admin",
		"demote_admin"
	]).optional(),
	fromCreatedAt: z.string().datetime().optional(),
	toCreatedAt: z.string().datetime().optional()
});
var adminRoleAssignmentSchema = z.object({
	userId: z.string().trim().min(6),
	role: z.enum([
		"none",
		"viewer",
		"moderator",
		"admin"
	]),
	confirmAdminPromotion: z.boolean().optional(),
	approvalNote: z.string().trim().max(300).optional()
});
var adminPlatformSettingsQuerySchema = z.object({ limit: z.number().int().min(1).max(200).optional() });
var adminPaymentOpsQuerySchema = z.object({
	hours: z.number().int().min(1).max(168).optional(),
	failureLimit: z.number().int().min(1).max(50).optional()
});
var adminPaymentReconcileSchema = z.object({
	limit: z.number().int().min(1).max(300).optional(),
	minOrderAgeMinutes: z.number().int().min(0).max(1440).optional()
});
async function verifyGoogleCredential(credential) {
	const clientId = getEnv("GOOGLE_CLIENT_ID") || getEnv("VITE_GOOGLE_CLIENT_ID");
	if (!clientId) throw new Error("Google Login não configurado. Defina GOOGLE_CLIENT_ID no ambiente.");
	const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
	if (!response.ok) throw new Error("Token Google inválido ou expirado.");
	const tokenInfo = await response.json();
	if (tokenInfo.aud !== clientId) throw new Error("Token Google inválido para este projeto.");
	const email = tokenInfo.email?.trim().toLowerCase() ?? "";
	if (!email || tokenInfo.email_verified !== "true") throw new Error("Conta Google sem email verificado.");
	return {
		email,
		name: tokenInfo.name?.trim() || email.split("@")[0] || "Usuário"
	};
}
function supportRateLimitKey(senderEmail, recipientEmail) {
	return `support:${getRequestHost().toLowerCase()}:${normalizeKeyValue(senderEmail)}:${normalizeKeyValue(recipientEmail)}`;
}
function supportRecipientsAllowlist() {
	const fromEnv = getEnvList("SUPPORT_ALLOWED_RECIPIENTS");
	const defaultRecipient = normalizeKeyValue(getEnv("SUPPORT_DEFAULT_RECIPIENT", "suporte@brasiltec.net.br"));
	if (defaultRecipient && !fromEnv.includes(defaultRecipient)) fromEnv.push(defaultRecipient);
	return fromEnv;
}
function resolveSupportRecipient(requestedRecipient) {
	const allowlist = supportRecipientsAllowlist();
	const normalizedRequested = requestedRecipient ? normalizeKeyValue(requestedRecipient) : "";
	if (!normalizedRequested) {
		if (allowlist.length === 0) throw new Error("Nenhum destinatário de suporte foi configurado.");
		return allowlist[0];
	}
	if (!allowlist.includes(normalizedRequested)) throw new Error("Destinatário de suporte não autorizado.");
	return normalizedRequested;
}
async function dispatchPlatformEmail(input) {
	const provider = (process.env["SUPPORT_EMAIL_PROVIDER"] ?? "log").trim().toLowerCase();
	if (provider === "resend") {
		const apiKey = process.env["SUPPORT_EMAIL_API_KEY"]?.trim();
		const fromEmail = process.env["SUPPORT_EMAIL_FROM"]?.trim();
		if (!apiKey || !fromEmail) throw new Error("Configuração de email incompleta: defina SUPPORT_EMAIL_API_KEY e SUPPORT_EMAIL_FROM.");
		const payload = {
			from: fromEmail,
			to: [input.to],
			subject: input.subject,
			text: input.text,
			reply_to: input.replyTo
		};
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Falha no envio de email (${response.status}): ${body}`);
		}
		return {
			delivered: true,
			provider: "resend",
			messageId: (await response.json()).id ?? null
		};
	}
	if (provider === "smtp") {
		const { default: nodemailer } = await import("nodemailer");
		const host = getEnv("SMTP_HOST", "smtp.gmail.com");
		const port = Number(getEnv("SMTP_PORT", "465"));
		const secure = getEnvBoolean("SMTP_SECURE", port === 465);
		const user = getEnv("SMTP_USER");
		const pass = getEnv("SMTP_PASS");
		const fromEmail = getEnv("SUPPORT_EMAIL_FROM") || getEnv("SMTP_FROM");
		if (!host || !port || !user || !pass || !fromEmail) throw new Error("Configuração SMTP incompleta. Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SUPPORT_EMAIL_FROM (ou SMTP_FROM).");
		return {
			delivered: true,
			provider: "smtp",
			messageId: (await nodemailer.createTransport({
				host,
				port,
				secure,
				auth: {
					user,
					pass
				}
			}).sendMail({
				from: fromEmail,
				to: input.to,
				subject: input.subject,
				text: input.text,
				replyTo: input.replyTo
			})).messageId ?? null
		};
	}
	if (provider !== "log") throw new Error("Provedor de email inválido. Use SUPPORT_EMAIL_PROVIDER=log, resend ou smtp.");
	console.info("[platform-email:log]", { ...input });
	return {
		delivered: false,
		provider: "log",
		messageId: null
	};
}
async function dispatchSupportEmail(input) {
	return dispatchPlatformEmail({
		to: input.recipientEmail,
		subject: `[Suporte Brasiltec] ${input.subject}`,
		text: [
			`Nome: ${input.senderName}`,
			`Email: ${input.senderEmail}`,
			`Destinatário: ${input.recipientEmail}`,
			"",
			"Mensagem:",
			input.message
		].join("\n"),
		replyTo: input.senderEmail
	});
}
async function maybeSendWelcomeEmail(input) {
	if (!getEnvBoolean("WELCOME_EMAIL_ENABLED", false)) return;
	const subject = getEnv("WELCOME_EMAIL_SUBJECT", "Bem-vindo(a) a Brasiltec");
	const appBaseUrl = getEnv("APP_BASE_URL", "https://brasiltec.net.br");
	try {
		await dispatchPlatformEmail({
			to: input.email,
			subject,
			text: [
				`Olá ${input.name},`,
				"",
				"Seu cadastro na Brasiltec foi concluído com sucesso.",
				`Acesse: ${appBaseUrl}`
			].join("\n")
		});
	} catch (error) {
		console.error("Falha ao enviar email de boas-vindas:", error);
	}
}
var adminPlatformSettingUpsertSchema = z.object({
	key: z.string().trim().min(3).max(80).regex(/^[a-z0-9._-]+$/i, "Chave inválida. Use letras, números, ponto, traço e underscore."),
	value: z.string().trim().min(1).max(500)
});
var adminModerationDecisionSchema = z.object({
	productId: z.string().trim().min(6),
	decision: z.enum(["approve", "reject"]),
	reason: z.string().trim().max(300).optional()
}).superRefine((value, ctx) => {
	if (value.decision === "reject" && (!value.reason || value.reason.length < 5)) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "Informe um motivo de ao menos 5 caracteres para rejeição.",
		path: ["reason"]
	});
});
var getAffiliateData_createServerFn_handler = createServerRpc({
	id: "854c73f62a4c43852f85afee953926ba583d74c1528c329724dafd8fbdf67234",
	name: "getAffiliateData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAffiliateData.__executeServer(opts));
var getAffiliateData = createServerFn({ method: "POST" }).handler(getAffiliateData_createServerFn_handler, async () => {
	return getAffiliateSummary((await requireSessionUser()).id);
});
var requestAffiliateAccess_createServerFn_handler = createServerRpc({
	id: "a226a97c19f5a30e04f818435855e43e1e7deb1372fa8d1e94483781ac028652",
	name: "requestAffiliateAccess",
	filename: "src/lib/auth-server.ts"
}, (opts) => requestAffiliateAccess.__executeServer(opts));
var requestAffiliateAccess = createServerFn({ method: "POST" }).handler(requestAffiliateAccess_createServerFn_handler, async () => {
	return requestAffiliate((await requireSessionUser()).id);
});
var registerUser_createServerFn_handler = createServerRpc({
	id: "4d1d34dc6a91e3222a939cc075b9fe93fea00d1ceffb53e140cddca37186d90d",
	name: "registerUser",
	filename: "src/lib/auth-server.ts"
}, (opts) => registerUser.__executeServer(opts));
var registerUser = createServerFn({ method: "POST" }).validator(registerSchema).handler(registerUser_createServerFn_handler, async ({ data }) => {
	const rateLimitKey = getRateLimitKey("register", data.email);
	enforceRateLimit(rateLimitKey);
	const user = await createUser({
		name: data.name,
		email: data.email,
		password: data.password,
		businessType: data.businessType
	});
	setSessionCookie((await createSession(user.id)).tokenHash);
	await maybeSendWelcomeEmail({
		name: user.name,
		email: user.email
	});
	clearRateLimit(rateLimitKey);
	return { user: {
		id: user.id,
		name: user.name,
		email: user.email,
		businessType: user.businessType
	} };
});
var loginUser_createServerFn_handler = createServerRpc({
	id: "66dab1fbf4d0d34f2e91194f8b4ed914776b0e841615aa896487eb6bc704f891",
	name: "loginUser",
	filename: "src/lib/auth-server.ts"
}, (opts) => loginUser.__executeServer(opts));
var loginUser = createServerFn({ method: "POST" }).validator(loginSchema).handler(loginUser_createServerFn_handler, async ({ data }) => {
	const rateLimitKey = getRateLimitKey("login", data.email);
	enforceRateLimit(rateLimitKey);
	const user = await authenticateUser({
		email: data.email,
		password: data.password
	});
	setSessionCookie((await createSession(user.id)).tokenHash);
	clearRateLimit(rateLimitKey);
	return { user: {
		id: user.id,
		name: user.name,
		email: user.email,
		businessType: user.businessType
	} };
});
var authenticateWithGoogle_createServerFn_handler = createServerRpc({
	id: "36c7f2958d478ec7b9baa9295de1be7aed3804f7c075c5cee7b54d211501e3d0",
	name: "authenticateWithGoogle",
	filename: "src/lib/auth-server.ts"
}, (opts) => authenticateWithGoogle.__executeServer(opts));
var authenticateWithGoogle = createServerFn({ method: "POST" }).validator(googleAuthSchema).handler(authenticateWithGoogle_createServerFn_handler, async ({ data }) => {
	const identity = await verifyGoogleCredential(data.credential);
	const rateLimitKey = getRateLimitKey("login", identity.email);
	enforceRateLimit(rateLimitKey);
	const user = await authenticateOrCreateGoogleUser({
		email: identity.email,
		name: identity.name,
		businessType: data.businessType
	});
	setSessionCookie((await createSession(user.id)).tokenHash);
	await maybeSendWelcomeEmail({
		name: user.name,
		email: user.email
	});
	clearRateLimit(rateLimitKey);
	return { user: {
		id: user.id,
		name: user.name,
		email: user.email,
		businessType: user.businessType
	} };
});
var getSessionData_createServerFn_handler = createServerRpc({
	id: "8a6eaf16395b89224a24a18abd7e0946e19577f54cf86351d3b9687d9c475e46",
	name: "getSessionData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getSessionData.__executeServer(opts));
var getSessionData = createServerFn({ method: "POST" }).handler(getSessionData_createServerFn_handler, async () => {
	const token = readSessionCookie();
	const session = await getSession(token);
	if (!session) throw new Error("Sessão não encontrada.");
	const rotated = await rotateSession(token);
	if (rotated) setSessionCookie(rotated.token);
	return { user: {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		businessType: session.user.businessType
	} };
});
var logoutUser_createServerFn_handler = createServerRpc({
	id: "4a6e4879b0aa3e1be65ec8f9752065dd970b9ffff5081dc8a7d17774a4483ca0",
	name: "logoutUser",
	filename: "src/lib/auth-server.ts"
}, (opts) => logoutUser.__executeServer(opts));
var logoutUser = createServerFn({ method: "POST" }).handler(logoutUser_createServerFn_handler, async () => {
	const token = getCookie(sessionCookieName);
	if (token) await deleteSession(token);
	deleteCookie(sessionCookieName, { path: "/" });
	return { ok: true };
});
var requestPasswordResetEmail_createServerFn_handler = createServerRpc({
	id: "cac436954c5cc72954c133864be2d59f1a400e37b882d5d3c51116caa70c488e",
	name: "requestPasswordResetEmail",
	filename: "src/lib/auth-server.ts"
}, (opts) => requestPasswordResetEmail.__executeServer(opts));
var requestPasswordResetEmail = createServerFn({ method: "POST" }).validator(forgotPasswordSchema).handler(requestPasswordResetEmail_createServerFn_handler, async ({ data }) => {
	return await requestPasswordReset(data.email);
});
var sendSupportContactEmail_createServerFn_handler = createServerRpc({
	id: "0a0eeb62c2b34d998d5968be0b1a9bf6665ae66ed4733b714bdf2e076cfb9df8",
	name: "sendSupportContactEmail",
	filename: "src/lib/auth-server.ts"
}, (opts) => sendSupportContactEmail.__executeServer(opts));
var sendSupportContactEmail = createServerFn({ method: "POST" }).validator(supportContactSchema).handler(sendSupportContactEmail_createServerFn_handler, async ({ data }) => {
	const recipientEmail = resolveSupportRecipient(data.recipientEmail);
	const key = supportRateLimitKey(data.senderEmail, recipientEmail);
	enforceRateLimit(key);
	const dispatchResult = await dispatchSupportEmail({
		senderName: data.name,
		senderEmail: data.senderEmail,
		recipientEmail,
		subject: data.subject,
		message: data.message
	});
	clearRateLimit(key);
	return {
		ok: true,
		recipientEmail,
		provider: dispatchResult.provider,
		delivered: dispatchResult.delivered,
		messageId: dispatchResult.messageId
	};
});
var resetPasswordByToken_createServerFn_handler = createServerRpc({
	id: "eaacb9145f9d0c5f89098ff738c639a9be02b80d002239f0b828b59ce15e3351",
	name: "resetPasswordByToken",
	filename: "src/lib/auth-server.ts"
}, (opts) => resetPasswordByToken.__executeServer(opts));
var resetPasswordByToken = createServerFn({ method: "POST" }).validator(resetPasswordSchema).handler(resetPasswordByToken_createServerFn_handler, async ({ data }) => {
	await resetPasswordWithToken(data.token, data.password);
	return { ok: true };
});
var getDashboardData_createServerFn_handler = createServerRpc({
	id: "03a7fd167e548f02dc77a992113fe2e2bfedf936075b04da72a5f269cc9ee8ad",
	name: "getDashboardData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getDashboardData.__executeServer(opts));
var getDashboardData = createServerFn({ method: "POST" }).handler(getDashboardData_createServerFn_handler, async () => getDashboardSummary());
var getAdminData_createServerFn_handler = createServerRpc({
	id: "2184971d323bfe6364cb1b515ca85aaf15b4cd391db0a7228645245547a5c786",
	name: "getAdminData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminData.__executeServer(opts));
var getAdminData = createServerFn({ method: "POST" }).handler(getAdminData_createServerFn_handler, async () => {
	await requireAdminAccess(await requireSessionUser(), "view");
	return getAdminOverview();
});
var getAdminPaymentOpsData_createServerFn_handler = createServerRpc({
	id: "910d5406afa57021507d84e91d0817feccb0562fd50fc0540d1cd5122973d87c",
	name: "getAdminPaymentOpsData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminPaymentOpsData.__executeServer(opts));
var getAdminPaymentOpsData = createServerFn({ method: "POST" }).validator(adminPaymentOpsQuerySchema.optional()).handler(getAdminPaymentOpsData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	return getPaymentWebhookOpsSummary(data?.hours ?? 24, data?.failureLimit ?? 10);
});
var runAdminPaymentReconciliationData_createServerFn_handler = createServerRpc({
	id: "346190d43ad6a24941195587f8506962e5d08bc13f3ac57fd8b6aed382f01f11",
	name: "runAdminPaymentReconciliationData",
	filename: "src/lib/auth-server.ts"
}, (opts) => runAdminPaymentReconciliationData.__executeServer(opts));
var runAdminPaymentReconciliationData = createServerFn({ method: "POST" }).validator(adminPaymentReconcileSchema.optional()).handler(runAdminPaymentReconciliationData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "manage_roles");
	const options = {
		...data?.limit !== void 0 ? { limit: data.limit } : {},
		...data?.minOrderAgeMinutes !== void 0 ? { minOrderAgeMinutes: data.minOrderAgeMinutes } : {}
	};
	return runPaymentGatewayReconciliation(Object.keys(options).length > 0 ? options : void 0);
});
var getAdminAccessData_createServerFn_handler = createServerRpc({
	id: "412928fe10585166b11009df59e45bf52fd0e1c7622efc9c7f0f9fc09ab91c56",
	name: "getAdminAccessData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminAccessData.__executeServer(opts));
var getAdminAccessData = createServerFn({ method: "POST" }).handler(getAdminAccessData_createServerFn_handler, async () => {
	const role = await requireAdminAccess(await requireSessionUser(), "view");
	return {
		role,
		canModerate: hasAdminPermission(role, "moderate"),
		canManageRoles: hasAdminPermission(role, "manage_roles")
	};
});
var getAdminRoleDirectoryData_createServerFn_handler = createServerRpc({
	id: "38565f75d65462d1380a8815ee8ca79f7bbc32abcb0e9f60b3722dbcd5495fae",
	name: "getAdminRoleDirectoryData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminRoleDirectoryData.__executeServer(opts));
var getAdminRoleDirectoryData = createServerFn({ method: "POST" }).validator(adminRoleDirectoryQuerySchema.optional()).handler(getAdminRoleDirectoryData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	return listAdminUserRoles(data?.limit ?? 30);
});
var getPlatformSettingsData_createServerFn_handler = createServerRpc({
	id: "dffb32a53678c57ec2cc46855d0dfb8faf96a13e4c7d109926ca3590b801b773",
	name: "getPlatformSettingsData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getPlatformSettingsData.__executeServer(opts));
var getPlatformSettingsData = createServerFn({ method: "POST" }).validator(adminPlatformSettingsQuerySchema.optional()).handler(getPlatformSettingsData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	return listPlatformSettings(data?.limit ?? 100);
});
var updatePlatformSettingData_createServerFn_handler = createServerRpc({
	id: "5cee0d4be6b22659af1f699e4624972c1b3c190be1031086fefe8e8aa7fee8c8",
	name: "updatePlatformSettingData",
	filename: "src/lib/auth-server.ts"
}, (opts) => updatePlatformSettingData.__executeServer(opts));
var updatePlatformSettingData = createServerFn({ method: "POST" }).validator(adminPlatformSettingUpsertSchema).handler(updatePlatformSettingData_createServerFn_handler, async ({ data }) => {
	const user = await requireSessionUser();
	await requireAdminAccess(user, "manage_roles");
	return upsertPlatformSetting(data.key, data.value, user.id);
});
var getAdminRoleAuditData_createServerFn_handler = createServerRpc({
	id: "77a962dd5e4b5314ebd8a39628bce8bbce4be3773ad2af56d7d589d2a323b1ba",
	name: "getAdminRoleAuditData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminRoleAuditData.__executeServer(opts));
var getAdminRoleAuditData = createServerFn({ method: "POST" }).validator(adminRoleAuditQuerySchema.optional()).handler(getAdminRoleAuditData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	const filters = {
		...data?.userQuery ? { userQuery: data.userQuery } : {},
		...data?.action ? { action: data.action } : {},
		...data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {},
		...data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}
	};
	return listAdminRoleAudit(data?.limit ?? 20, filters);
});
var assignAdminUserRoleData_createServerFn_handler = createServerRpc({
	id: "6a37b87897435a5b68f1a2fa4daa92f08e0a53859e5ecce144de8ae94e2a502f",
	name: "assignAdminUserRoleData",
	filename: "src/lib/auth-server.ts"
}, (opts) => assignAdminUserRoleData.__executeServer(opts));
var assignAdminUserRoleData = createServerFn({ method: "POST" }).validator(adminRoleAssignmentSchema).handler(assignAdminUserRoleData_createServerFn_handler, async ({ data }) => {
	const user = await requireSessionUser();
	await requireAdminAccess(user, "manage_roles");
	const currentRole = await getUserAdminRole(data.userId);
	const isAdminPromotion = currentRole !== "admin" && data.role === "admin";
	if (isAdminPromotion && !data.confirmAdminPromotion) throw new Error("Promoção para admin exige segunda confirmação explícita.");
	if (isAdminPromotion && (!data.approvalNote || data.approvalNote.trim().length < 5)) throw new Error("Promoção para admin exige justificativa com ao menos 5 caracteres.");
	if (currentRole === "admin" && data.role !== "admin") {
		if (await countAdminUsers() <= 1) throw new Error("Operação bloqueada: não é permitido remover ou rebaixar o último admin da plataforma.");
	}
	if (user.id === data.userId && data.role !== "admin") throw new Error("Não é permitido remover seu próprio acesso administrativo principal.");
	await setUserAdminRole(data.userId, data.role, user.id, "admin-panel", {
		approvedByUserId: isAdminPromotion ? user.id : null,
		approvalNote: isAdminPromotion ? data.approvalNote ?? null : null
	});
	return { ok: true };
});
var getAdminModerationQueueData_createServerFn_handler = createServerRpc({
	id: "aa1c6a22631cd1a71b1e742b98f177561413f66806055cc43b4e331c5296e6ce",
	name: "getAdminModerationQueueData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminModerationQueueData.__executeServer(opts));
var getAdminModerationQueueData = createServerFn({ method: "POST" }).validator(adminModerationQuerySchema.optional()).handler(getAdminModerationQueueData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	const filters = {
		...data?.status ? { status: data.status } : {},
		...data?.category ? { category: data.category } : {},
		...data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {},
		...data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}
	};
	return listAdminModerationQueue(data?.limit ?? 20, filters);
});
var getAdminModerationAuditData_createServerFn_handler = createServerRpc({
	id: "b0d2be773660da164e82b03ba275e2018adb433e3e3eafc4bd9fabc081b51490",
	name: "getAdminModerationAuditData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminModerationAuditData.__executeServer(opts));
var getAdminModerationAuditData = createServerFn({ method: "POST" }).validator(adminModerationAuditQuerySchema.optional()).handler(getAdminModerationAuditData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	return listAdminModerationAudit(data?.limit ?? 20);
});
var getAdminConsolidatedAuditData_createServerFn_handler = createServerRpc({
	id: "3aa4a15ee0898ae0990c22512f51da3e029219b79a45a4af16eefdf3de0e0be6",
	name: "getAdminConsolidatedAuditData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getAdminConsolidatedAuditData.__executeServer(opts));
var getAdminConsolidatedAuditData = createServerFn({ method: "POST" }).validator(adminConsolidatedAuditQuerySchema.optional()).handler(getAdminConsolidatedAuditData_createServerFn_handler, async ({ data }) => {
	await requireAdminAccess(await requireSessionUser(), "view");
	const filters = {
		...data?.eventType ? { eventType: data.eventType } : {},
		...data?.actorQuery ? { actorQuery: data.actorQuery } : {},
		...data?.fromCreatedAt ? { fromCreatedAt: data.fromCreatedAt } : {},
		...data?.toCreatedAt ? { toCreatedAt: data.toCreatedAt } : {}
	};
	return listAdminConsolidatedAudit(data?.limit ?? 30, filters);
});
var moderateAdminProductDecision_createServerFn_handler = createServerRpc({
	id: "1d7eb6cd6c86c504d9417d8e2b07a3c9e4b1f7fe84a3f6af32dc5ddd1d3061ca",
	name: "moderateAdminProductDecision",
	filename: "src/lib/auth-server.ts"
}, (opts) => moderateAdminProductDecision.__executeServer(opts));
var moderateAdminProductDecision = createServerFn({ method: "POST" }).validator(adminModerationDecisionSchema).handler(moderateAdminProductDecision_createServerFn_handler, async ({ data }) => {
	const user = await requireSessionUser();
	await requireAdminAccess(user, "moderate");
	return moderateAdminProduct(user.id, data.productId, data.decision, data.reason ?? null);
});
var createProductDraft_createServerFn_handler = createServerRpc({
	id: "dfcf4f7c914a79e0c2004943b9a124817f977c6834a742332d5248de21c2f6d4",
	name: "createProductDraft",
	filename: "src/lib/auth-server.ts"
}, (opts) => createProductDraft.__executeServer(opts));
var createProductDraft = createServerFn({ method: "POST" }).validator(createProductSchema).handler(createProductDraft_createServerFn_handler, async ({ data }) => {
	return createProduct((await requireSessionUser()).id, data);
});
var publishProductById_createServerFn_handler = createServerRpc({
	id: "f29f14505ce315f6f2da677de9262e129d7558089ff84929276123488383a35c",
	name: "publishProductById",
	filename: "src/lib/auth-server.ts"
}, (opts) => publishProductById.__executeServer(opts));
var publishProductById = createServerFn({ method: "POST" }).validator(publishProductSchema).handler(publishProductById_createServerFn_handler, async ({ data }) => {
	return publishProduct((await requireSessionUser()).id, data.productId);
});
var getMyProducts_createServerFn_handler = createServerRpc({
	id: "bb04bcc919dd858b2e077e06193267330d73c00b1498ac0767b2fe98ca54f6c5",
	name: "getMyProducts",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyProducts.__executeServer(opts));
var getMyProducts = createServerFn({ method: "POST" }).handler(getMyProducts_createServerFn_handler, async () => {
	return listMyProducts((await requireSessionUser()).id);
});
var getMarketplaceProducts_createServerFn_handler = createServerRpc({
	id: "4f739a006f4d41812466f555d1466b83b651afac4a0ed656f8e89066eff88311",
	name: "getMarketplaceProducts",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMarketplaceProducts.__executeServer(opts));
var getMarketplaceProducts = createServerFn({ method: "POST" }).handler(getMarketplaceProducts_createServerFn_handler, async () => listMarketplaceProducts());
var getMarketplaceProductDetails_createServerFn_handler = createServerRpc({
	id: "a1af91ad6018682ec2e847f7fcfc695b27b58c9bbe20014c5560ec39ddd52ed7",
	name: "getMarketplaceProductDetails",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMarketplaceProductDetails.__executeServer(opts));
var getMarketplaceProductDetails = createServerFn({ method: "POST" }).validator(marketplaceProductSchema).handler(getMarketplaceProductDetails_createServerFn_handler, async ({ data }) => {
	return getMarketplaceProductById(data.productId);
});
var buyMarketplaceProduct_createServerFn_handler = createServerRpc({
	id: "6083e5d695652a4a423dc2af18c0a17263f38bb8d6aa42bd877265bf36f0be89",
	name: "buyMarketplaceProduct",
	filename: "src/lib/auth-server.ts"
}, (opts) => buyMarketplaceProduct.__executeServer(opts));
var buyMarketplaceProduct = createServerFn({ method: "POST" }).validator(buyProductSchema).handler(buyMarketplaceProduct_createServerFn_handler, async ({ data }) => {
	return buyProduct((await requireSessionUser()).id, data.productId, data.paymentMethod);
});
var createMarketplaceCheckoutOrder_createServerFn_handler = createServerRpc({
	id: "b5b171850086b95ae7ef9b2ed80035372546e764864664239f6a619a5e020ff8",
	name: "createMarketplaceCheckoutOrder",
	filename: "src/lib/auth-server.ts"
}, (opts) => createMarketplaceCheckoutOrder.__executeServer(opts));
var createMarketplaceCheckoutOrder = createServerFn({ method: "POST" }).validator(buyProductSchema).handler(createMarketplaceCheckoutOrder_createServerFn_handler, async ({ data }) => {
	return createCheckoutOrder((await requireSessionUser()).id, data.productId, data.paymentMethod);
});
var transitionMarketplaceOrderStatus_createServerFn_handler = createServerRpc({
	id: "fb28a54735ec8897e342ce7379c0c9f154c3c16970a4c7583ac8d6cb3f2677aa",
	name: "transitionMarketplaceOrderStatus",
	filename: "src/lib/auth-server.ts"
}, (opts) => transitionMarketplaceOrderStatus.__executeServer(opts));
var transitionMarketplaceOrderStatus = createServerFn({ method: "POST" }).validator(transitionOrderSchema).handler(transitionMarketplaceOrderStatus_createServerFn_handler, async ({ data }) => {
	return transitionCheckoutOrderStatus((await requireSessionUser()).id, data.orderId, data.status);
});
var getMyOrders_createServerFn_handler = createServerRpc({
	id: "033e00a352ae3c6903309220eeeddf5485ba136aef3dfbfa43f846e422a227be",
	name: "getMyOrders",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyOrders.__executeServer(opts));
var getMyOrders = createServerFn({ method: "POST" }).validator(orderFiltersSchema.optional()).handler(getMyOrders_createServerFn_handler, async ({ data }) => {
	const user = await requireSessionUser();
	const filters = {
		status: data?.status,
		productId: data?.productId,
		fromCreatedAt: data?.fromCreatedAt,
		toCreatedAt: data?.toCreatedAt
	};
	return listMyOrders(user.id, filters);
});
var getMyOrderTimeline_createServerFn_handler = createServerRpc({
	id: "e20bd12798bd94dc5122d6135a1287c852d17e83332a127a1edbd7dc4c84a98e",
	name: "getMyOrderTimeline",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyOrderTimeline.__executeServer(opts));
var getMyOrderTimeline = createServerFn({ method: "POST" }).validator(orderTimelineSchema).handler(getMyOrderTimeline_createServerFn_handler, async ({ data }) => {
	return listMyOrderTimeline((await requireSessionUser()).id, data.orderId);
});
var getMyLearningTrack_createServerFn_handler = createServerRpc({
	id: "0616dae5d3780b6651b60060046adcc5a84a4924ae8131724ba7ac693b631c6b",
	name: "getMyLearningTrack",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyLearningTrack.__executeServer(opts));
var getMyLearningTrack = createServerFn({ method: "POST" }).validator(learningTrackSchema).handler(getMyLearningTrack_createServerFn_handler, async ({ data }) => {
	return listMyLearningTrack((await requireSessionUser()).id, data.productId);
});
var setLessonProgress_createServerFn_handler = createServerRpc({
	id: "9dadd49073bf73c47d4428a63efe88fcf16b7dc1523907d23628804ef7950605",
	name: "setLessonProgress",
	filename: "src/lib/auth-server.ts"
}, (opts) => setLessonProgress.__executeServer(opts));
var setLessonProgress = createServerFn({ method: "POST" }).validator(lessonProgressSchema).handler(setLessonProgress_createServerFn_handler, async ({ data }) => {
	return updateMyLessonProgress((await requireSessionUser()).id, data.lessonId, data.completed);
});
var getMyEnrollments_createServerFn_handler = createServerRpc({
	id: "e4f75f33f6e32df4bbef8724cb6434da31731702c3e7ace50d5f86cbe0729fcb",
	name: "getMyEnrollments",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyEnrollments.__executeServer(opts));
var getMyEnrollments = createServerFn({ method: "POST" }).handler(getMyEnrollments_createServerFn_handler, async () => {
	return listMyEnrollments((await requireSessionUser()).id);
});
var getFinanceData_createServerFn_handler = createServerRpc({
	id: "5d35e3ec0270887b318dfe5f2be29d41409f131f30f1e902000e46c1722b243a",
	name: "getFinanceData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getFinanceData.__executeServer(opts));
var getFinanceData = createServerFn({ method: "POST" }).handler(getFinanceData_createServerFn_handler, async () => {
	return getFinanceSummary((await requireSessionUser()).id);
});
var createWithdrawalRequest_createServerFn_handler = createServerRpc({
	id: "f631447be702ee9616ee0512a586732d2bbe83c7b398bcc22129a13f8696e7d3",
	name: "createWithdrawalRequest",
	filename: "src/lib/auth-server.ts"
}, (opts) => createWithdrawalRequest.__executeServer(opts));
var createWithdrawalRequest = createServerFn({ method: "POST" }).validator(requestWithdrawalSchema).handler(createWithdrawalRequest_createServerFn_handler, async ({ data }) => {
	return requestWithdrawal((await requireSessionUser()).id, data.amountCents, data.method);
});
var getMyNotificationsData_createServerFn_handler = createServerRpc({
	id: "b5bc40e373756ac89440c29757423d108e298f6cf4e836681b3095fd6072e8f3",
	name: "getMyNotificationsData",
	filename: "src/lib/auth-server.ts"
}, (opts) => getMyNotificationsData.__executeServer(opts));
var getMyNotificationsData = createServerFn({ method: "POST" }).handler(getMyNotificationsData_createServerFn_handler, async () => {
	return listMyNotifications((await requireSessionUser()).id, 30);
});
var readMyNotification_createServerFn_handler = createServerRpc({
	id: "91e4fcd5e3fb6d1c7b76fad3744f90efd6d0adec552e0d77ea633beb1031f543",
	name: "readMyNotification",
	filename: "src/lib/auth-server.ts"
}, (opts) => readMyNotification.__executeServer(opts));
var readMyNotification = createServerFn({ method: "POST" }).validator(readNotificationSchema).handler(readMyNotification_createServerFn_handler, async ({ data }) => {
	await markMyNotificationRead((await requireSessionUser()).id, data.notificationId);
	return { ok: true };
});
var readAllMyNotifications_createServerFn_handler = createServerRpc({
	id: "638731b486d455118e8446c733b64a10bb7648ee1eaf95d1784d71507e830468",
	name: "readAllMyNotifications",
	filename: "src/lib/auth-server.ts"
}, (opts) => readAllMyNotifications.__executeServer(opts));
var readAllMyNotifications = createServerFn({ method: "POST" }).handler(readAllMyNotifications_createServerFn_handler, async () => {
	await markAllMyNotificationsRead((await requireSessionUser()).id);
	return { ok: true };
});
//#endregion
export { assignAdminUserRoleData_createServerFn_handler, authenticateWithGoogle_createServerFn_handler, buyMarketplaceProduct_createServerFn_handler, createMarketplaceCheckoutOrder_createServerFn_handler, createProductDraft_createServerFn_handler, createWithdrawalRequest_createServerFn_handler, getAdminAccessData_createServerFn_handler, getAdminConsolidatedAuditData_createServerFn_handler, getAdminData_createServerFn_handler, getAdminModerationAuditData_createServerFn_handler, getAdminModerationQueueData_createServerFn_handler, getAdminPaymentOpsData_createServerFn_handler, getAdminRoleAuditData_createServerFn_handler, getAdminRoleDirectoryData_createServerFn_handler, getAffiliateData_createServerFn_handler, getDashboardData_createServerFn_handler, getFinanceData_createServerFn_handler, getMarketplaceProductDetails_createServerFn_handler, getMarketplaceProducts_createServerFn_handler, getMyEnrollments_createServerFn_handler, getMyLearningTrack_createServerFn_handler, getMyNotificationsData_createServerFn_handler, getMyOrderTimeline_createServerFn_handler, getMyOrders_createServerFn_handler, getMyProducts_createServerFn_handler, getPlatformSettingsData_createServerFn_handler, getSessionData_createServerFn_handler, loginUser_createServerFn_handler, logoutUser_createServerFn_handler, moderateAdminProductDecision_createServerFn_handler, publishProductById_createServerFn_handler, readAllMyNotifications_createServerFn_handler, readMyNotification_createServerFn_handler, registerUser_createServerFn_handler, requestAffiliateAccess_createServerFn_handler, requestPasswordResetEmail_createServerFn_handler, resetPasswordByToken_createServerFn_handler, runAdminPaymentReconciliationData_createServerFn_handler, sendSupportContactEmail_createServerFn_handler, setLessonProgress_createServerFn_handler, transitionMarketplaceOrderStatus_createServerFn_handler, updatePlatformSettingData_createServerFn_handler };
