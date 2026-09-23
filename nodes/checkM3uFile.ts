import { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  getArgs: () => string[];
  isFile: (path: string) => Promise<boolean | null>;
  printError: (msg: string) => void;
};

const defaultUtils: Utils = {
  getArgs: () => Deno.args,
  isFile: async (path) => {
    try {
      return (await Deno.stat(path)).isFile;
    } catch {
      return null;
    }
  },
  printError: (msg) => console.error(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const path = utils.getArgs()[0];
    if (!path) {
      utils.printError("Usage: m3ud <playlist.m3u>");
      return [edges.onError, state];
    }
    if (!path.toLowerCase().endsWith(".m3u")) {
      utils.printError(`Not an .m3u file: ${path}`);
      return [edges.onError, state];
    }
    const isFile = await utils.isFile(path);
    if (isFile === null) {
      utils.printError(`File not found: ${path}`);
      return [edges.onError, state];
    }
    if (!isFile) {
      utils.printError(`Not a regular file: ${path}`);
      return [edges.onError, state];
    }
    return [edges.onSuccess, { ...state, m3uFilePath: path }];
  };
