# Dockerfile para Backend (NestJS) - Compatible con Windows
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache e instalar dependencias
RUN npm cache clean --force && npm install

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]
