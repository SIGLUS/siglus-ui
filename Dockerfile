FROM debian:jessie

WORKDIR /siglus-ui

COPY package.json .
COPY bower.json .
COPY config.json .
COPY src/ ./src/
