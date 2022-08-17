const router = require('express').Router();

module.exports = function SpotifyRoutes(spotify) {
  this.router = router;
  this.spotify = spotify;

  this.router.get('/authorize', async (req, res) => {
    res.send({ authURL: this.spotify.authorizeURL });
  });
  this.router.post('/checkAuthorization', async (req, res) => {
    try {
      const authorized = await this.spotify.checkAuthorization(req.body);
      if (authorized) {
        res.status(200).send();
      } else {
        res.status(401).send();
      }
    } catch (error) {
      throw error;
    }
  });
  this.router.post('/authorizeCode', async (req, res) => {
    try {
      const tokens = await this.spotify.authorizeCode(req.body.code);
      res.status(200).send(tokens);
    } catch (error) {
      res.status(error.statusCode).send(error.message);
    }
  });

  this.router.get('/playlists', async (req, res) => {
    try {
      const playlists = await this.spotify.getUserPlaylists({
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(playlists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/albums', async (req, res) => {
    try {
      const albums = await this.spotify.getUserAlbums({
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(albums);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/songs', async (req, res) => {
    try {
      const songs = await this.spotify.getUserSongs({
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(songs);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/search/playlists', async (req, res) => {
    try {
      const playlists = await this.spotify.searchPlaylists(req.query.searchTerm, {
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(playlists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/search/albums', async (req, res) => {
    try {
      const albums = await this.spotify.searchAlbums(req.query.searchTerm, {
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(albums);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/search/artists', async (req, res) => {
    try {
      const artists = await this.spotify.searchArtists(req.query.searchTerm, {
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(artists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/search/songs', async (req, res) => {
    try {
      const songs = await this.spotify.searchSongs(req.query.searchTerm, {
        limit: parseInt(req.query.total, 10),
        offset: parseInt(req.query.start, 10),
      });
      res.status(200).send(songs);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.get('/playlist/:id', async (req, res) => {
    try {
      const playlist = await this.spotify.getPlaylist(req.params.id);
      res.status(200).send(playlist);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.get('/album/:id', async (req, res) => {
    try {
      const album = await this.spotify.getAlbum(req.params.id);
      res.status(200).send(album);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.get('/artist/:id', async (req, res) => {
    try {
      const albums = await this.spotify.getArtistAlbums(req.params.id);
      res.status(200).send(albums);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};
