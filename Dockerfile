FROM ubuntu:24.04
RUN apt update -y
RUN apt upgrade -y
RUN apt install postgresql -y
RUN apt install wget -y
RUN apt install sudo -y
RUN apt install neovim -y
RUN wget https://deb.nodesource.com/setup_23.x
RUN sudo -E bash setup_23.x
RUN sudo apt-get install nodejs -y

RUN mkdir /app
WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci
COPY ./eslint.config.js /app
COPY ./tsconfig.app.json /app
COPY ./tsconfig.json /app
COPY ./tsconfig.node.json /app
COPY ./vite.config.ts /app
COPY ./index.html /app
COPY ./public /app/public
COPY ./src /app/src

COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]


