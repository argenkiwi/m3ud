import { NodeFactory } from "../ambler.ts";
import { isKhinsiderUrl, resolveKhinsiderUrl } from "../utils/khinsider.ts";

export interface State {
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  resolveKhinsiderUrl: (url: string) => Promise<string>;
};

const defaultUtils: Utils = { resolveKhinsiderUrl };

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const urls = await Promise.all(
      state.urls.map((url) =>
        isKhinsiderUrl(url) ? utils.resolveKhinsiderUrl(url) : url
      ),
    );
    return [edges.onSuccess, { ...state, urls }];
  };
