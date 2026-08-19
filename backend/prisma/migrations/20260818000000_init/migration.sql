CREATE TABLE "noticias" (
  "id" SERIAL NOT NULL,
  "titulo" VARCHAR(160) NOT NULL,
  "descricao" TEXT NOT NULL,
  CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "noticias_titulo_idx" ON "noticias" ("titulo");

