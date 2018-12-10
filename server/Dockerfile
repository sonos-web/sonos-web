FROM node:11.4-alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
RUN  npm install
COPY . /app
EXPOSE 5051
CMD [ "npm", "run", "dev"]