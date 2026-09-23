import { join } from "@std/path";

/**
 * Downloads a URL into a directory, naming the file after the URL's last path segment.
 *
 * @param url - The URL to download
 * @param dir - The destination directory (must exist)
 * @returns The path of the downloaded file
 */
export async function downloadFile(url: string, dir: string): Promise<string> {
  const segment = new URL(url).pathname.split("/").pop() ?? "";
  const name = decodeURIComponent(segment) || "download";
  const dest = join(dir, name);

  const res = await fetch(url);
  if (!res.ok || !res.body) {
    await res.body?.cancel();
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }

  const file = await Deno.open(dest, { write: true, create: true, truncate: true });
  await res.body.pipeTo(file.writable);
  return dest;
}
