# Multi-stage build para optimizar tamaño
FROM node:18-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./

# Instalar todas las dependencias (incluidas devDependencies para build)
RUN npm ci --silent

# Copiar código fuente del backend
COPY backend/ .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar package.json para dependencias de producción
COPY backend/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production --silent

# Copiar el build de la etapa anterior
COPY --from=build /app/dist ./dist

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar permisos
RUN chown -R nestjs:nodejs /app

# Usar usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "dist/main"]
