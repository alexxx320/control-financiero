# Dockerfile para deploy en Railway
FROM node:18-alpine

WORKDIR /app

# Variables de entorno para optimizar npm
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --silent

# Copiar código fuente del backend
COPY backend/ .

# Construir aplicación
RUN npm run build

# Limpiar para producción
RUN npm prune --production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
