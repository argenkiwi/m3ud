import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../read-m3u-file.ts";

const edges = { onResolve: "resolve", onDownload: "download" } as const;
const initialState: State = { m3uFilePath: "list.m3u", urls: [] };

function mockUtils(content: string): Utils {
  return {
    readTextFile: (_path) => Promise.resolve(content),
    print: (_msg) => {},
  };
}

test("readM3uFileNode should go to resolve when a khinsider URL is present", async () => {
  const content = [
    "#EXTM3U",
    "",
    "https://example.com/a.mp3",
    "  https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3  ",
    "# comment",
  ].join("\n");
  const result = await factory(edges, mockUtils(content))(initialState);
  expect(result[0]).toEqual("resolve");
  expect(result[1].urls).toEqual([
    "https://example.com/a.mp3",
    "https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3",
  ]);
});

test("readM3uFileNode should go to download when no khinsider URL is present", async () => {
  const content =
    "#EXTM3U\r\nhttps://example.com/a.mp3\r\n\r\nhttps://example.com/b.mp3\r\n";
  const result = await factory(edges, mockUtils(content))(initialState);
  expect(result[0]).toEqual("download");
  expect(result[1].urls).toEqual([
    "https://example.com/a.mp3",
    "https://example.com/b.mp3",
  ]);
  expect(result[1].m3uFilePath).toEqual("list.m3u");
});
