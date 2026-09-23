import { assertEquals } from "@std/assert";
import { join, resolve, toFileUrl } from "@std/path";
import { factory, State, Utils } from "../downloadFiles.ts";

Deno.test("downloadFilesNode should download into folder, remove M3U and point state at local playlist", async () => {
  const initialState: State = {
    m3uFilePath: join("music", "My Album.m3u"),
    urls: ["https://example.com/a.mp3", "https://example.com/b%20c.mp3"],
  };
  const outputFolder = join("music", "My Album");
  const calls: string[] = [];
  const utils: Utils = {
    mkdir: (path) => {
      calls.push(`mkdir ${path}`);
      return Promise.resolve();
    },
    downloadFile: (url, dir) => {
      calls.push(`download ${url} -> ${dir}`);
      const name = decodeURIComponent(url.split("/").pop()!);
      return Promise.resolve(join(dir, name));
    },
    remove: (path) => {
      calls.push(`remove ${path}`);
      return Promise.resolve();
    },
    print: (_msg) => {},
  };

  const result = await factory({ onSuccess: "save" }, utils)(initialState);

  assertEquals(result[0], "save");
  assertEquals(result[1].m3uFilePath, join(outputFolder, "playlist.m3u"));
  assertEquals(result[1].urls, [
    toFileUrl(resolve(outputFolder, "a.mp3")).href,
    toFileUrl(resolve(outputFolder, "b c.mp3")).href,
  ]);
  assertEquals(calls[0], `mkdir ${outputFolder}`);
  assertEquals(calls.at(-1), `remove ${initialState.m3uFilePath}`);
  assertEquals(calls.filter((c) => c.startsWith("download")).length, 2);
});
