import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../save-m3u-file.ts";

test("saveM3uFileNode should write joined URLs and go to success", async () => {
  const initialState: State = {
    m3uFilePath: "list.m3u",
    urls: ["https://example.com/a.mp3", "https://example.com/b.mp3"],
  };
  const writes: [string, string][] = [];
  const utils: Utils = {
    writeTextFile: (path, data) => {
      writes.push([path, data]);
      return Promise.resolve();
    },
    print: (_msg) => {},
  };

  const result = await factory({ onSuccess: "next" }, utils)(initialState);

  expect(result[0]).toEqual("next");
  expect(result[1]).toEqual(initialState);
  expect(writes).toEqual([
    ["list.m3u", "https://example.com/a.mp3\nhttps://example.com/b.mp3"],
  ]);
});
