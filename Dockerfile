FROM node:10-alpine3.11 AS build-server
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build:server

FROM node:10-alpine3.11 AS start
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=build-server /usr/src/app/dist ./dist
CMD ["sh", "-c", "yarn build:ui && yarn start:server:prod"]
EXPOSE 3000
