/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const emptyAlbumArtURL = require('./assets/empty-album-art.png');
const tvAlbumArtURL = require('./assets/tv-album-art.png');

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    isLoading: false,
    loadingMessage: 'Searching for your Sonos System...',
    discoveringSonos: false,
    zoneGroups: [],
    activeZoneGroupId: null,
    defaultAlbumArtURL: emptyAlbumArtURL,
    tvAlbumArtURL,
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
    // Expect data to be in format: {deviceId:String, update: Object}
    UPDATE_ZONE_GROUP(state, data) {
      // find the group that this data belongs to
      const index = state.zoneGroups.findIndex(group => group.id === data.groupId);
      // Merge the zoneGroup with new data
      // Must use Vue.set otherwise, our data wont be reactive
      Vue.set(state.zoneGroups, index, { ...state.zoneGroups[index], ...data.update });
    },
    SET_ACTIVE_ZONE(state, zoneId) {
      state.activeZoneGroupId = zoneId;
    },
    SET_ZONE_GROUPS(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {
    setActiveZoneGroup(context, groupId) {
      localStorage.setItem('activeZoneGroupId', groupId);
      context.commit('SET_ACTIVE_ZONE', groupId);
      context.dispatch('updateDocumentTitle', groupId);
    },
    updateDocumentTitle(context, groupId) {
      const zoneGroup = context.getters.getGroupById(groupId);
      const artist = zoneGroup.track.artist ? ` · ${zoneGroup.track.artist}` : '';
      const title = zoneGroup.tvPlaying ? 'TV' : zoneGroup.track.title || '[No music selected]';
      document.title = `${title}${artist} - ${context.getters.groupName(zoneGroup.id)}`;
    },
    loadActiveZoneGroup(context) {
      let activeZoneGroupId = localStorage.getItem('activeZoneGroupId');
      const validGroupId = context.state.zoneGroups.some(zg => zg.id === activeZoneGroupId);
      if (!activeZoneGroupId || !validGroupId) {
        // can't continue if there are no zone groups...
        if (context.state.zoneGroups.length === 0) return;

        // Try to find a zoneGroup that is playing, else pick first zoneGroup in list
        const zoneGroup = context.state.zoneGroups.find(zg => zg.state === 'PLAYING');
        if (zoneGroup) {
          activeZoneGroupId = zoneGroup.id;
        } else {
          activeZoneGroupId = context.state.zoneGroups[0].id;
        }
      }
      localStorage.setItem('activeZoneGroupId', activeZoneGroupId);
      context.commit('SET_ACTIVE_ZONE', activeZoneGroupId);
    },
  },
});
