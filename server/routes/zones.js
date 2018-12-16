const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/ungroup/:id', async (req, res) => {
    await this.sonosNetwork.leaveGroup(req.params.id);
    res.status(200).send();
  });
  this.router.post('/join', async (req, res) => {
    await this.sonosNetwork.joinGroup(req.body.groupId, req.body.zoneId);
    res.status(200).send();
  });
};
