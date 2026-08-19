import { Prisma, type PrismaClient } from '@prisma/client';
import type { CreateNewsInput, ListNewsQuery, UpdateNewsInput } from '../types/news.js';
import type { NewsRepository } from './news-repository.js';

export class PrismaNewsRepository implements NewsRepository {
  constructor(private readonly database: PrismaClient) {}

  create(input: CreateNewsInput) {
    return this.database.noticia.create({ data: input });
  }

  async findAll(query: ListNewsQuery) {
    const where: Prisma.NoticiaWhereInput = {
      ...(query.search && {
        OR: [
          { titulo: { contains: query.search, mode: 'insensitive' } },
          { descricao: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.titulo && { titulo: { contains: query.titulo, mode: 'insensitive' } }),
      ...(query.descricao && {
        descricao: { contains: query.descricao, mode: 'insensitive' },
      }),
    };

    const [items, total] = await this.database.$transaction([
      this.database.noticia.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { id: 'desc' },
      }),
      this.database.noticia.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: number) {
    return this.database.noticia.findUnique({ where: { id } });
  }

  async update(id: number, input: UpdateNewsInput) {
    try {
      return await this.database.noticia.update({ where: { id }, data: input });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      await this.database.noticia.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
