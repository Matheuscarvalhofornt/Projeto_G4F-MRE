import axios from 'axios';
import type { News, NewsInput, NewsPage } from '../types/news';

const newsApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 8000,
});

export async function listNews(page: number, limit: number, search: string, signal?: AbortSignal) {
  const { data } = await newsApi.get<NewsPage>('/noticias', {
    params: { page, limit, ...(search && { search }) },
    signal,
  });
  return data;
}

export async function createNews(input: NewsInput) {
  const { data } = await newsApi.post<News>('/noticias', input);
  return data;
}

export async function updateNews(id: number, input: NewsInput) {
  const { data } = await newsApi.put<News>(`/noticias/${id}`, input);
  return data;
}

export async function deleteNews(id: number) {
  await newsApi.delete(`/noticias/${id}`);
}
