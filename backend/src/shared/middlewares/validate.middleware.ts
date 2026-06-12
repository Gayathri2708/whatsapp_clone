import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

/**
 * Validates `{ body, query, params }` against a Zod schema and replaces
 * `req.body` with the parsed (and possibly transformed/coerced) result.
 * Throws `ZodError` on failure, which `errorHandler` converts into a 400
 * response with field-level details.
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) {
      req.body = parsed.body;
    }

    next();
  };
}
