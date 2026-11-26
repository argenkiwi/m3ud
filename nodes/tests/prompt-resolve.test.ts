import { expect, test } from "bun:test";
import { factory, type Utils } from "../prompt-resolve.ts";

const edges = { onYes: "resolve", onNo: "stop" } as const;

function mockUtils(answer: boolean, asked: string[]): Utils {
  return {
    confirm: (question) => {
      asked.push(question);
      return Promise.resolve(answer);
    },
  };
}

test("promptResolveNode should go to yes when user confirms", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(true, asked))({});
  expect(result[0]).toEqual("resolve");
  expect(asked).toEqual(["Some URLs require resolution. Proceed? (y/n)"]);
});

test("promptResolveNode should go to no when user declines", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(false, asked))({});
  expect(result[0]).toEqual("stop");
});
