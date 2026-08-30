import { copyFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const source = process.argv[2]?.trim() || process.env.SQLITE_BACKUP_FILE?.trim();
  const destination = process.env.SQLITE_PATH?.trim() || '.data/brasiltec.sqlite';

  if (!source) {
    console.error('Uso: npm run restore:sqlite -- <arquivo-backup.sqlite>');
    process.exitCode = 1;
    return;
  }

  const resolvedSource = resolve(process.cwd(), source);
  const resolvedDestination = resolve(process.cwd(), destination);

  await access(resolvedSource);
  await copyFile(resolvedSource, resolvedDestination);

  console.log(`Backup restaurado de ${resolvedSource} para ${resolvedDestination}`);
}

main().catch((error) => {
  console.error('Falha ao restaurar backup SQLite:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
