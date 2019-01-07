const router = require('express').Router();

module.exports = function MusicLibrary(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/albumArtists', async (req, res) => {
    try {
      const albumArtists = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'albumArtists' });
      res.status(200).send(albumArtists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/albums', async (req, res) => {
    try {
      const albums = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'albums' });
      res.status(200).send(albums);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/songs', async (req, res) => {
    try {
      const songs = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'tracks' });
      res.status(200).send(songs);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/genres', async (req, res) => {
    try {
      const genres = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'genres' });
      res.status(200).send(genres);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/playlists', async (req, res) => {
    try {
      const playlists = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'playlists' });
      res.status(200).send(playlists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/sonosPlaylists', async (req, res) => {
    try {
      const playlists = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'sonos_playlists' });
      res.status(200).send(playlists);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  this.router.post('/shares', async (req, res) => {
    try {
      const share = await this.sonosNetwork.musicLibrary.getLibraryItem({ ...req.body, libraryItem: 'share' });
      res.status(200).send(share);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};
