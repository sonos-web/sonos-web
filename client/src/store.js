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
    UPDATE_AVTRANSPORT_DATA(state, data) {
      // find the group that this data belongs to
      // device will always be the coordinator
      const index = state.zoneGroups.findIndex(group => group.coordinator.id === data.deviceId);
      // Merge the zoneGroup with new transport info
      // Must use Vue.set otherwise, our data wont be reactive
      Vue.set(state.zoneGroups, index, { ...state.zoneGroups[index], ...data.transportInfo });
    },
    SET_ZONE_GROUPS(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {

  },
});
