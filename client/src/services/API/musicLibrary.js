import Axios from '../axios';

const axios = new Axios('/api/library');
export default {
  getAlbumArtists(options) {
    return axios.post('/albumArtists', options);
  },
  getAlbums(options) {
    return axios.post('/albums', options);
  },
  getSongs(options) {
    return axios.post('/tracks', options);
  },
  getGenres(options) {
    return axios.post('/genres', options);
  },
  getPlaylists(options) {
    return axios.post('/playlists', options);
  },
  getSonosPlaylists(options) {
    return axios.post('/sonos_playlists', options);
  },
  getSonosFavorites(options) {
    return axios.post('/favorites', options);
  },
  getShares(options) {
    return axios.post('/share', options);
  },
  searchAlbumArtists(options) {
    return axios.post('/search/albumArtists', options);
  },
  searchAlbums(options) {
    return axios.post('/search/albums', options);
  },
  searchSongs(options) {
    return axios.post('/search/tracks', options);
  },
  searchGenres(options) {
    return axios.post('/search/genres', options);
  },
  searchPlaylists(options) {
    return axios.post('/search/playlists', options);
  },
  searchSonosPlaylists(options) {
    return axios.post('/search/sonos_playlists', options);
  },
  searchTopResults(options) {
    return axios.post('/search/results', options);
  },
};
