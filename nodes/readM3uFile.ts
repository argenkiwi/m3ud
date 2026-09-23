import { NodeFactory } from "../ambler.ts";
import { isKhinsiderUrl } from "../utils/khinsider.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onResolve" | "onDownload";

export type Utils = {
  readTextFile: (path: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readTextFile: (path) => Deno.readTextFile(path),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const content = await utils.readTextFile(state.m3uFilePath);
    const urls = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    utils.print(`URLs in ${state.m3uFilePath}:`);
    urls.forEach((url) => utils.print(`  ${url}`));

    const next = urls.some(isKhinsiderUrl) ? edges.onResolve : edges.onDownload;
    return [next, { ...state, urls }];
  };
