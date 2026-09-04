FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g npm@10.9.2
RUN npm --version
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
