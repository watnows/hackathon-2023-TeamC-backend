FROM node:18
LABEL author="TAKAYAMAN2180"

WORKDIR /app

COPY . /app/

RUN apt-get update

RUN npm install

CMD ["npm", "start"]