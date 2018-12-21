import axios from 'axios';

export default {
  partyMode(groupId) {
    return axios.post(`/api/groups/${groupId}/party`);
  },
  ungroupAllZones() {
    return axios.post('/api/groups/ungroup');
  },
  joinGroup(groupId, zoneId) {
    return axios.post(`/api/groups/${groupId}/join`, { zoneId });
  },
  groupMute(groupId, mute) {
    return axios.put(`/api/groups/${groupId}/mute`, { mute });
  },
};
