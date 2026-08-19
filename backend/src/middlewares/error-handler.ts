import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: 'Rota não encontrada.' });
};

function isMalformedJson(error: unknown): error is SyntaxError & { status: number } {
  return error instanceof SyntaxError && 'status' in error && error.status === 400;
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (isMalformedJson(error)) {
    response.status(400).json({ message: 'JSON inválido.' });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Payload ou parâmetros inválidos.',
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Erro interno do servidor.' });
};
