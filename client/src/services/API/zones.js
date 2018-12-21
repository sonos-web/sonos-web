import axios from 'axios';

export default {
  ungroupZone(zoneId) {
    return axios.post(`/api/zones/${zoneId}/ungroup`);
  },
};
