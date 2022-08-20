import Axios from '../../axios';

const axios = new Axios('/api/soundcloud');
export default {
  getAuthURL() {
    return axios.get('/authorize');
  },
  authorize(code) {
    return axios.post('/authorizeCode', { code });
  },
  getStream(options) {
    return axios.get('/stream', { params: options });
  },
  search(options) {
    return axios.get('/search', { params: options });
  },
  get(path, options) {
    return axios.get(path.replace('/soundcloud', ''), { params: options });
  },
};
