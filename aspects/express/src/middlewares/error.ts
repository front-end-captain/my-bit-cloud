import * as express from "express";

interface ResponseError {
  status?: number;
  message?: string;
}

export const catchErrors =
  (
    action: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => Promise<unknown>,
  ) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    action(req, res, next).catch((error: ResponseError) => errorHandle(error, req, res, next));

export function errorHandle(
  err: ResponseError,
  req: express.Request,
  res: express.Response,
  // NOTE: Do not remove unused next, it's needed for express to catch errors!
  next: express.NextFunction,
) {
  console.error(`express.errorHandle, url ${req.url}, error:`, err);
  err.status = err.status || 500;
  res.status(err.status);
  return res.jsonp({
    message: err.message,
    error: err,
  });
}
