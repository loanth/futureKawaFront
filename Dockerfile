FROM node:20-alpine AS builder

WORKDIR /app

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

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]