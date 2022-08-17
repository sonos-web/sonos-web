FROM node:14.15.0

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean autoclean && apt-get autoremove --yes && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/sonos-web/sonos-web

WORKDIR /sonos-web/client
RUN npm install && \
    npm run build && \
    mv dist ../server/

WORKDIR /sonos-web
RUN rm -rf client

WORKDIR /sonos-web/server
RUN npm install && \
	npm install https://github.com/stufisher/node-sonos#v1.15.0-test && \
    mv .env.production .env && \
    printf "\nREGION=EU\n" >> .env && \
    printf "\nENHANCE_METADATA=true\n" >> .env

EXPOSE 5050
CMD npm start
