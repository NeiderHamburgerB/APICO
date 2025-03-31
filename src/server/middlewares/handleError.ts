import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../../shared/errors/apiError';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
 
  if (err instanceof ZodError) {
    const formatted = err.flatten();
    return res.status(400).json({
      message: "Error de validación",
      errors: formatted.fieldErrors,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors || [],
    });
  }

  return res.status(400).json({
    message: err.message || 'Error inesperado',
  });
}
