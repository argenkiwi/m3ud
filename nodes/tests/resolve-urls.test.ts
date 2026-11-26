import { expect, test } from "bun:test";
import { factory, type State, type Utils } from "../resolve-urls.ts";

test("resolveUrlsNode should resolve only khinsider URLs and keep order", async () => {
  const k1 = "https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3";
  const k2 = "https://downloads.khinsider.com/game-soundtracks/album/x/02.mp3";
  const initialState: State = {
    urls: [k1, "https://example.com/a.mp3", k2],
  };
  const resolved: string[] = [];
  const utils: Utils = {
    resolveKhinsiderUrl: (url) => {
      resolved.push(url);
      return Promise.resolve(`https://cdn.example.com/${url.split("/").pop()}`);
    },
  };

  const result = await factory({ onSuccess: "save" }, utils)(initialState);

  expect(result[0]).toEqual("save");
  expect(result[1].urls).toEqual([
    "https://cdn.example.com/01.mp3",
    "https://example.com/a.mp3",
    "https://cdn.example.com/02.mp3",
  ]);
  expect(resolved.sort()).toEqual([k1, k2]);
});
