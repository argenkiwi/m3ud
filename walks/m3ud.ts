import { ambler } from "../ambler.ts";
import defer * as checkM3uFileNode from "../nodes/checkM3uFile.ts";
import defer * as readM3uFileNode from "../nodes/readM3uFile.ts";
import defer * as promptResolveNode from "../nodes/promptResolve.ts";
import defer * as resolveUrlsNode from "../nodes/resolveUrls.ts";
import defer * as saveM3uFileNode from "../nodes/saveM3uFile.ts";
import defer * as promptDownloadNode from "../nodes/promptDownload.ts";
import defer * as downloadFilesNode from "../nodes/downloadFiles.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

type NodeId =
  | "CHECK_M3U_FILE"
  | "READ_M3U_FILE"
  | "PROMPT_RESOLVE"
  | "RESOLVE_URLS"
  | "SAVE_M3U_FILE"
  | "PROMPT_DOWNLOAD"
  | "DOWNLOAD_FILES"
  | "SAVE_LOCAL_M3U_FILE";

const amble = ambler<State, NodeId>({
  CHECK_M3U_FILE: () =>
    checkM3uFileNode.factory({ onSuccess: "READ_M3U_FILE", onError: null }),
  READ_M3U_FILE: () =>
    readM3uFileNode.factory({
      onResolve: "PROMPT_RESOLVE",
      onDownload: "PROMPT_DOWNLOAD",
    }),
  PROMPT_RESOLVE: () =>
    promptResolveNode.factory({ onYes: "RESOLVE_URLS", onNo: null }),
  RESOLVE_URLS: () => resolveUrlsNode.factory({ onSuccess: "SAVE_M3U_FILE" }),
  SAVE_M3U_FILE: () => saveM3uFileNode.factory({ onSuccess: "PROMPT_DOWNLOAD" }),
  PROMPT_DOWNLOAD: () =>
    promptDownloadNode.factory({ onYes: "DOWNLOAD_FILES", onNo: null }),
  DOWNLOAD_FILES: () =>
    downloadFilesNode.factory({ onSuccess: "SAVE_LOCAL_M3U_FILE" }),
  SAVE_LOCAL_M3U_FILE: () => saveM3uFileNode.factory({ onSuccess: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "CHECK_M3U_FILE";
  let state: State = {
    m3uFilePath: "",
    urls: [],
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
