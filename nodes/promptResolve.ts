import { NodeFactory } from "../ambler.ts";
import { confirm } from "../utils/prompt.ts";

// deno-lint-ignore no-empty-interface
export interface State {}

export type Edge = "onYes" | "onNo";

export type Utils = {
  confirm: (question: string) => Promise<boolean>;
};

const defaultUtils: Utils = { confirm };

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    const yes = await utils.confirm("Some URLs require resolution. Proceed? (y/n)");
    return [yes ? edges.onYes : edges.onNo, state];
  };
