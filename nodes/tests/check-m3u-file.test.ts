import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../check-m3u-file.ts";

const edges = { onSuccess: "next", onError: "error" } as const;
const initialState: State = { m3uFilePath: "", error: null };

function mockUtils(args: string[], isFile: boolean | null) {
  const errors: string[] = [];
  const utils: Utils = {
    getArgs: () => args,
    isFile: (_path) => Promise.resolve(isFile),
    printError: (msg) => errors.push(msg),
  };
  return { utils, errors };
}

test("checkM3uFileNode should error when no path is provided", async () => {
  const { utils, errors } = mockUtils([], true);
  const result = await factory(edges, utils)(initialState);
  expect(result[0]).toEqual("error");
  expect(result[1].error).toEqual("Usage: m3ud <playlist.m3u>");
  expect(result[1].m3uFilePath).toEqual("");
  expect(errors).toEqual([result[1].error!]);
});

test("checkM3uFileNode should error when extension is not .m3u", async () => {
  const { utils, errors } = mockUtils(["playlist.txt"], true);
  const result = await factory(edges, utils)(initialState);
  expect(result[0]).toEqual("error");
  expect(result[1].error).toEqual("Not an .m3u file: playlist.txt");
  expect(errors).toEqual([result[1].error!]);
});

test("checkM3uFileNode should error when file does not exist", async () => {
  const { utils, errors } = mockUtils(["missing.m3u"], null);
  const result = await factory(edges, utils)(initialState);
  expect(result[0]).toEqual("error");
  expect(result[1].error).toEqual("File not found: missing.m3u");
  expect(errors).toEqual([result[1].error!]);
});

test("checkM3uFileNode should error when path is not a regular file", async () => {
  const { utils, errors } = mockUtils(["folder.m3u"], false);
  const result = await factory(edges, utils)(initialState);
  expect(result[0]).toEqual("error");
  expect(result[1].error).toEqual("Not a regular file: folder.m3u");
  expect(errors).toEqual([result[1].error!]);
});

test("checkM3uFileNode should store path when file is valid", async () => {
  const { utils, errors } = mockUtils(["music/Playlist.M3U"], true);
  const result = await factory(edges, utils)(initialState);
  expect(result[0]).toEqual("next");
  expect(result[1].m3uFilePath).toEqual("music/Playlist.M3U");
  expect(result[1].error).toBeNull();
  expect(errors.length).toEqual(0);
});
