# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
FROM node:8

WORKDIR /app/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 2014

ENTRYPOINT ["node", "socketQueue.js"]