const router = require('express').Router();
const { Base64 } = require('js-base64');
const {
  NoResultsFound,
} = require('../sonos/MusicLibraryErrors');

module.exports = function LibraryDetail(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/artist/:name', async (req, res) => {
    try {
      const albums = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'albumArtists',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
      });
      res.status(200).send(albums);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/artist/all/:name', async (req, res) => {
    try {
      const songs = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'albumArtists',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
        browseDepth: 1,
      });
      res.status(200).send(songs);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/album/:name', async (req, res) => {
    try {
      const songs = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'albums',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
      });
      res.status(200).send(songs);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/genre/:name', async (req, res) => {
    try {
      const artists = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'genres',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
      });
      res.status(200).send(artists);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/genre/all/:name', async (req, res) => {
    try {
      const albums = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'genres',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
        browseDepth: 1,
      });
      res.status(200).send(albums);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/genre/all/:name/songs', async (req, res) => {
    try {
      const songs = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'genres',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
        browseDepth: 2,
      });
      res.status(200).send(songs);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/playlist/:name', async (req, res) => {
    try {
      const playlistName = Base64.decode(req.params.name);
      const playlistURI = await this.sonosNetwork.musicLibrary.getPlaylistURI(playlistName);
      const songs = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'playlists',
        searchTerm: playlistURI,
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
      });
      res.status(200).send(songs);
    } catch (error) {
      this.handleError(error, res);
    }
  });
  this.router.post('/share/:name', async (req, res) => {
    try {
      const songs = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: 'share',
        searchTerm: Base64.decode(req.params.name),
        searchOptions: { start: req.body.startIndex, total: req.body.requestedCount },
      });
      res.status(200).send(songs);
    } catch (error) {
      this.handleError(error, res);
    }
  });

  this.handleError = function handleError(error, res) {
    const { message } = error;
    switch (error.message) {
      case NoResultsFound:
        res.status(404).send(message);
        break;
      default:
        res.status(500).send(message);
        break;
    }
  };
};
