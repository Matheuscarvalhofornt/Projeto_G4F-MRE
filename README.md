# Projeto G4F - MRE

[![CI](https://github.com/Matheuscarvalhofornt/Projeto_G4F-MRE/actions/workflows/ci.yml/badge.svg)](https://github.com/Matheuscarvalhofornt/Projeto_G4F-MRE/actions/workflows/ci.yml)

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

### Decisões de arquitetura

No frontend, as funcionalidades foram organizadas por contexto. Componentes de interface, regras de cada funcionalidade, clientes HTTP e tipos permanecem separados, reduzindo o acoplamento e facilitando testes e manutenção.

No backend, a aplicação segue a divisão Controller, Service e Repository:

- **Controller:** valida os dados de entrada e traduz as operações para HTTP.
- **Service:** concentra regras da aplicação, paginação e invalidação do cache.
- **Repository:** isola o acesso ao banco de dados por meio do Prisma.

Essa separação permite substituir infraestrutura sem alterar as regras centrais. Em um cenário de maior escala, o repositório pode receber outra implementação, o cache em memória pode ser substituído por Redis e a API, por ser stateless, pode ser replicada atrás de um balanceador de carga.

ESLint, Prettier e TypeScript são utilizados para manter consistência, formatação determinística e verificação estática do código.

## API REST

A API roda por padrão em:

```text
http://localhost:3333
```

### Rotas

| Método | Rota            | Sucesso | Descrição         |
| ------ | --------------- | ------- | ----------------- |
| POST   | `/noticias`     | `201`   | Criar notícia     |
| GET    | `/noticias`     | `200`   | Listar notícias   |
| GET    | `/noticias/:id` | `200`   | Buscar notícia    |
| PUT    | `/noticias/:id` | `200`   | Atualizar notícia |
| DELETE | `/noticias/:id` | `204`   | Excluir notícia   |

Exemplo de payload:

```json
{
  "titulo": "Cooperação internacional ampliada",
  "descricao": "Representantes iniciaram uma nova agenda de cooperação entre os países."
}
```

### Validação e respostas HTTP

Os payloads são validados com Zod e aceitam somente `titulo` e `descricao`. O título deve conter entre 3 e 160 caracteres, e a descrição entre 10 e 5.000 caracteres.

A API utiliza códigos HTTP semânticos:

- `400` para payload, parâmetros ou JSON inválidos.
- `404` para notícia ou rota não encontrada.
- `500` para falhas internas não previstas.

## Filtros e paginação

Exemplo de paginação:

```text
GET /noticias?page=1&limit=6
```

Busca simultânea em título ou descrição:

```text
GET /noticias?search=cooperação
```

Filtros por campo:

```text
GET /noticias?titulo=cooperação
GET /noticias?descricao=agenda
```

Os parâmetros podem ser combinados. `page` deve ser maior ou igual a 1, e `limit` aceita valores entre 1 e 100.

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

## Cache

A listagem de notícias utiliza cache em memória por combinação de filtros e paginação. O tempo de expiração é configurado por `CACHE_TTL_SECONDS` e possui valor padrão de 30 segundos.

Operações de criação, atualização ou exclusão invalidam o cache para impedir a entrega de dados desatualizados. A implementação segue um contrato próprio, permitindo a substituição futura por Redis ou outro serviço distribuído.

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

### Variáveis de ambiente

| Variável            | Padrão               | Finalidade                             |
| ------------------- | -------------------- | -------------------------------------- |
| `POSTGRES_DB`       | `mre_news`           | Nome do banco PostgreSQL               |
| `POSTGRES_USER`     | `mre`                | Usuário do banco                       |
| `POSTGRES_PASSWORD` | `mre_local_password` | Senha utilizada no ambiente local      |
| `API_PORT`          | `3333`               | Porta externa da API                   |
| `WEB_PORT`          | `8080`               | Porta externa do frontend              |
| `CACHE_TTL_SECONDS` | `30`                 | Expiração do cache da API, em segundos |

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

Os testes seguem a estrutura BDD com cenários descritos em termos de contexto, ação e resultado esperado.

## Atalhos com Makefile

Para ambientes com `make`, estão disponíveis os seguintes comandos:

```bash
make up      # constrói e inicia os serviços
make down    # encerra os serviços
make logs    # acompanha os logs
make test    # instala dependências e executa os testes
make lint    # executa a análise estática
make build   # constrói as imagens Docker
```

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

- Verificação de formatação com Prettier.
- Lint.
- Testes.
- Build.
- Build das imagens Docker.
