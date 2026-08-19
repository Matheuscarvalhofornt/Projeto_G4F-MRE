# Projeto G4F - MRE

Projeto full stack desenvolvido para a prova técnica da G4F.

A aplicação possui duas funcionalidades principais:

- Consulta de endereço por CEP utilizando a API ViaCEP.
- CRUD de notícias com busca e paginação.

## Tecnologias

### Frontend

- React 19
- TypeScript
- Vite
- Axios
- CSS
- Vitest

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- Vitest

### Ferramentas

- Docker
- Docker Compose
- ESLint
- Prettier
- GitHub Actions

## Funcionalidades

### Consulta de CEP

A consulta de endereço foi integrada à API ViaCEP utilizando Axios.

Foram implementados:

- Máscara de CEP.
- Validação antes da requisição.
- Estado de carregamento.
- Tratamento de erros.
- Mensagem para CEP não encontrado.
- Layout responsivo.
- Navegação por teclado.

### Notícias

O sistema possui um CRUD completo de notícias com:

- Cadastro.
- Listagem.
- Edição.
- Exclusão.
- Busca.
- Paginação.

Cada notícia possui os campos:

```text
titulo
descricao
```

## Estrutura

```text
.
├── frontend/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── services/
│       ├── test/
│       └── types/
│
├── backend/
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── types/
│
└── docker-compose.yml
```

No frontend, as funcionalidades foram organizadas por contexto.

No backend, a aplicação foi dividida em Controller, Service e Repository para separar as responsabilidades entre requisições HTTP, regras da aplicação e acesso aos dados.

## API REST

A API roda por padrão em:

```text
http://localhost:3333
```

### Rotas

| Método | Rota            | Descrição         |
| ------ | --------------- | ----------------- |
| POST   | `/noticias`     | Criar notícia     |
| GET    | `/noticias`     | Listar notícias   |
| GET    | `/noticias/:id` | Buscar notícia    |
| PUT    | `/noticias/:id` | Atualizar notícia |
| DELETE | `/noticias/:id` | Excluir notícia   |

Exemplo de payload:

```json
{
  "titulo": "Cooperação internacional ampliada",
  "descricao": "Representantes iniciaram uma nova agenda de cooperação entre os países."
}
```

## Busca e paginação

Exemplo de paginação:

```text
GET /noticias?page=1&limit=6
```

Exemplo de busca:

```text
GET /noticias?search=cooperação
```

A resposta inclui os dados e os metadados da paginação:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 6,
    "totalPages": 0
  }
}
```

## Banco de dados

As notícias são armazenadas em PostgreSQL utilizando Prisma ORM.

As migrations ficam versionadas dentro do projeto.

## Como executar

### Com Docker

Na raiz do projeto:

```bash
cp .env.example .env
docker compose up --build
```

Acesse:

```text
Frontend: http://localhost:8080
API: http://localhost:3333
Health check: http://localhost:3333/health
```

Para encerrar:

```bash
docker compose down
```

### Execução local

Pré-requisitos:

- Node.js 22+
- npm 10+
- PostgreSQL

Instale as dependências:

```bash
npm ci
```

Configure o backend:

```bash
cp backend/.env.example backend/.env
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

Execute o backend:

```bash
npm run dev --workspace backend
```

Em outro terminal, execute o frontend:

```bash
npm run dev --workspace frontend
```

Acesse:

```text
Frontend: http://localhost:5173
API: http://localhost:3333
```

## Testes

Para executar os testes e verificações de qualidade:

```bash
npm test
npm run lint
npm run build
npm run format:check
```

Foram criados testes para os principais comportamentos do frontend e backend, incluindo consulta de CEP, validações, cadastro de notícias e paginação.

## GitFlow

O projeto segue uma estrutura baseada em GitFlow:

```text
main
└── develop
    ├── feature/nome-da-feature
    ├── release/x.y.z
    └── hotfix/correcao
```

A branch `main` representa a versão estável e a `develop` concentra as funcionalidades em desenvolvimento.

## CI

O GitHub Actions executa automaticamente nos Pull Requests para `develop` e `main`:

- Lint.
- Testes.
- Build.
- Build das imagens Docker.
