# Dockerfile para Railway - Solo runtime
FROM node:18-alpine

WORKDIR /app

# Variables para optimizar npm
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --production --silent && npm cache clean --force

# Copiar el build compilado
COPY backend/dist ./dist

# Crear usuario no-root
RUN adduser -D nestjs
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
