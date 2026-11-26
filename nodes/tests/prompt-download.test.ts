import { expect, test } from "bun:test";
import { factory, type Utils } from "../prompt-download.ts";

const edges = { onYes: "download", onNo: "stop" } as const;

function mockUtils(answer: boolean, asked: string[]): Utils {
  return {
    confirm: (question) => {
      asked.push(question);
      return Promise.resolve(answer);
    },
  };
}

test("promptDownloadNode should go to yes when user confirms", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(true, asked))({});
  expect(result[0]).toEqual("download");
  expect(asked).toEqual(["Proceed with download? (y/n)"]);
});

test("promptDownloadNode should go to no when user declines", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(false, asked))({});
  expect(result[0]).toEqual("stop");
});
