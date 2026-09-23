import { basename, dirname, extname, join, resolve, toFileUrl } from "@std/path";
import { NodeFactory } from "../ambler.ts";
import { downloadFile } from "../utils/download.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  mkdir: (path: string) => Promise<void>;
  downloadFile: (url: string, dir: string) => Promise<string>;
  remove: (path: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  mkdir: (path) => Deno.mkdir(path, { recursive: true }),
  downloadFile,
  remove: (path) => Deno.remove(path),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const outputFolder = join(
      dirname(state.m3uFilePath),
      basename(state.m3uFilePath, extname(state.m3uFilePath)),
    );
    await utils.mkdir(outputFolder);

    utils.print(`Downloading ${state.urls.length} file(s) to ${outputFolder}...`);
    const paths = await Promise.all(
      state.urls.map((url) => utils.downloadFile(url, outputFolder)),
    );

    await utils.remove(state.m3uFilePath);

    return [edges.onSuccess, {
      ...state,
      m3uFilePath: join(outputFolder, "playlist.m3u"),
      urls: paths.map((path) => toFileUrl(resolve(path)).href),
    }];
  };
