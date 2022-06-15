FROM node:18.3.0

WORKDIR /code

COPY package.json /code/package.json

RUN npm install

COPY controller/*.js /code

COPY client/build /code/build

CMD ["node", "server"]