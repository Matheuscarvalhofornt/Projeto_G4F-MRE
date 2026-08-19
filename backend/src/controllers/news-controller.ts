import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { NewsService } from '../services/news-service.js';

const idSchema = z.coerce.number().int().positive();
const newsSchema = z
  .object({
    titulo: z.string().trim().min(3, 'Informe ao menos 3 caracteres.').max(160),
    descricao: z.string().trim().min(10, 'Informe ao menos 10 caracteres.').max(5000),
  })
  .strict();
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(6),
  search: z.string().trim().min(1).optional(),
  titulo: z.string().trim().min(1).optional(),
  descricao: z.string().trim().min(1).optional(),
});

export class NewsController {
  constructor(private readonly service: NewsService) {}

  create: RequestHandler = async (request, response) => {
    const input = newsSchema.parse(request.body);
    const news = await this.service.create(input);
    response.status(201).location(`/noticias/${news.id}`).json(news);
  };

  list: RequestHandler = async (request, response) => {
    const query = listSchema.parse(request.query);
    response.json(await this.service.list(query));
  };

  getById: RequestHandler = async (request, response) => {
    const id = idSchema.parse(request.params.id);
    const news = await this.service.findById(id);
    if (!news) {
      response.status(404).json({ message: 'Notícia não encontrada.' });
      return;
    }
    response.json(news);
  };

  update: RequestHandler = async (request, response) => {
    const id = idSchema.parse(request.params.id);
    const input = newsSchema.parse(request.body);
    const news = await this.service.update(id, input);
    if (!news) {
      response.status(404).json({ message: 'Notícia não encontrada.' });
      return;
    }
    response.json(news);
  };

  delete: RequestHandler = async (request, response) => {
    const id = idSchema.parse(request.params.id);
    if (!(await this.service.delete(id))) {
      response.status(404).json({ message: 'Notícia não encontrada.' });
      return;
    }
    response.status(204).send();
  };
}
