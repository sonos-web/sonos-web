const router = require('express').Router();

module.exports = function Groups(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/:id/party', async (req, res) => {
    await this.sonosNetwork.partyMode(req.params.id);
    res.status(200).send();
  });
  this.router.post('/ungroup', async (req, res) => {
    await this.sonosNetwork.ungroupAllZones();
    res.status(200).send();
  });
  this.router.post('/:id/join', async (req, res) => {
    await this.sonosNetwork.joinGroup(req.params.id, req.body.zoneId);
    res.status(200).send();
  });
  this.router.put('/:id/volume/:volume', async (req, res) => {
    await this.sonosNetwork.setGroupVolume(req.params.id, req.params.volume);
    res.status(200).send();
  });
  this.router.put('/:id/mute', async (req, res) => {
    await this.sonosNetwork.setGroupMute(req.params.id, req.body.mute);
    res.status(200).send();
  });
};
