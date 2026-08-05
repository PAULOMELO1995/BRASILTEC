import type { Download } from "@playwright/test";

export async function readDownloadText(download: Download): Promise<string> {
  const stream = await download.createReadStream();
  if (!stream) return "";

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}