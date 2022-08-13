import type { Assets } from "@unknown/ui-foundation.ui.rendering.html";
import type { Request, Response } from "express";
import { BrowserData } from "./request-browser";

export type SsrSession = {
  assets: Assets;
  browser: BrowserData;
  /** @deprecated */
  server?: {
    /** @deprecated */
    port: number;
    /** @deprecated */
    request: Request;
    /** @deprecated */
    response: Response;
  };

  // express tools:
  request: Request;
  response: Response;
};
