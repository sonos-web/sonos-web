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
    // eslint-disable-next-line arrow-body-style
    activeZoneGroup: (state, getters) => {
      return getters.getGroupById(state.activeZoneGroupId);
    },
    groupName: (state, getters) => (groupId) => {
      const group = getters.getGroupById(groupId);
      if (group) {
        return group.members.length === 0 ? group.coordinator.name : `${group.coordinator.name} + ${group.members.length}`;
      }
      return '';
    },
    albumArtURLForGroup: (state, getters) => (groupId) => {
      const group = getters.getGroupById(groupId);
      // eslint-disable-next-line max-len
      return group.track.albumArtURL || (group.tvPlaying ? state.tvAlbumArtURL : state.defaultAlbumArtURL);
    },
    trackTitleForGroup: (state, getters) => (groupId) => {
      const group = getters.getGroupById(groupId);
      let title = '[No music selected]';
      if (group.tvPlaying) {
        title = 'TV';
      } else if (group.track.album) {
        title = group.track.title || '';
      }
      return title;
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
    REMOVE_ZONE_GROUP(state, groupId) {
      const index = state.zoneGroups.findIndex(group => group.id === groupId);
      state.zoneGroups.splice(index, 1);
    },
    SET_ZONE_GROUPS(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {
    setActiveZoneGroup(context, groupId) {
      localStorage.setItem('activeZoneGroupId', groupId);
      context.commit('SET_ACTIVE_ZONE', groupId);
    },
    updateDocumentTitle(context) {
      const zoneGroup = context.getters.getGroupById(context.state.activeZoneGroupId);
      if (zoneGroup) {
        const artist = zoneGroup.track.artist ? ` · ${zoneGroup.track.artist}` : '';
        const title = context.getters.trackTitleForGroup(zoneGroup.id);
        const groupName = context.getters.groupName(zoneGroup.id);
        document.title = `${title}${artist} - ${groupName}`;
      }
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
