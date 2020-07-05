FROM node:10-alpine AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build:server

FROM node:10-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
CMD ["sh", "-c", "yarn build:ui && yarn start:server:prod"]
EXPOSE 3000
