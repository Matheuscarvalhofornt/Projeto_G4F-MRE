import type { CreateNewsInput, ListNewsQuery, News, UpdateNewsInput } from '../types/news.js';

export interface NewsRepository {
  create(input: CreateNewsInput): Promise<News>;
  findAll(query: ListNewsQuery): Promise<{ items: News[]; total: number }>;
  findById(id: number): Promise<News | null>;
  update(id: number, input: UpdateNewsInput): Promise<News | null>;
  delete(id: number): Promise<boolean>;
}
