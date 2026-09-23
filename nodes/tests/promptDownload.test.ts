import { assertEquals } from "@std/assert";
import { factory, Utils } from "../promptDownload.ts";

const edges = { onYes: "download", onNo: "stop" } as const;

function mockUtils(answer: boolean, asked: string[]): Utils {
  return {
    confirm: (question) => {
      asked.push(question);
      return Promise.resolve(answer);
    },
  };
}

Deno.test("promptDownloadNode should go to yes when user confirms", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(true, asked))({});
  assertEquals(result[0], "download");
  assertEquals(asked, ["Proceed with download? (y/n)"]);
});

Deno.test("promptDownloadNode should go to no when user declines", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(false, asked))({});
  assertEquals(result[0], "stop");
});
