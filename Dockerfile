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
COPY package.json ./
COPY yarn.lock ./
COPY .yarnclean ./
RUN yarn install
COPY . .
COPY --from=builder /usr/src/app/dist ./dist
CMD ["yarn", "start:server:deployed"]
EXPOSE 3000
