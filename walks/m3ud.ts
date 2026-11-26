import { ambler, walk } from "../ambler.ts";
import type { Utils as CheckM3uFileUtils } from "../nodes/check-m3u-file.ts";
import defer * as checkM3uFileNode from "../nodes/check-m3u-file.ts";
import type { Utils as DownloadFilesUtils } from "../nodes/download-files.ts";
import defer * as downloadFilesNode from "../nodes/download-files.ts";
import type { Utils as PromptDownloadUtils } from "../nodes/prompt-download.ts";
import defer * as promptDownloadNode from "../nodes/prompt-download.ts";
import type { Utils as PromptResolveUtils } from "../nodes/prompt-resolve.ts";
import defer * as promptResolveNode from "../nodes/prompt-resolve.ts";
import type { Utils as ReadM3uFileUtils } from "../nodes/read-m3u-file.ts";
import defer * as readM3uFileNode from "../nodes/read-m3u-file.ts";
import type { Utils as ResolveUrlsUtils } from "../nodes/resolve-urls.ts";
import defer * as resolveUrlsNode from "../nodes/resolve-urls.ts";
import type { Utils as SaveM3uFileUtils } from "../nodes/save-m3u-file.ts";
import defer * as saveM3uFileNode from "../nodes/save-m3u-file.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
  error: string | null;
}

export type NodeId =
  | "CHECK_M3U_FILE"
  | "READ_M3U_FILE"
  | "PROMPT_RESOLVE"
  | "RESOLVE_URLS"
  | "SAVE_M3U_FILE"
  | "PROMPT_DOWNLOAD"
  | "DOWNLOAD_FILES"
  | "SAVE_LOCAL_M3U_FILE";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  checkM3uFile?: CheckM3uFileUtils;
  readM3uFile?: ReadM3uFileUtils;
  promptResolve?: PromptResolveUtils;
  resolveUrls?: ResolveUrlsUtils;
  saveM3uFile?: SaveM3uFileUtils;
  promptDownload?: PromptDownloadUtils;
  downloadFiles?: DownloadFilesUtils;
  saveLocalM3uFile?: SaveM3uFileUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    CHECK_M3U_FILE: () =>
      checkM3uFileNode.factory(
        { onSuccess: "READ_M3U_FILE", onError: null },
        utils.checkM3uFile,
      ),
    READ_M3U_FILE: () =>
      readM3uFileNode.factory(
        { onResolve: "PROMPT_RESOLVE", onDownload: "PROMPT_DOWNLOAD" },
        utils.readM3uFile,
      ),
    PROMPT_RESOLVE: () =>
      promptResolveNode.factory(
        { onYes: "RESOLVE_URLS", onNo: null },
        utils.promptResolve,
      ),
    RESOLVE_URLS: () =>
      resolveUrlsNode.factory(
        { onSuccess: "SAVE_M3U_FILE" },
        utils.resolveUrls,
      ),
    SAVE_M3U_FILE: () =>
      saveM3uFileNode.factory(
        { onSuccess: "PROMPT_DOWNLOAD" },
        utils.saveM3uFile,
      ),
    PROMPT_DOWNLOAD: () =>
      promptDownloadNode.factory(
        { onYes: "DOWNLOAD_FILES", onNo: null },
        utils.promptDownload,
      ),
    DOWNLOAD_FILES: () =>
      downloadFilesNode.factory(
        { onSuccess: "SAVE_LOCAL_M3U_FILE" },
        utils.downloadFiles,
      ),
    SAVE_LOCAL_M3U_FILE: () =>
      saveM3uFileNode.factory({ onSuccess: null }, utils.saveLocalM3uFile),
  });
}

if (import.meta.main) {
  const final = await walk(createWalk(), "CHECK_M3U_FILE", {
    m3uFilePath: "",
    urls: [],
    error: null,
  });
  if (final.error) process.exit(1);
}
