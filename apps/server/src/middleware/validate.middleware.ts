import { RequestHandler } from 'express'
import { z } from 'zod'

const validate = (
  schema: z.ZodType,
  source: 'body' | 'params' | 'query'
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source])
      if (source === 'body') {
        req.body = parsed
      }
      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          errors: err.issues.map((issue) => ({
            message: issue.message,
            path: issue.path.join('.'),
          })),
          status: 'error',
        })
      } else {
        next(err)
      }
    }
  }
}

const validateRequestBody = (schema: z.ZodType): RequestHandler => {
  return validate(schema, 'body')
}

const validateRequestParams = (schema: z.ZodType): RequestHandler => {
  return validate(schema, 'params')
}

const validateRequestQuery = (schema: z.ZodType): RequestHandler => {
  return validate(schema, 'query')
}

export { validateRequestBody, validateRequestParams, validateRequestQuery }
