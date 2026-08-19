import type { NewsRepository } from '../repositories/news-repository.js';
import type {
  CreateNewsInput,
  ListNewsQuery,
  PaginatedNews,
  UpdateNewsInput,
} from '../types/news.js';
import type { ListCache } from './list-cache.js';

export class NewsService {
  constructor(
    private readonly repository: NewsRepository,
    private readonly cache: ListCache,
  ) {}

  async create(input: CreateNewsInput) {
    const news = await this.repository.create(input);
    this.cache.clear();
    return news;
  }

  async list(query: ListNewsQuery): Promise<PaginatedNews> {
    const key = JSON.stringify(query);
    const cached = this.cache.get(key);
    if (cached) return cached;

    const { items, total } = await this.repository.findAll(query);
    const result = {
      data: items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
      },
    };
    this.cache.set(key, result);
    return result;
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  async update(id: number, input: UpdateNewsInput) {
    const news = await this.repository.update(id, input);
    if (news) this.cache.clear();
    return news;
  }

  async delete(id: number) {
    const deleted = await this.repository.delete(id);
    if (deleted) this.cache.clear();
    return deleted;
  }
}
