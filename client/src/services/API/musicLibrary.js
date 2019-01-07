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
    return axios.post('/songs', options);
  },
  getGenres(options) {
    return axios.post('/genres', options);
  },
  getPlaylists(options) {
    return axios.post('/playlists', options);
  },
  getSonosPlaylists(options) {
    return axios.post('/sonosPlaylists', options);
  },
  getShares(options) {
    return axios.post('/shares', options);
  },
};
