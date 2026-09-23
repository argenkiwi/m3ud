import { assertEquals } from "@std/assert";
import { factory, State, Utils } from "../resolveUrls.ts";

Deno.test("resolveUrlsNode should resolve only khinsider URLs and keep order", async () => {
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

  assertEquals(result[0], "save");
  assertEquals(result[1].urls, [
    "https://cdn.example.com/01.mp3",
    "https://example.com/a.mp3",
    "https://cdn.example.com/02.mp3",
  ]);
  assertEquals(resolved.sort(), [k1, k2]);
});
