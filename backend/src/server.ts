import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { PrismaNewsRepository } from './repositories/prisma-news-repository.js';
import { MemoryListCache } from './services/list-cache.js';
import { NewsService } from './services/news-service.js';

const newsService = new NewsService(new PrismaNewsRepository(prisma), new MemoryListCache());
const server = createApp(newsService).listen(env.PORT, () => {
  console.log(`API disponível em http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} recebido. Encerrando com segurança...`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
