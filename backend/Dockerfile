# Dockerfile ultra-rápido para Railway - Sin dependencias pesadas
FROM node:18-alpine

WORKDIR /app

# Variables de entorno para optimizar npm
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copiar package.json y crear una versión sin puppeteer
COPY package*.json ./

# Crear package.json temporal sin puppeteer
RUN npm pkg delete dependencies.puppeteer && \
    npm pkg delete devDependencies.puppeteer

# Instalar dependencias sin puppeteer
RUN npm install --silent

# Copiar código fuente
COPY . .

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
