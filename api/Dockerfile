FROM node:4.2.6

WORKDIR /usr/src/app
EXPOSE 8080
EXPOSE 8081

COPY package.json /usr/src/app/


RUN npm install -g nodemon
RUN npm install

COPY . /usr/src/app/

CMD node index.js
