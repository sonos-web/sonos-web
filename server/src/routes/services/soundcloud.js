const router = require('express').Router();

module.exports = function SoundcloudRoutes(soundcloud) {
  this.router = router;
  this.soundcloud = soundcloud;

  this.router.get('/authorize', async (req, res) => {
    res.send({ authURL: this.soundcloud.authorizeURL });
  });

  this.router.post('/authorizeCode', async (req, res) => {
    try {
      const tokens = await this.soundcloud.authorizeCode(req.body.code);
      res.status(200).send(tokens);
    } catch (error) {
      res.status(error.statusCode).send(error.message);
    }
  });

  this.router.get('/stream', async (req, res) => {
    try {
      const stream = await this.soundcloud.getStream({
        limit: parseInt(req.query.total, 10) || 20,
        offset: parseInt(req.query.start, 10) || 0,
      });
      res.status(200).send(stream);
    } catch (error) {
      res.status(error.statusCode).send(error.message);
    }
  });

  this.router.get('/playlist/:id', async (req, res) => {
    try {
      const playlist = await this.soundcloud.getPlaylist(req.params.id, {
        limit: parseInt(req.query.total, 10) || 30,
        offset: parseInt(req.query.start, 10) || 0,
      });
      res.status(200).send(playlist);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/user/:id', async (req, res) => {
    try {
      const playlist = await this.soundcloud.getArtist(req.params.id, {
        limit: parseInt(req.query.total, 10) || 30,
        offset: parseInt(req.query.start, 10) || 0,
      });
      res.status(200).send(playlist);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/related/:trackid', async (req, res) => {
    try {
      const playlist = await this.soundcloud.getRelated(req.params.trackid, {
        limit: parseInt(req.query.total, 10) || 30,
        offset: parseInt(req.query.start, 10) || 0,
      });
      res.status(200).send(playlist);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/search', async (req, res) => {
    try {
      const results = await this.soundcloud.search(req.query.searchTerm, {
        limit: parseInt(req.query.total, 10) || 30,
        offset: parseInt(req.query.start, 10) || 0,
      });
      res.status(200).send(results);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};
