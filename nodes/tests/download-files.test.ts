import { expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { factory, type State, type Utils } from "../download-files.ts";

test("downloadFilesNode should download into folder, remove M3U and point state at local playlist", async () => {
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

  expect(result[0]).toEqual("save");
  expect(result[1].m3uFilePath).toEqual(join(outputFolder, "playlist.m3u"));
  expect(result[1].urls).toEqual([
    pathToFileURL(resolve(outputFolder, "a.mp3")).href,
    pathToFileURL(resolve(outputFolder, "b c.mp3")).href,
  ]);
  expect(calls[0]).toEqual(`mkdir ${outputFolder}`);
  expect(calls.at(-1)).toEqual(`remove ${initialState.m3uFilePath}`);
  expect(calls.filter((c) => c.startsWith("download")).length).toEqual(2);
});
