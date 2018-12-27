import Axios from '../axios';

const axios = new Axios('/api/groups');
export default {
  getTrackPosition(groupId) {
    return axios.get(`/${groupId}/trackPosition`);
  },
  partyMode(groupId) {
    return axios.post(`/${groupId}/party`);
  },
  ungroupAllZones() {
    return axios.post('/ungroup');
  },
  join(groupId, zoneId) {
    return axios.post(`/${groupId}/join`, { zoneId });
  },
  play(groupId) {
    return axios.put(`/${groupId}/play`);
  },
  playTrackFromQueue(groupId, trackNumber) {
    return axios.put(`/${groupId}/play/${trackNumber}`);
  },
  pause(groupId) {
    return axios.put(`/${groupId}/pause`);
  },
  next(groupId) {
    return axios.put(`/${groupId}/next`);
  },
  previous(groupId) {
    return axios.put(`/${groupId}/previous`);
  },
  seek(groupId, seconds) {
    return axios.put(`/${groupId}/seek/${seconds}`);
  },
  volume(groupId, volume) {
    return axios.put(`/${groupId}/volume/${volume}`);
  },
  mute(groupId, mute) {
    return axios.put(`/${groupId}/mute`, { mute });
  },
  playMode(groupId, playMode) {
    return axios.put(`/${groupId}/mode`, { playMode });
  },
  saveQueue(groupId, playlistTitle) {
    return axios.post(`/${groupId}/queue/save`, { playlistTitle });
  },
  clearQueue(groupId) {
    return axios.put(`/${groupId}/queue/clear`);
  },
  removeTracksFromQueue(groupId, trackIndexes) {
    return axios.put(`/${groupId}/queue/remove`, { trackIndexes });
  },
  reorderTracksInQueue(groupId, oldIndex, newIndex) {
    return axios.put(`/${groupId}/queue/reorder`, { oldIndex, newIndex });
  },
};
