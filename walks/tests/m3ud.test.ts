import { expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { walk } from "../../ambler.ts";
import { createWalk } from "../m3ud.ts";

const KHINSIDER =
  "https://downloads.khinsider.com/game-soundtracks/album/x/01.mp3";
const DIRECT = "https://example.com/02.mp3";

/** Plays back the arguments, playlist and answers, and records every effect. */
function script(opts: {
  args: string[];
  isFile?: boolean | null;
  playlist?: string;
  answers?: boolean[];
}) {
  const answers = [...(opts.answers ?? [])];
  const log: string[] = [];
  const print = (msg: string) => {
    log.push(msg);
  };
  const confirm = (question: string) => {
    log.push(`? ${question}`);
    return Promise.resolve(answers.shift() ?? false);
  };
  const writeTextFile = (path: string, data: string) => {
    log.push(`write ${path}: ${data.replaceAll("\n", " | ")}`);
    return Promise.resolve();
  };
  return {
    log,
    utils: {
      checkM3uFile: {
        getArgs: () => opts.args,
        isFile: () => Promise.resolve(opts.isFile ?? true),
        printError: (msg: string) => log.push(`! ${msg}`),
      },
      readM3uFile: {
        readTextFile: () => Promise.resolve(opts.playlist ?? ""),
        print,
      },
      promptResolve: { confirm },
      resolveUrls: {
        resolveKhinsiderUrl: (url: string) =>
          Promise.resolve(`https://cdn.example.com/${url.split("/").pop()}`),
      },
      saveM3uFile: { writeTextFile, print: () => {} },
      promptDownload: { confirm },
      downloadFiles: {
        mkdir: (path: string) => {
          log.push(`mkdir ${path}`);
          return Promise.resolve();
        },
        downloadFile: (url: string, dir: string) => {
          log.push(`download ${url}`);
          return Promise.resolve(join(dir, url.split("/").pop()!));
        },
        remove: (path: string) => {
          log.push(`remove ${path}`);
          return Promise.resolve();
        },
        print: () => {},
      },
      saveLocalM3uFile: { writeTextFile, print: () => {} },
    },
  };
}

const initial = () => ({ m3uFilePath: "", urls: [], error: null });

test("m3ud stops when the playlist argument is invalid", async () => {
  const { log, utils } = script({ args: ["list.txt"] });

  const final = await walk(createWalk(utils), "CHECK_M3U_FILE", initial());

  expect(final).toEqual({ ...initial(), error: "Not an .m3u file: list.txt" });
  expect(log).toEqual(["! Not an .m3u file: list.txt"]);
});

test("m3ud resolves khinsider links, saves them, then downloads and saves a local playlist", async () => {
  const path = join("music", "Album.m3u");
  const { log, utils } = script({
    args: [path],
    playlist: `#EXTM3U\n${KHINSIDER}\n${DIRECT}\n`,
    answers: [true, true],
  });

  const final = await walk(createWalk(utils), "CHECK_M3U_FILE", initial());

  const folder = join("music", "Album");
  const local = join(folder, "playlist.m3u");
  const files = ["01.mp3", "02.mp3"].map(
    (name) => pathToFileURL(resolve(folder, name)).href,
  );
  expect(final).toEqual({ m3uFilePath: local, urls: files, error: null });
  expect(log).toEqual([
    `URLs in ${path}:`,
    `  ${KHINSIDER}`,
    `  ${DIRECT}`,
    "? Some URLs require resolution. Proceed? (y/n)",
    `write ${path}: https://cdn.example.com/01.mp3 | ${DIRECT}`,
    "? Proceed with download? (y/n)",
    `mkdir ${folder}`,
    "download https://cdn.example.com/01.mp3",
    `download ${DIRECT}`,
    `remove ${path}`,
    `write ${local}: ${files.join(" | ")}`,
  ]);
});

test("m3ud stops without resolving when the user declines resolution", async () => {
  const { log, utils } = script({
    args: ["Album.m3u"],
    playlist: KHINSIDER,
    answers: [false],
  });

  const final = await walk(createWalk(utils), "CHECK_M3U_FILE", initial());

  expect(final.urls).toEqual([KHINSIDER]);
  expect(log.at(-1)).toEqual("? Some URLs require resolution. Proceed? (y/n)");
});

test("m3ud skips resolution for direct links and stops when the user declines download", async () => {
  const { log, utils } = script({
    args: ["Album.m3u"],
    playlist: DIRECT,
    answers: [false],
  });

  const final = await walk(createWalk(utils), "CHECK_M3U_FILE", initial());

  expect(final).toEqual({
    m3uFilePath: "Album.m3u",
    urls: [DIRECT],
    error: null,
  });
  expect(log).toEqual([
    "URLs in Album.m3u:",
    `  ${DIRECT}`,
    "? Proceed with download? (y/n)",
  ]);
});
