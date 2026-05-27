FROM node:20-alpine
RUN apk add --no-cache mysql-client
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]