/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const emptyAlbumArtURL = require('./assets/empty-album-art.png');

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    isLoading: false,
    loadingMessage: 'Searching for your Sonos System...',
    discoveringSonos: false,
    zoneGroups: [],
    activeZoneId: null,
    defaultAlbumArtURL: emptyAlbumArtURL,
  },
  getters: {
    // eslint-disable-next-line arrow-body-style
    getGroupById: state => (groupId) => {
      return state.zoneGroups.find(group => group.id === groupId);
    },
    groupName: (state, getters) => (groupId) => {
      const zoneGroup = getters.getGroupById(groupId);
      return zoneGroup.members.length === 0 ? zoneGroup.coordinator.name : `${zoneGroup.coordinator.name} + ${zoneGroup.members.length}`;
    },
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
    UPDATE_ZONE_GROUP(state, data) {
      // find the group that this data belongs to
      // device will always be the coordinator
      const index = state.zoneGroups.findIndex(group => group.coordinator.id === data.deviceId);
      // Merge the zoneGroup with new data
      // Must use Vue.set otherwise, our data wont be reactive
      Vue.set(state.zoneGroups, index, { ...state.zoneGroups[index], ...data.update });
    },
    SET_ACTIVE_ZONE(state, zoneId) {
      state.activeZoneId = zoneId;
    },
    SET_ZONE_GROUPS(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {
    setActiveZone(context, group) {
      context.commit('SET_ACTIVE_ZONE', group.coordinator.id);
      const zoneGroup = context.getters.getGroupById(group.id);
      const artist = zoneGroup.track.artist ? ` · ${zoneGroup.track.artist}` : '';
      document.title = `${zoneGroup.track.title || '[No music selected]'}${artist} - ${context.getters.groupName(zoneGroup.id)}`;
    },
  },
});
