Projeto Backend DevOps - Gerenciamento de Professores

Autor: Gabriel dos Santos

Este projeto implementa uma API RESTful em TypeScript para gerenciar o módulo de Professores, conforme os requisitos do Trabalho 6 de DevOps. Todo o sistema está publicado em ambiente de Continuous Deployment (CD) utilizando GitHub Actions e Docker.

🔗 URLs de Acesso

Serviço

URL

Notas

Frontend (Site)

https://projeto-backend-1-bmv4.onrender.com

URL para a aplicação web (Formulário de Login).

Backend (API)

https://projeto-backend-zw5n.onrender.com

URL para a API (Rota principal /).

Documentação (Swagger)

https://projeto-backend-zw5n.onrender.com/api-docs

URL da documentação completa das rotas.

🧩 Requisitos Técnicos e Tecnologias

Requisito

Status

Tecnologia Utilizada

API em TypeScript

✅ Concluído

Node.js com TypeScript e Express.

Persistência de Dados

✅ Concluído

TypeORM + PostgreSQL (Serviço permanente do Render).

Autenticação

✅ Concluído

JSON Web Tokens (JWT) e criptografia de senha (bcrypt).

Documentação

✅ Concluído

Swagger (swagger-jsdoc & swagger-ui-express).

Continuous Deployment

✅ Concluído

GitHub Actions (Build da imagem e Trigger de Deploy para o Render).

Containers

✅ Concluído

Dockerfile e docker-compose.yml para ambiente padronizado.

Frontend + Integração

✅ Concluído

Site Estático (HTML/JS) que consome a API em nuvem (CORS configurado).

🛠️ Instruções para Execução Local

Para rodar a API localmente (usando o SQLite local em vez do Postgres da nuvem):

Pré-requisitos

Node.js e NPM instalados.

Docker Desktop instalado e em execução (apenas para testar o Docker localmente).

1. Instalar Dependências

Abra o terminal na pasta raiz do projeto e execute:

npm install


2. Rodar a API em Modo de Desenvolvimento (Local)

O servidor será iniciado em http://localhost:3000, usando a base de dados data/database.sqlite (que é criada automaticamente).

npm run dev


3. Acessar o Frontend Localmente

O ficheiro do frontend está em frontend/index.html. Você pode:

Abrir este ficheiro diretamente no seu navegador.

Ajustar a API_URL_BASE no index.html para http://localhost:3000 (em vez da URL do Render) para testar o ambiente local.

📅 Roteiro de Demonstração (10 Minutos)

Para a apresentação, o professor solicitou a demonstração de um cadastro ao vivo via Swagger.

1. Login e Site (3 Minutos)

Acesse o link do Frontend (Site Estático).

Faça o Login usando uma conta já registada.

Demonstre o CRUD: Mostre que a lista de professores é carregada.

Cadastre rapidamente 1 novo professor através do formulário do site.

Mostre a lista de professores atualizada.

2. Validação da API (2 Minutos)

Acesse o link do Swagger (https://projeto-backend-zw5n.onrender.com/api-docs).

Obtenha o Token: Vá para a rota /login, use as credenciais de teste para obter o token JWT.

Autorize: Use o token para autorizar o Swagger (clicando em "Authorize").

Demonstre o GET: Vá para a rota /professores (GET) e execute-a. O professor cadastrado no item 1 deve aparecer.

3. Cadastro Solicitado (3 Minutos)

Ação ao Vivo: Vá para a rota /professores (POST).

Cadastre o professor solicitado pelo professor (ou o que ele pedir).

Confirmação: Retorne rapidamente ao Frontend (o site) e atualize a página. O novo professor deve aparecer imediatamente na lista.

4. Revisão e DevOps (2 Minutos)

Aponte para as URLs e o README.md no seu repositório GitHub (https://github.com/gabrielldosantos/Projeto_Backend).

Explique o CD: Mencione que cada git push ativa o "robô" (GitHub Actions) que constrói o Docker e publica automaticamente no Render, garantindo o Contínuo Deployment.

Mencione o Postgres: Explique que o banco de dados é persistente (Postgres), resolvendo o problema de dados que desaparecem no plano gratuito.

Fim do Documento