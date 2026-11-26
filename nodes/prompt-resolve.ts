import type { NodeFactory } from "../ambler.ts";
import { confirm } from "../utils/prompt.ts";

export type State = object;

export type Edge = "onYes" | "onNo";

export type Utils = {
  confirm: (question: string) => Promise<boolean>;
};

const defaultUtils: Utils = { confirm };

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  async (state) => {
    const yes = await utils.confirm(
      "Some URLs require resolution. Proceed? (y/n)",
    );
    return [yes ? edges.onYes : edges.onNo, state];
  };
