import { validationResult } from 'express-validator';

export function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const error = new Error(result.array().map((item) => item.msg).join(', '));
  error.statusCode = 400;
  next(error);
}
