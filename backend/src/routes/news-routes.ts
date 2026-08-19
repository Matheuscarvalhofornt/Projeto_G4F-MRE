import { Router } from 'express';
import { NewsController } from '../controllers/news-controller.js';
import type { NewsService } from '../services/news-service.js';

export function createNewsRouter(service: NewsService) {
  const router = Router();
  const controller = new NewsController(service);

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
