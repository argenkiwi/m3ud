import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../saveM3uFile.ts";

Deno.test("saveM3uFileNode should write joined URLs and go to success", async () => {
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

  assertEquals(result[0], "next");
  assertEquals(result[1], initialState);
  assertEquals(writes, [[
    "list.m3u",
    "https://example.com/a.mp3\nhttps://example.com/b.mp3",
  ]]);
});
