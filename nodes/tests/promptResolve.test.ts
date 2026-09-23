import { assertEquals } from "@std/assert";
import { factory, Utils } from "../promptResolve.ts";

const edges = { onYes: "resolve", onNo: "stop" } as const;

function mockUtils(answer: boolean, asked: string[]): Utils {
  return {
    confirm: (question) => {
      asked.push(question);
      return Promise.resolve(answer);
    },
  };
}

Deno.test("promptResolveNode should go to yes when user confirms", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(true, asked))({});
  assertEquals(result[0], "resolve");
  assertEquals(asked, ["Some URLs require resolution. Proceed? (y/n)"]);
});

Deno.test("promptResolveNode should go to no when user declines", async () => {
  const asked: string[] = [];
  const result = await factory(edges, mockUtils(false, asked))({});
  assertEquals(result[0], "stop");
});
