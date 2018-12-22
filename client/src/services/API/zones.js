import Axios from '../axios';

const axios = new Axios('/api/zones');
export default {
  ungroupZone(zoneId) {
    return axios.post(`/${zoneId}/ungroup`);
  },
  volume(zoneId, volume) {
    return axios.put(`/${zoneId}/volume/${volume}`);
  },
  mute(zoneId, mute) {
    return axios.put(`/${zoneId}/mute`, { mute });
  },
};
