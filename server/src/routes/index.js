
// Dependencies
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const router = require('express').Router();

const Zones = require('./zones');
const Groups = require('./groups');
const MusicLibrary = require('./musicLibrary');
const LibraryDetail = require('./libraryDetail');
const SpotifyRoutes = require('./services/spotify');

const Spotify = require('../plugins/Spotify');

const SoundcloudRoutes = require('./services/soundcloud');
const Soundcloud = require('../plugins/Soundcloud');


module.exports = function Routes(sonosNetwork) {
  this.router = router;
  this.sonosNetwork = sonosNetwork;
  this.spotify = new Spotify(this.sonosNetwork);
  this.soundcloud = new Soundcloud(this.sonosNetwork);

  // the directory of the client code in production
  const clientDir = `${process.cwd()}/dist`;
  const clientIndex = `${clientDir}/index.html`;
  if (process.env.NODE_ENV === 'production') {
    // In Production, all the client code will be in the 'dist' folder
    this.router.use(serveStatic(clientDir));
    // Redirect any GET requests to our client's router
    this.router.use(history({ index: clientIndex }));
  }

  // All router
  const zones = new Zones(this.sonosNetwork);
  const groups = new Groups(this.sonosNetwork);
  const musicLibrary = new MusicLibrary(this.sonosNetwork);
  const libraryDetail = new LibraryDetail(this.sonosNetwork);
  const spotifyRoutes = new SpotifyRoutes(this.spotify);
  const soundcloudRoutes = new SoundcloudRoutes(this.soundcloud);

  this.router.use('/api/zones', zones.router);
  this.router.use('/api/groups', groups.router);
  this.router.use('/api/library', musicLibrary.router);
  this.router.use('/api/detail', libraryDetail.router);
  this.router.use('/api/spotify', spotifyRoutes.router);
  this.router.use('/api/soundcloud', soundcloudRoutes.router);
  // End All router

  // This MUST come last - all router that we do not have endpoints for
  if (process.env.NODE_ENV === 'production') {
    // send back to the client index
    this.router.get('*', (req, res) => {
      res.sendFile(clientIndex);
    });
  } else {
    // send 404 error message
    this.router.get('*', (req, res) => {
      console.log('404');
      res.status(404).send({ status: '404', message: 'endpoint not found' });
    });
  }
};
