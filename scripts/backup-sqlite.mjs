import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

async function main() {
  const source = process.env.SQLITE_PATH?.trim() || '.data/brasiltec.sqlite';
  const backupDir = process.env.SQLITE_BACKUP_DIR?.trim() || '.backups';
  const resolvedSource = resolve(process.cwd(), source);
  const resolvedBackupDir = resolve(process.cwd(), backupDir);
  const backupFile = join(resolvedBackupDir, `brasiltec-${timestamp()}.sqlite`);

  await access(resolvedSource);
  await mkdir(dirname(backupFile), { recursive: true });
  await copyFile(resolvedSource, backupFile);

  console.log(`Backup criado em: ${backupFile}`);
}

main().catch((error) => {
  console.error('Falha ao criar backup SQLite:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
