import { TextLineStream } from "@std/streams";

const YES = ["y", "yes"];
const NO = ["n", "no"];

// Shared across calls so buffered input isn't lost between prompts.
let lines: ReadableStreamDefaultReader<string> | undefined;

async function readLine(question: string): Promise<string | null> {
  await Deno.stdout.write(new TextEncoder().encode(`${question} `));
  lines ??= Deno.stdin.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .getReader();
  const { value, done } = await lines.read();
  return done ? null : value;
}

/**
 * Asks a yes/no question on stdin until the user answers y/yes or n/no.
 * Works with both a terminal and piped input; end of input counts as "no".
 *
 * @param question - The question to display
 * @returns True for yes, false for no
 */
export async function confirm(question: string): Promise<boolean> {
  while (true) {
    const answer = await readLine(question);
    if (answer === null) return false;
    const normalised = answer.trim().toLowerCase();
    if (YES.includes(normalised)) return true;
    if (NO.includes(normalised)) return false;
  }
}
