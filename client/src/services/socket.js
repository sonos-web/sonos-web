import io from 'socket.io-client';
import store from '../store';

const socket = io(process.env.VUE_APP_SERVER);

socket.on('Discovering Sonos Devices', () => {
  store.commit('SET_DISCOVERING_SONOS', true);
  store.commit('SET_LOADING_MESSAGE', 'Searching for your Sonos System...');
});

socket.on('Sonos Device Discovery Complete', (zoneGroups) => {
  store.commit('SET_DISCOVERING_SONOS', false);
  store.commit('SET_ZONE_GROUPS', zoneGroups);
});

socket.on('No Sonos Devices Found On Network', () => {
  store.commit('SET_IS_LOADING', false);
});

socket.on('Sonos Event Data Received', (data) => {
  store.commit('UPDATE_ZONE_GROUP', data);
});
