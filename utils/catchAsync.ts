import { NextFunction, Response } from 'express';
import { Request } from './types';

type Handler<ReturnType> = (
  req: Request,
  res: Response,
  next: NextFunction
) => ReturnType;

const catchAsync = (fn: Handler<Promise<void>>): Handler<void> => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};

export default catchAsync;
