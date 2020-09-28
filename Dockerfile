FROM debian:jessie

WORKDIR /siglus-ui

COPY package.json .
COPY package-yarn.json .
COPY config.json .
COPY src/ ./src/
COPY build/messages/ ./messages/
COPY messages/ ./messages/
