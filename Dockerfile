# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
FROM node:20-bookworm

WORKDIR /app/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 2014 5000

ENTRYPOINT ["node", "socketQueue.js"]