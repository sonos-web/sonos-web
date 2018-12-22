import Axios from '../axios';

const axios = new Axios('/api/zones');
export default {
  ungroupZone(zoneId) {
    return axios.post(`/${zoneId}/ungroup`);
  },
};
