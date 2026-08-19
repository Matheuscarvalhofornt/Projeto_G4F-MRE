export interface News {
  id: number;
  titulo: string;
  descricao: string;
}

export interface NewsInput {
  titulo: string;
  descricao: string;
}

export interface NewsPage {
  data: News[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
