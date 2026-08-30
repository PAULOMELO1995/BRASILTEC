import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function runScript(scriptName, args = []) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [resolve(rootDir, 'scripts', scriptName), ...args], {
      stdio: 'inherit',
      env: process.env,
      cwd: rootDir,
    });

    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${scriptName} saiu com código ${code}`));
      }
    });
  });
}

async function main() {
  const keepCount = process.env.SQLITE_BACKUP_KEEP?.trim();
  const backupDir = process.env.SQLITE_BACKUP_DIR?.trim();

  const backupEnv = [];
  if (keepCount) backupEnv.push(`SQLITE_BACKUP_KEEP=${keepCount}`);
  if (backupDir) backupEnv.push(`SQLITE_BACKUP_DIR=${backupDir}`);

  if (backupEnv.length) {
    console.log(`Usando: ${backupEnv.join(' ')}`);
  }

  await runScript('backup-sqlite.mjs');
  await runScript('prune-sqlite-backups.mjs');
}

main().catch((error) => {
  console.error('Falha na manutenção SQLite:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
