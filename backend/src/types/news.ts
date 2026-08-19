export interface News {
  id: number;
  titulo: string;
  descricao: string;
}

export interface CreateNewsInput {
  titulo: string;
  descricao: string;
}

export type UpdateNewsInput = CreateNewsInput;

export interface ListNewsQuery {
  page: number;
  limit: number;
  search?: string;
  titulo?: string;
  descricao?: string;
}

export interface PaginatedNews {
  data: News[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
