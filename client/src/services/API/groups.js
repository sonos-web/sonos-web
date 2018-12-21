import axios from 'axios';

export default {
  partyMode(groupId) {
    return axios.post(`/api/groups/${groupId}/party`);
  },
  ungroupAllZones() {
    return axios.post('/api/groups/ungroup');
  },
  join(groupId, zoneId) {
    return axios.post(`/api/groups/${groupId}/join`, { zoneId });
  },
  play(groupId) {
    return axios.put(`/api/groups/${groupId}/play`);
  },
  pause(groupId) {
    return axios.put(`/api/groups/${groupId}/pause`);
  },
  next(groupId) {
    return axios.put(`/api/groups/${groupId}/next`);
  },
  previous(groupId) {
    return axios.put(`/api/groups/${groupId}/previous`);
  },
  volume(groupId, volume) {
    return axios.put(`/api/groups/${groupId}/volume/${volume}`);
  },
  mute(groupId, mute) {
    return axios.put(`/api/groups/${groupId}/mute`, { mute });
  },
};
