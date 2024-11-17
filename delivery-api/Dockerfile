FROM node:18-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 7070

CMD ["nodemon","server.ts"]