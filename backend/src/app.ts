import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { createNewsRouter } from './routes/news-routes.js';
import type { NewsService } from './services/news-service.js';

export function createApp(service: NewsService) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
  app.use(express.json({ limit: '100kb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('combined'));

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/noticias', createNewsRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
