# 📚 Projeto Backend DevOps — **Gerenciamento de Professores**

API RESTful desenvolvida em **TypeScript** para o **módulo de gerenciamento de Professores**, atendendo aos requisitos do **Trabalho 6 de DevOps**.  
O sistema foi totalmente automatizado com **Continuous Deployment (CD)** via **GitHub Actions** e **Docker**, garantindo **padronização, integração contínua e implantação automática** no Render.

> 👨‍💻 **Autor:** Gabriel dos Santos

---

## 🔗 URLs de Acesso e Documentação (Produção)

| Serviço | Acesso | Descrição |
|----------|---------|-----------|
| 🌐 **Frontend (Site)** | [https://projeto-backend-1-bmv4.onrender.com/](#) | Aplicação web (formulário de login) integrada à API. |
| ⚙️ **Backend (API)** | [https://projeto-backend-zw5n.onrender.com/](#) | Rota principal da API (`/`). |
| 📘 **Documentação (Swagger)** | [https://projeto-backend-zw5n.onrender.com/api-docs](#) | Documentação interativa completa das rotas da API. |
| 💾 **Repositório GitHub** | [https://github.com/gabrielldosantos/Projeto_Backend](#) | Código-fonte completo e pipeline de CI/CD configurado. |

> 💡 Substitua os `#` acima pelos links reais do Render, Swagger e GitHub quando disponíveis.

---

## ⚙️ Tecnologias e Requisitos Técnicos

A tabela abaixo apresenta as tecnologias utilizadas, o status dos requisitos e links de referência.

| Requisito | Status | Tecnologia Utilizada | Documentação / Referência |
|------------|:------:|----------------------|----------------------------|
| API em TypeScript | ✅ | Node.js + TypeScript + Express.js | 
| Persistência de Dados | ✅ | TypeORM + PostgreSQL (Render) | 
| Autenticação | ✅ | JWT + Criptografia com bcrypt | 
| Documentação da API | ✅ | Swagger (swagger-jsdoc & swagger-ui-express) |
| Continuous Deployment | ✅ | GitHub Actions (build e deploy automático) | 
| Containers | ✅ | Docker + docker-compose.yml | 
| Frontend + Integração | ✅ | HTML + JavaScript (CORS configurado) | — |

---

## 🛠️ Instruções para Execução Local

Siga os passos abaixo para executar o projeto localmente (utilizando **SQLite** como banco de dados local).

### 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) e **npm** instalados  
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução (opcional, para testes com containers)

---

### 🚀 Passo 1 — Instalar Dependências

No terminal, dentro da pasta raiz do projeto, execute:

```bash
npm install

🧩 Passo 2 — Executar a API em Modo de Desenvolvimento

Inicie o servidor local (porta padrão 3000):

npm run dev

💻 Passo 3 — Testar o Frontend Localmente

O frontend está localizado em:
frontend/index.html


🧱 Estrutura do Projeto

📦 projeto-backend-devops
├── src/
│   ├── entities/
│   ├── routes/
│   ├── middlewares/
│   ├── data-source.ts
│   └── server.ts
├── frontend/
│   └── index.html
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md

🚢 Deploy Automatizado

O pipeline de CI/CD é configurado via GitHub Actions:

Executa build e testes automatizados

Cria imagem Docker padronizada

Realiza deploy contínuo na plataforma Render
