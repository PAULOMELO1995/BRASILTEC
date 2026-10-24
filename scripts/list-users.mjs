import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

function printUsers(rows) {
  if (rows.length === 0) {
    console.log("Nenhum usuário encontrado no banco configurado.");
    return;
  }

  console.table(rows);
  console.log(`Total de usuários: ${rows.length}`);
}

async function listPostgresUsers(connectionString) {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const schemaResult = await client.query(
      `SELECT current_schema() AS schema,
              EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = current_schema()
           AND table_name = 'users'
       ) AS table_exists`,
    );

    if (!schemaResult.rows[0]?.table_exists) {
      throw new Error(
        `A tabela users não existe no esquema "${schemaResult.rows[0]?.schema ?? "desconhecido"}" do banco configurado.`,
      );
    }

    const result = await client.query(
      "SELECT name, email, created_at FROM users ORDER BY created_at DESC",
    );
    printUsers(result.rows);
  } finally {
    await client.end();
  }
}

function getSqlitePath() {
  const configuredPath = process.env.SQLITE_PATH?.trim();
  if (configuredPath) return configuredPath;

  if (databaseUrl?.startsWith("sqlite:")) {
    const sqlitePath = databaseUrl.slice("sqlite:".length).trim();
    if (sqlitePath) return sqlitePath;
  }

  return ".data/brasiltec.sqlite";
}

function listSqliteUsers(filePath) {
  const database = new DatabaseSync(resolve(process.cwd(), filePath), {
    readOnly: true,
  });

  try {
    const table = database
      .prepare("SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?")
      .get("table", "users");

    if (!table) {
      throw new Error(
        `A tabela users não existe no banco SQLite "${filePath}".`,
      );
    }

    const columns = database.prepare("PRAGMA table_info(users)").all();
    if (
      !columns.some((column) => column.name === "name") ||
      !columns.some((column) => column.name === "email")
    ) {
      throw new Error(
        "A tabela users não contém as colunas esperadas de nome e email.",
      );
    }

    const hasCreatedAt = columns.some((column) => column.name === "created_at");
    const rows = database
      .prepare(
        hasCreatedAt
          ? "SELECT name, email, created_at FROM users ORDER BY created_at DESC"
          : "SELECT name, email FROM users ORDER BY name",
      )
      .all();
    printUsers(rows);
  } finally {
    database.close();
  }
}

try {
  if (databaseUrl && !databaseUrl.startsWith("sqlite:")) {
    await listPostgresUsers(databaseUrl);
  } else {
    listSqliteUsers(getSqlitePath());
  }
} catch (error) {
  console.error(
    "Falha ao listar usuários:",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}
