const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;
};
