import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const directory = mkdtempSync(join(tmpdir(), "brasiltec-registration-"));
const databasePath = join(directory, "brasiltec.sqlite");

try {
  const result = spawnSync(
    process.execPath,
    [
      join(root, "node_modules", "@playwright", "test", "cli.js"),
      "test",
      "-c",
      "playwright.registration.config.ts",
    ],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        REGISTRATION_TEST_SQLITE_PATH: relative(root, databasePath),
      },
    },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  for (const suffix of ["", "-shm", "-wal", "-journal"]) {
    rmSync(`${databasePath}${suffix}`, { force: true });
  }
  rmdirSync(directory);
}
