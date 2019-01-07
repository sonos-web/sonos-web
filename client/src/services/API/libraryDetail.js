import Axios from '../axios';

const axios = new Axios('/api/detail');
export default {
  get(path, options = null) {
    return axios.post(path, options);
  },
};
