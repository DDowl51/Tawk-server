import * as core from 'express-serve-static-core';
import { Request as ExpressRequest } from 'express';
import { IUser } from '../models/user/user.interface';
import { Document, Types } from 'mongoose';

export type WithUser = {
  user: Document<unknown, {}, IUser> &
    Omit<
      IUser & {
        _id: Types.ObjectId;
      },
      never
    >;
};

export type Request<ReqBody = any, ReqQuery = core.Query> = ExpressRequest<
  core.ParamsDictionary,
  any,
  ReqBody,
  ReqQuery
> & { [x: string]: any };
