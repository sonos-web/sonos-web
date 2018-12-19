/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import './helpers/extensions/Object';

Vue.use(Vuex);

const emptyAlbumArtURL = require('./assets/empty-album-art.png');
const tvAlbumArtURL = require('./assets/tv-album-art.png');

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    settings: {
      notifications: {
        dragAndDropRooms: {
          show: true,
          timeout: 8000,
          text: 'Tip: Drag rooms to group together.',
        },
      },
    },
    isLoading: false,
    loadingMessage: null,
    hasError: false,
    errorMessage: null,
    documentTitleForActiveGroup: null,
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
      if (group) {
        return group.track.albumArtURL
        || (group.tvPlaying ? state.tvAlbumArtURL : state.defaultAlbumArtURL);
      }
      return state.defaultAlbumArtURL;
    },
    trackTitleForGroup: (state, getters) => (groupId) => {
      const group = getters.getGroupById(groupId);
      if (group) {
        let title = '[No music selected]';
        if (group.tvPlaying) {
          title = 'TV';
        } else if (group.track.album) {
          title = group.track.title || '';
        }
        return title;
      }
      return '';
    },
  },
  mutations: {
    SET_IS_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_LOADING_MESSAGE(state, message) {
      state.loadingMessage = message;
    },
    SET_ERROR_MESSAGE(state, message) {
      state.errorMessage = message;
    },
    SET_HAS_ERROR(state, hasError) {
      state.hasError = hasError;
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
    SET_DOCUMENT_TITLE_FOR_ACTIVE_GROUP(state, title) {
      state.documentTitleForActiveGroup = title;
    },
    MERGE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    UPDATE_SETTINGS(state, payload) {
      Object.prop(state.settings, payload.property, payload.value);
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
  },
  actions: {
    setActiveZoneGroup(context, groupId) {
      localStorage.setItem('activeZoneGroupId', groupId);
      context.commit('SET_ACTIVE_ZONE', groupId);
      context.dispatch('setDocumentTitleForActiveGroup');
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
      context.dispatch('setActiveZoneGroup', activeZoneGroupId);
    },
    setDocumentTitleForActiveGroup(context) {
      const zoneGroup = context.getters.getGroupById(context.state.activeZoneGroupId);
      let documentTitle = null;
      if (zoneGroup) {
        const artist = zoneGroup.track.artist ? ` · ${zoneGroup.track.artist}` : '';
        const title = context.getters.trackTitleForGroup(zoneGroup.id);
        const groupName = context.getters.groupName(zoneGroup.id);
        documentTitle = `${title}${artist} - ${groupName}`;
      }
      context.commit('SET_DOCUMENT_TITLE_FOR_ACTIVE_GROUP', documentTitle);
    },
    loadSettings(context) {
      const settings = JSON.parse(localStorage.getItem('settings'));
      if (settings) {
        // Merge together
        context.commit('MERGE_SETTINGS', settings);
      }
    },
  },
});
