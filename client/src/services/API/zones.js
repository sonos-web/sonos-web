import axios from 'axios';

export default {
  ungroupAllZones() {
    return axios.post('/api/zones/ungroup/all');
  },
  ungroupZone(zoneId) {
    return axios.post(`/api/zones/${zoneId}/ungroup`);
  },
  joinGroup(groupId, zoneId) {
    return axios.post('/api/zones/join', { groupId, zoneId });
  },
  partyMode(groupId) {
    return axios.post(`/api/zones/${groupId}/partyMode`);
  },
  groupMute(groupId, mute) {
    return axios.put(`/api/zones/${groupId}/groupMute`, { mute });
  },
};
