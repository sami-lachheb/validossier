FROM node:24-alpine

RUN apk add --no-cache su-exec

WORKDIR /usr/src

COPY package.json ./

RUN npm install

WORKDIR /usr/src/app

COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN chown -R node:node /usr/src/app /usr/src/node_modules

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]

CMD ["npm", "run", "dev"]
