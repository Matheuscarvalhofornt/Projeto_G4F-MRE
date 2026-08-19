import NodeCache from 'node-cache';
import { env } from '../config/env.js';
import type { PaginatedNews } from '../types/news.js';

export interface ListCache {
  get(key: string): PaginatedNews | undefined;
  set(key: string, value: PaginatedNews): void;
  clear(): void;
}

export class MemoryListCache implements ListCache {
  private readonly cache = new NodeCache({ stdTTL: env.CACHE_TTL_SECONDS, useClones: true });

  get(key: string) {
    return this.cache.get<PaginatedNews>(key);
  }

  set(key: string, value: PaginatedNews) {
    this.cache.set(key, value);
  }

  clear() {
    this.cache.flushAll();
  }
}
