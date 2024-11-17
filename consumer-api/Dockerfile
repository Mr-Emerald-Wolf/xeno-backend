FROM node:18-alpine

WORKDIR /app

COPY package*.json /app

RUN npm ci

COPY . /app

RUN npm i -g nodemon

RUN npx prisma generate

CMD ["nodemon", "server.ts"]