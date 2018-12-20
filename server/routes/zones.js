const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/ungroup/all', async (req, res) => {
    await this.sonosNetwork.ungroupAllZones();
    res.status(200).send();
  });
  this.router.post('/:zoneId/ungroup', async (req, res) => {
    await this.sonosNetwork.leaveGroup(req.params.zoneId);
    res.status(200).send();
  });
  this.router.post('/join', async (req, res) => {
    await this.sonosNetwork.joinGroup(req.body.groupId, req.body.zoneId);
    res.status(200).send();
  });
  this.router.post('/:groupId/partyMode', async (req, res) => {
    await this.sonosNetwork.partyMode(req.params.groupId);
    res.status(200).send();
  });

  this.router.put('/:zoneId/volume/:volume', async (req, res) => {
    await this.sonosNetwork.setVolume(req.params.zoneId, req.params.volume);
    res.status(200).send();
  });
  this.router.put('/:zoneId/mute', async (req, res) => {
    await this.sonosNetwork.setMute(req.body.mute);
    res.status(200).send();
  });
  this.router.put('/:groupId/groupVolume/:volume', async (req, res) => {
    await this.sonosNetwork.setGroupVolume(req.params.groupId, req.params.volume);
    res.status(200).send();
  });
  this.router.put('/:groupId/groupMute', async (req, res) => {
    await this.sonosNetwork.setGroupMute(req.params.groupId, req.body.mute);
    res.status(200).send();
  });
};
