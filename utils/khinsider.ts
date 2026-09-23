const KHINSIDER_HOST = "https://downloads.khinsider.com";
const KHINSIDER_PREFIX = `${KHINSIDER_HOST}/game-soundtracks`;
const MP3_HREF_PATTERN = /href="(https?:\/\/[^"]+\.mp3)"/gi;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

/**
 * Checks whether a URL points to a khinsider track page that needs resolving.
 *
 * @param url - The URL to check
 * @returns True if the URL is a khinsider game-soundtracks URL
 */
export function isKhinsiderUrl(url: string): boolean {
  return url.startsWith(KHINSIDER_PREFIX);
}

/**
 * Extracts the direct MP3 download link from a khinsider track page's HTML.
 * Links back to khinsider itself (e.g. the canonical track page URL) are skipped.
 *
 * @param html - The track page HTML
 * @returns The direct MP3 URL, or null if none is found
 */
export function extractMp3Url(html: string): string | null {
  for (const [, href] of html.matchAll(MP3_HREF_PATTERN)) {
    if (!href.startsWith(KHINSIDER_HOST)) return href;
  }
  return null;
}

/**
 * Resolves a khinsider track page URL to its direct MP3 download link.
 *
 * @param url - The khinsider track page URL
 * @returns The direct MP3 download URL
 */
export async function resolveKhinsiderUrl(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const mp3Url = extractMp3Url(await res.text());
  if (!mp3Url) throw new Error(`No MP3 link found on ${url}`);
  return mp3Url;
}
