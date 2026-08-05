import { readdir, stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const backupDir = process.env.SQLITE_BACKUP_DIR?.trim() || '.backups';
  const keepCount = Number(process.env.SQLITE_BACKUP_KEEP ?? '10');

  if (!Number.isInteger(keepCount) || keepCount < 1) {
    console.error('SQLITE_BACKUP_KEEP deve ser um inteiro maior ou igual a 1.');
    process.exitCode = 1;
    return;
  }

  const resolvedDir = resolve(process.cwd(), backupDir);
  const entries = await readdir(resolvedDir, { withFileTypes: true });
  const backups = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.sqlite')) {
      continue;
    }

    const fullPath = resolve(resolvedDir, entry.name);
    const info = await stat(fullPath);
    backups.push({ path: fullPath, name: entry.name, mtimeMs: info.mtimeMs });
  }

  backups.sort((left, right) => right.mtimeMs - left.mtimeMs);

  const toRemove = backups.slice(keepCount);
  for (const backup of toRemove) {
    await unlink(backup.path);
  }

  console.log(`Backups mantidos: ${Math.min(keepCount, backups.length)}`);
  console.log(`Backups removidos: ${toRemove.length}`);
}

main().catch((error) => {
  console.error('Falha ao limpar backups SQLite:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
