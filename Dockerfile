FROM node:20-alpine AS builder

WORKDIR /app

# Variables injectées au build (passées via docker-compose build.args)
ARG VITE_API_URL_BR
ARG VITE_API_URL_EC
ARG VITE_API_URL_CO
ENV VITE_API_URL_BR=$VITE_API_URL_BR
ENV VITE_API_URL_EC=$VITE_API_URL_EC
ENV VITE_API_URL_CO=$VITE_API_URL_CO

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Image finale, plus légère ----
FROM node:20-alpine

WORKDIR /app

# On installe vite juste pour pouvoir lancer "preview" (ou switch vers "serve", voir remarque plus bas)
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./vite.config.ts

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]