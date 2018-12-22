const router = require('express').Router();

module.exports = function Zones(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/:id/ungroup', async (req, res) => {
    await this.sonosNetwork.leaveGroup(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/volume/:volume', async (req, res) => {
    await this.sonosNetwork.setVolume(req.params.id, req.params.volume);
    res.status(200).send();
  });
  this.router.put('/:id/mute', async (req, res) => {
    await this.sonosNetwork.setMute(req.params.id, req.body.mute);
    res.status(200).send();
  });
};
