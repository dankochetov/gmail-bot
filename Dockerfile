FROM node:10-alpine3.11
COPY . /usr/src/app
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN yarn install
RUN yarn build:server
CMD ["sh", "-c", "yarn build:ui && yarn start:server:prod"]
EXPOSE 3000
