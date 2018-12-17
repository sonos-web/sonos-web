import axios from 'axios';

export default {
  ungroupAllZones() {
    return axios.post('/api/zones/ungroup/all');
  },
  ungroupZone(zoneId) {
    return axios.post(`/api/zones/ungroup/${zoneId}`);
  },
  joinGroup(groupId, zoneId) {
    return axios.post('/api/zones/join', { groupId, zoneId });
  },
  partyMode(groupId) {
    return axios.post(`/api/zones/partymode/${groupId}`);
  },
};
