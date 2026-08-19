import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { NewsRepository } from '../src/repositories/news-repository.js';
import type { ListCache } from '../src/services/list-cache.js';
import { NewsService } from '../src/services/news-service.js';
import type { CreateNewsInput, ListNewsQuery, News, UpdateNewsInput } from '../src/types/news.js';

class InMemoryNewsRepository implements NewsRepository {
  items: News[] = [];

  async create(input: CreateNewsInput) {
    const news = { id: this.items.length + 1, ...input };
    this.items.push(news);
    return news;
  }

  async findAll(query: ListNewsQuery) {
    const search = query.search;
    const filtered = this.items.filter((item) =>
      search
        ? `${item.titulo} ${item.descricao}`.toLowerCase().includes(search.toLowerCase())
        : true,
    );
    const start = (query.page - 1) * query.limit;
    return { items: filtered.slice(start, start + query.limit), total: filtered.length };
  }

  async findById(id: number) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async update(id: number, input: UpdateNewsInput) {
    const item = await this.findById(id);
    if (!item) return null;
    Object.assign(item, input);
    return item;
  }

  async delete(id: number) {
    const oldLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < oldLength;
  }
}

const noCache: ListCache = { get: () => undefined, set: () => undefined, clear: () => undefined };

function scenario() {
  const repository = new InMemoryNewsRepository();
  return { app: createApp(new NewsService(repository, noCache)), repository };
}

describe('Feature: criação de notícia', () => {
  it('Dado um payload válido, quando criar a notícia, então retorna 201 e o recurso', async () => {
    const { app } = scenario();

    const response = await request(app).post('/noticias').send({
      titulo: 'Nova missão diplomática',
      descricao: 'Representantes se reúnem para ampliar a cooperação internacional.',
    });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe('/noticias/1');
    expect(response.body).toMatchObject({ id: 1, titulo: 'Nova missão diplomática' });
  });

  it('Dado um payload inválido, quando criar a notícia, então retorna 400 e não persiste', async () => {
    const { app, repository } = scenario();

    const response = await request(app)
      .post('/noticias')
      .send({ titulo: 'Oi', descricao: 'curta' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Payload ou parâmetros inválidos.');
    expect(repository.items).toHaveLength(0);
  });

  it('Dado um campo desconhecido, quando criar a notícia, então rejeita o payload', async () => {
    const { app, repository } = scenario();

    const response = await request(app).post('/noticias').send({
      titulo: 'Nova missão diplomática',
      descricao: 'Representantes se reúnem para ampliar a cooperação internacional.',
      publicado: true,
    });

    expect(response.status).toBe(400);
    expect(repository.items).toHaveLength(0);
  });

  it('Dado um JSON malformado, quando criar a notícia, então retorna 400 sem erro interno', async () => {
    const { app, repository } = scenario();

    const response = await request(app)
      .post('/noticias')
      .set('Content-Type', 'application/json')
      .send('{"titulo":');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('JSON inválido.');
    expect(repository.items).toHaveLength(0);
  });
});

describe('Feature: listagem paginada', () => {
  it('Dadas notícias cadastradas, quando listar com limite, então retorna metadados', async () => {
    const { app, repository } = scenario();
    await repository.create({ titulo: 'Notícia um', descricao: 'Descrição válida da notícia um.' });
    await repository.create({
      titulo: 'Notícia dois',
      descricao: 'Descrição válida da notícia dois.',
    });

    const response = await request(app).get('/noticias?page=1&limit=1');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toEqual({ total: 2, page: 1, limit: 1, totalPages: 2 });
  });
});
