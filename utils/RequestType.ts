import * as core from 'express-serve-static-core';
import { Request as ExpressRequest } from 'express';

export type Request<ReqBody = any, ReqQuery = core.Query> = ExpressRequest<
  core.ParamsDictionary,
  any,
  ReqBody,
  ReqQuery
>;
