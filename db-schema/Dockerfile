FROM node:4.3.0

WORKDIR /usr/src/app

EXPOSE 8080

COPY package.json /usr/src/app/

RUN npm install -g nodemon
RUN npm install

COPY . /usr/src/app/

CMD node index.js
