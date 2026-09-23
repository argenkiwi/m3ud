import { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  writeTextFile: (path: string, data: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  writeTextFile: (path, data) => Deno.writeTextFile(path, data),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    await utils.writeTextFile(state.m3uFilePath, state.urls.join("\n"));
    utils.print(`Saved ${state.m3uFilePath}:`);
    state.urls.forEach((url) => utils.print(`  ${url}`));
    return [edges.onSuccess, state];
  };
