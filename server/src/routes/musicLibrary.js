const router = require('express').Router();

module.exports = function MusicLibrary(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;

  this.router.post('/search/:libraryItem', async (req, res) => {
    try {
      const { libraryItem } = req.params;
      if (libraryItem === 'results') {
        const results = await this.sonosNetwork.musicLibrary.getTopResults({
          searchCategory: libraryItem,
          searchTerm: req.body.searchTerm,
          search: true,
        });
        res.status(200).send(results);
      } else if (libraryItem === 'sonos_playlists') {
        const results = await this.sonosNetwork.musicLibrary.searchSonosPlaylists({
          searchTerm: req.body.searchTerm,
        });
        res.status(200).send(results);
      } else {
        const results = await this.sonosNetwork.musicLibrary.browse({
          searchCategory: libraryItem,
          searchOptions: { start: req.body.start, total: req.body.total },
          searchTerm: req.body.searchTerm,
          search: true,
        });
        res.status(200).send(results);
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.post('/favorites', async (req, res) => {
    try {
      const results = await this.sonosNetwork.musicLibrary.getFavorites();
      res.status(200).send(results);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  this.router.post('/:libraryItem', async (req, res) => {
    try {
      const { libraryItem } = req.params;
      const results = await this.sonosNetwork.musicLibrary.browse({
        searchCategory: libraryItem,
        searchOptions: { start: req.body.start, total: req.body.total },
        searchTerm: req.body.searchTerm,
      });
      res.status(200).send(results);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};
