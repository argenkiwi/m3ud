import { stat } from "node:fs/promises";
import type { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  error: string | null;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  getArgs: () => string[];
  isFile: (path: string) => Promise<boolean | null>;
  printError: (msg: string) => void;
};

const defaultUtils: Utils = {
  getArgs: () => process.argv.slice(2),
  isFile: async (path) => {
    try {
      return (await stat(path)).isFile();
    } catch {
      return null;
    }
  },
  printError: (msg) => console.error(msg),
};

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  async (state) => {
    const fail = (error: string): [typeof edges.onError, typeof state] => {
      utils.printError(error);
      return [edges.onError, { ...state, error }];
    };

    const path = utils.getArgs()[0];
    if (!path) return fail("Usage: m3ud <playlist.m3u>");
    if (!path.toLowerCase().endsWith(".m3u")) {
      return fail(`Not an .m3u file: ${path}`);
    }
    const isFile = await utils.isFile(path);
    if (isFile === null) return fail(`File not found: ${path}`);
    if (!isFile) return fail(`Not a regular file: ${path}`);
    return [edges.onSuccess, { ...state, m3uFilePath: path, error: null }];
  };
