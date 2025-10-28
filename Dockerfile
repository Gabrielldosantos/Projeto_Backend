# ---- Estágio 1: Build (Construção) ----
# Usamos uma imagem Node "completa" para construir
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos que definem o projeto
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies como o typescript)
RUN npm install

# Copia todo o resto do código-fonte
COPY . .

# Compila o TypeScript para JavaScript (gera a pasta 'dist')
# Isso usa o script "build": "tsc" que adicionamos no package.json
RUN npm run build


# ---- Estágio 2: Production (Produção) ----
# Usamos uma imagem "slim" (menor) para rodar
FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de definição de projeto novamente
COPY package.json package-lock.json ./

# Instala APENAS as dependências de produção (ignora o typescript)
RUN npm ci --omit=dev

# Copia o código JÁ COMPILADO (a pasta 'dist') do estágio 'builder'
COPY --from=builder /app/dist ./dist

# Expõe a porta que a API usa (definida no seu index.ts)
EXPOSE 3000

# O comando para iniciar a API
CMD ["node", "dist/index.js"]
