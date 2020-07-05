FROM node:alpine:12
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn build:server
RUN yarn build:ui
CMD ["yarn", "start:server:prod"]
EXPOSE 3000
