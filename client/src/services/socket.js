import io from 'socket.io-client';
import store from '../store';

const socket = io(process.env.VUE_APP_SERVER);

socket.on('Discovering Sonos Devices', () => {
  store.commit('SET_IS_LOADING', true);
});

socket.on('Sonos Device Discovery Complete', (zoneGroups) => {
  store.commit('SET_IS_LOADING', false);
  store.commit('SET_ZONE_GROUPS', zoneGroups);
});

socket.on('AVTransport State Changed', (transportInfo) => {
  store.commit('SET_ZONE', transportInfo);
});
