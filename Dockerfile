# 1. Fase de Build: Usamos uma imagem Node maior para compilação
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json para instalar dependências
COPY package*.json ./
# Usamos --silent para evitar que avisos de dependências interrompam o build
# --only=production garante que só as 'dependencies' sejam instaladas, economizando tempo
RUN npm install --only=production --silent

# Copia todo o código-fonte (incluindo src/)
COPY . .

# Roda o script de build, que compila o TypeScript para JavaScript na pasta 'dist'
# Isso pode falhar se houver erros de TS no código, ou se tsconfig.json estiver errado.
# Vamos assumir que o tsconfig.json e o código estão corretos.
RUN npm run build

# 2. Fase de Produção: Usamos uma imagem menor para o runtime (mais leve)
FROM node:18-alpine

WORKDIR /app

# Copia apenas os node_modules (production), o package.json e a pasta 'dist' da fase anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist

# Expõe a porta que o Express está a usar
EXPOSE 3000

# Comando para iniciar o servidor Node.js
CMD ["npm", "start"]
