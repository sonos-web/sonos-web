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
  getUserPlaylists(options) {
    return axios.get('/playlists', { params: options });
  },
  getUserAlbums(options) {
    return axios.get('/albums', { params: options });
  },
  getUserSongs(options) {
    return axios.get('/songs', { params: options });
  },
  get(path) {
    return axios.get(path.replace('/spotify', ''));
  },
};
