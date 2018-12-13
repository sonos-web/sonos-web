/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    isLoading: false,
    loadingMessage: 'Searching for your Sonos System...',
    discoveringSonos: false,
    zoneGroups: [],
  },
  getters: {
    // getZoneById: state => (id) => {
    //   state.zones.find(zone => zone.zoneID === id);
    // },
    // coordinatorZones: (state) => {
    //   const zones = [];
    //   state.zoneGroups.forEach((zoneGroup) => {
    //     const match = zoneGroup.members.filter(zone => zone.isCoordinator)[0];
    //     zones.push(match);
    //   });
    //   return zones;
    // },
    // memberZones: (state) => {
    //   const zones = [];
    //   state.zoneGroups.forEach((zoneGroup) => {
    //     const matches = zoneGroup.members.filter(zone => !zone.isCoordinator);
    //     matches.forEach((match) => {
    //       zones.push(match);
    //     });
    //   });
    //   return zones;
    // },
  },
  mutations: {
    SET_IS_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_LOADING_MESSAGE(state, message) {
      state.loadingMessage = message;
    },
    SET_DISCOVERING_SONOS(state, discovering) {
      state.discoveringSonos = discovering;
    },
    SET_ZONE(state, zone) {
      const index = state.zones.findIndex(z => zone.zoneID === z.zoneID);
      // Add or merge zone
      if (index > -1) {
        state.zones[index] = { ...state.zones[index], ...zone };
      } else {
        state.zones.push(zone);
      }
    },
    SET_ZONE_GROUPS(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {

  },
});
