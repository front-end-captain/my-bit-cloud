import { NextFunction } from "./next";
import { Request } from "./request";
import { Response } from "./response";

/**
 * define express Middleware
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export enum Verb {
  WRITE = "write",
  READ = "read",
}

/**
 * express new Route
 */

export interface Route {
  method: string;
  route: string | RegExp;
  disableNamespace?: boolean;
  verb?: Verb;
  middlewares: Middleware[];
}
