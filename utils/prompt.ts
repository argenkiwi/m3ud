const YES = ["y", "yes"];
const NO = ["n", "no"];

// Bytes read past the last newline, kept so piped input isn't lost between prompts.
let buffered = Buffer.alloc(0);

// Waits for the next chunk of stdin, or null at end of input. stdin is resumed
// only while a chunk is awaited and paused again afterwards: a stream left
// flowing keeps the process alive after the last prompt.
function readChunk(): Promise<Buffer | null> {
  const stdin = process.stdin;
  if (stdin.readableEnded) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const done = (chunk: Buffer | null) => {
      stdin.off("data", onData);
      stdin.off("end", onEnd);
      stdin.off("error", onError);
      stdin.pause();
      resolve(chunk);
    };
    const onData = (chunk: Buffer) => done(chunk);
    const onEnd = () => done(null);
    const onError = (err: Error) => {
      stdin.off("data", onData);
      stdin.off("end", onEnd);
      stdin.off("error", onError);
      stdin.pause();
      reject(err);
    };
    stdin.on("data", onData);
    stdin.on("end", onEnd);
    stdin.on("error", onError);
    stdin.resume();
  });
}

async function readLine(question: string): Promise<string | null> {
  process.stdout.write(`${question} `);
  while (true) {
    const newline = buffered.indexOf(10);
    if (newline !== -1) {
      const line = buffered.subarray(0, newline).toString("utf8");
      buffered = buffered.subarray(newline + 1);
      return line.replace(/\r$/, "");
    }
    const chunk = await readChunk();
    if (chunk === null) {
      if (buffered.length === 0) return null;
      const line = buffered.toString("utf8");
      buffered = Buffer.alloc(0);
      return line;
    }
    buffered = Buffer.concat([buffered, chunk]);
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
