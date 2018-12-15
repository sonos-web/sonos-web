const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/ungroup/:id', async (req, res) => {
    await this.sonosNetwork.leaveGroup(req.params.id);
    res.status(200).send();
  });
};
