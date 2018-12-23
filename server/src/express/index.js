const app = require('express')();
const bodyParser = require('body-parser');

module.exports = function express() {
  // add middleware for processing json
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  return app;
};
