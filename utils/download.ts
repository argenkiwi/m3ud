import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

const FALLBACK_NAME = "download";

/**
 * Downloads a URL into a directory, naming the file after the URL's last path segment.
 *
 * @param url - The URL to download
 * @param dir - The destination directory (must exist)
 * @returns The path of the downloaded file
 */
export async function downloadFile(url: string, dir: string): Promise<string> {
  const segment = new URL(url).pathname.split("/").pop() ?? "";
  const name = decodeURIComponent(segment) || FALLBACK_NAME;
  const dest = join(dir, name);

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    await res.body?.cancel();
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }

  await pipeline(
    Readable.fromWeb(res.body as WebReadableStream<Uint8Array>),
    createWriteStream(dest),
  );
  return dest;
}
