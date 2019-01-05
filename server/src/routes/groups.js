const router = require('express').Router();

module.exports = function Groups(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.get('/:id/trackPosition', async (req, res) => {
    const position = await this.sonosNetwork.getTrackPosition(req.params.id);
    res.status(200).send({ position });
  });

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
  this.router.put('/:id/play', async (req, res) => {
    await this.sonosNetwork.play(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/play/:trackNumber', async (req, res) => {
    await this.sonosNetwork.playTrackFromQueue(req.params.id, req.params.trackNumber);
    res.status(200).send();
  });
  this.router.put('/:id/pause', async (req, res) => {
    await this.sonosNetwork.pause(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/next', async (req, res) => {
    await this.sonosNetwork.next(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/previous', async (req, res) => {
    await this.sonosNetwork.previous(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/seek/:seconds', async (req, res) => {
    await this.sonosNetwork.seek(req.params.id, req.params.seconds);
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

  this.router.put('/:id/mode', async (req, res) => {
    await this.sonosNetwork.setPlayMode(req.params.id, req.body.playMode);
    res.status(200).send();
  });

  this.router.post('/:id/queue/save', async (req, res) => {
    try {
      await this.sonosNetwork.saveQueue(req.params.id, req.body.playlistTitle);
      res.status(200).send();
    } catch (error) {
      res.status(500).send(error);
    }
  });
  this.router.put('/:id/queue/clear', async (req, res) => {
    await this.sonosNetwork.clearQueue(req.params.id);
    res.status(200).send();
  });
  this.router.put('/:id/queue/remove', async (req, res) => {
    await this.sonosNetwork.removeTracksFromQueue(req.params.id, req.body.trackIndexes);
    res.status(200).send();
  });
  this.router.put('/:id/queue/reorder', async (req, res) => {
    // eslint-disable-next-line max-len
    await this.sonosNetwork.reorderTracksInQueue(req.params.id, req.body.oldIndex, req.body.newIndex);
    res.status(200).send();
  });
};
