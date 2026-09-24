const YES = ["y", "yes"];
const NO = ["n", "no"];
const CHUNK_SIZE = 1024;

// Bytes read past the last newline, kept so piped input isn't lost between prompts.
let buffered = new Uint8Array(0);

// Reads stdin only while a line is awaited. A background reader (e.g. a stream
// over Deno.stdin.readable) keeps a read pending and stops the process exiting.
async function readLine(question: string): Promise<string | null> {
  await Deno.stdout.write(new TextEncoder().encode(`${question} `));
  while (true) {
    const newline = buffered.indexOf(10);
    if (newline !== -1) {
      const line = new TextDecoder().decode(buffered.subarray(0, newline));
      buffered = buffered.slice(newline + 1);
      return line.replace(/\r$/, "");
    }
    const chunk = new Uint8Array(CHUNK_SIZE);
    const n = await Deno.stdin.read(chunk);
    if (n === null) {
      if (buffered.length === 0) return null;
      const line = new TextDecoder().decode(buffered);
      buffered = new Uint8Array(0);
      return line;
    }
    const next = new Uint8Array(buffered.length + n);
    next.set(buffered);
    next.set(chunk.subarray(0, n), buffered.length);
    buffered = next;
  }
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
