import { ErrorRequestHandler } from 'express';

export class AppError extends Error {
  public status: string;
  constructor(public message: string, public statusCode: number) {
    super(message);
    if (statusCode.toString().startsWith('4')) {
      this.status = 'Fail';
    } else {
      this.status = 'Error';
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req,
  res,
  next
) => {
  const stack = process.env.NODE_ENV === 'production' ? undefined : err.stack;

  console.log('CAUGHT');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack,
    });
  } else {
    res.status(500).json({
      status: 'Error',
      message: err.message,
      stack,
    });
  }
};
