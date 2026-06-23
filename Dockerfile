FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]