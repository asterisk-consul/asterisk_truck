# ==== Etapa de Construcción (Build Stage) ====
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar package.json y lockfile
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (prod + dev) necesarias para el build
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación Nuxt (genera .output)
RUN pnpm run build

# ==== Etapa de Producción (Production Stage) ====
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar los archivos esenciales del builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Variables de entorno
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000


# Exponer puerto (Dockloid lo reescribirá con la variable PORT)
EXPOSE 3000

# Comando para iniciar la app en producción
CMD ["pnpm", "start"]
