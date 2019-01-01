import io from 'socket.io-client';
import store from '../store';

const socket = io(process.env.VUE_APP_SERVER);

socket.on('Discovering Sonos Devices', () => {
  store.commit('SET_DISCOVERING_SONOS', true);
  store.commit('SET_HAS_ERROR', false);
  store.commit('SET_LOADING_MESSAGE', 'Searching for your Sonos System...');
});

socket.on('Sonos Device Discovery Complete', (zoneGroups) => {
  store.commit('SET_DISCOVERING_SONOS', false);
  store.commit('SET_HAS_ERROR', false);
  store.commit('SET_ZONE_GROUPS', zoneGroups);
  store.dispatch('loadActiveZoneGroup');
});

socket.on('No Sonos Devices Found On Network', () => {
  store.commit('SET_DISCOVERING_SONOS', false);
  store.commit('SET_HAS_ERROR', true);
  store.commit('SET_ERROR_MESSAGE', 'No Sonos System was found on your network.');
});
socket.on('An Unknown Error Occurred While Retrieving Devices', (error) => {
  store.commit('SET_DISCOVERING_SONOS', false);
  store.commit('SET_HAS_ERROR', true);
  store.commit('SET_ERROR_MESSAGE', `An unexpected error occurred while searching for your Sonos System: ${error}`);
});

socket.on('Sonos Event Data Received', (data) => {
  store.dispatch('updateZoneGroup', data);
});

socket.on('disconnect', () => {
  store.commit('SET_HAS_ERROR', true);
  store.commit('SET_ERROR_MESSAGE', 'We got disconnected from the Sonos Network. Is the application server running?');
});
