const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/ungroup/all', async (req, res) => {
    await this.sonosNetwork.ungroupAllZones();
    res.status(200).send();
  });
  this.router.post('/ungroup/:zoneId', async (req, res) => {
    await this.sonosNetwork.leaveGroup(req.params.zoneId);
    res.status(200).send();
  });
  this.router.post('/join', async (req, res) => {
    await this.sonosNetwork.joinGroup(req.body.groupId, req.body.zoneId);
    res.status(200).send();
  });
  this.router.post('/partymode/:groupId', async (req, res) => {
    await this.sonosNetwork.partyMode(req.params.groupId);
    res.status(200).send();
  });
};
