import axios from 'axios';

export default {
  ungroupZone(zoneId) {
    return axios.post(`/api/zones/ungroup/${zoneId}`);
  },
  joinGroup(groupId, zoneId) {
    return axios.post('/api/zones/join', { groupId, zoneId });
  },
};
