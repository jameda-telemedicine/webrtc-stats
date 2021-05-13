FROM node:16-alpine

EXPOSE 3000

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY index.js .

CMD [ "npm", "run", "start" ]
