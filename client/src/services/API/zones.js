import axios from 'axios';

export default {
  fetchZoneGroups() {
    return axios.get('/api/zones');
  },
};
