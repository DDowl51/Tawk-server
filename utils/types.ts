import * as core from 'express-serve-static-core';
import { Request as ExpressRequest } from 'express';
import { IUser } from '../models/user/user.interface';
import { Document, Types } from 'mongoose';
import { IMessage } from '../models/message/message.interface';

type DocType<T> = Document<unknown, {}, T> &
  Omit<
    T & {
      _id: Types.ObjectId;
    },
    never
  >;

export type User = DocType<IUser>;
export type Message = DocType<IMessage>;

export type WithUser = {
  user: User;
};

export type Request<ReqBody = any, ReqQuery = core.Query> = ExpressRequest<
  core.ParamsDictionary,
  any,
  ReqBody,
  ReqQuery
> & { [x: string]: any };
