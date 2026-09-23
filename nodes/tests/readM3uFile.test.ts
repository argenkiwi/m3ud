import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../readM3uFile.ts";

const edges = { onResolve: "resolve", onDownload: "download" } as const;
const initialState: State = { m3uFilePath: "list.m3u", urls: [] };

function mockUtils(content: string): Utils {
  return {
    readTextFile: (_path) => Promise.resolve(content),
    print: (_msg) => {},
  };
}

Deno.test("readM3uFileNode should go to resolve when a khinsider URL is present", async () => {
  const content = [
    "#EXTM3U",
    "",
    "https://example.com/a.mp3",
    "  https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3  ",
    "# comment",
  ].join("\n");
  const result = await factory(edges, mockUtils(content))(initialState);
  assertEquals(result[0], "resolve");
  assertEquals(result[1].urls, [
    "https://example.com/a.mp3",
    "https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3",
  ]);
});

Deno.test("readM3uFileNode should go to download when no khinsider URL is present", async () => {
  const content = "#EXTM3U\r\nhttps://example.com/a.mp3\r\n\r\nhttps://example.com/b.mp3\r\n";
  const result = await factory(edges, mockUtils(content))(initialState);
  assertEquals(result[0], "download");
  assertEquals(result[1].urls, [
    "https://example.com/a.mp3",
    "https://example.com/b.mp3",
  ]);
  assertEquals(result[1].m3uFilePath, "list.m3u");
});
