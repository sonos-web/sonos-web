import Axios from '../../axios';

const axios = new Axios('/api/spotify');
export default {
  getAuthURL() {
    return axios.get('/authorize');
  },
  authorize(code) {
    return axios.post('/authorizeCode', { code });
  },
  checkAuthorization(tokens) {
    return axios.post('/checkAuthorization', tokens);
  },
  getUserPlaylists() {
    return axios.get('/playlists');
  },
  getUserAlbums() {
    return axios.get('/albums');
  },
  getUserSongs() {
    return axios.get('/songs');
  },
  get(path) {
    return axios.get(path.replace('/spotify', ''));
  },
};
