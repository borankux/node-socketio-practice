FROM node:lts-alpine

VOLUME /app
WORKDIR /app
RUN npm install nodemon -g
EXPOSE 3000

ENTRYPOINT ["nodemon", "main.js"]