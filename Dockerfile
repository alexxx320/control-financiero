# Dockerfile super simple para Railway
FROM node:18-alpine

WORKDIR /app

# Copiar solo el backend
COPY backend/ ./

# Instalar dependencias y buildar en un solo paso
RUN npm ci --silent && \
    npm run build && \
    npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
