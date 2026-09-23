import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../checkM3uFile.ts";

const edges = { onSuccess: "next", onError: "error" } as const;
const initialState: State = { m3uFilePath: "" };

function mockUtils(args: string[], isFile: boolean | null) {
  const errors: string[] = [];
  const utils: Utils = {
    getArgs: () => args,
    isFile: (_path) => Promise.resolve(isFile),
    printError: (msg) => errors.push(msg),
  };
  return { utils, errors };
}

Deno.test("checkM3uFileNode should error when no path is provided", async () => {
  const { utils, errors } = mockUtils([], true);
  const result = await factory(edges, utils)(initialState);
  assertEquals(result[0], "error");
  assertEquals(result[1].m3uFilePath, "");
  assertEquals(errors.length, 1);
});

Deno.test("checkM3uFileNode should error when extension is not .m3u", async () => {
  const { utils, errors } = mockUtils(["playlist.txt"], true);
  const result = await factory(edges, utils)(initialState);
  assertEquals(result[0], "error");
  assertEquals(errors.length, 1);
});

Deno.test("checkM3uFileNode should error when file does not exist", async () => {
  const { utils, errors } = mockUtils(["missing.m3u"], null);
  const result = await factory(edges, utils)(initialState);
  assertEquals(result[0], "error");
  assertEquals(errors.length, 1);
});

Deno.test("checkM3uFileNode should error when path is not a regular file", async () => {
  const { utils, errors } = mockUtils(["folder.m3u"], false);
  const result = await factory(edges, utils)(initialState);
  assertEquals(result[0], "error");
  assertEquals(errors.length, 1);
});

Deno.test("checkM3uFileNode should store path when file is valid", async () => {
  const { utils, errors } = mockUtils(["music/Playlist.M3U"], true);
  const result = await factory(edges, utils)(initialState);
  assertEquals(result[0], "next");
  assertEquals(result[1].m3uFilePath, "music/Playlist.M3U");
  assertEquals(errors.length, 0);
});
