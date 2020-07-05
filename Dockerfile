FROM node:10-alpine AS builder
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY .yarnclean ./
RUN yarn install
COPY . .
RUN yarn build:server

FROM node:10-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./
CMD ["sh", "-c", "yarn build:ui && yarn start:server:prod"]
EXPOSE 3000
