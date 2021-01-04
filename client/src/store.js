/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import deepmerge from 'deepmerge';
import PlayState from './enums/PlayState';
import groupsAPI from './services/API/groups';
import './helpers/extensions/Object';

Vue.use(Vuex);

const emptyAlbumArtURL = require('./assets/empty-album-art.png');
const tvAlbumArtURL = require('./assets/tv-album-art.png');
const lineInAlbumArtURL = require('./assets/linein-album-art.png');

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
        dragAndDropTracksInQueue: {
          show: true,
          timeout: 8000,
          text: 'Tip: Drag songs to reorder queue.',
        },
      },
      spotify: {
        refreshToken: null,
      },
    },
    hasError: false,
    errorMessage: null,
    loadingMessage: null,
    documentTitleForActiveGroup: null,
    discoveringSonos: false,
    zoneGroups: [],
    activeZoneGroupId: null,
    defaultAlbumArtURL: emptyAlbumArtURL,
    currentTrackTimer: null,
    tvAlbumArtURL,
    lineInAlbumArtURL,
    previousRoutePath: null,
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
      if (group && group.track) {
        if (group.track.albumArtURL) return group.track.albumArtURL;

        if (group.tvPlaying) return state.tvAlbumArtURL;
        if (group.lineInPlaying) return state.lineInAlbumArtURL;
        return state.defaultAlbumArtURL;
      }
      return state.defaultAlbumArtURL;
    },
    trackTitleForGroup: (state, getters) => (groupId) => {
      const group = getters.getGroupById(groupId);
      if (group && group.track) {
        let title = '[No music selected]';
        if (group.tvPlaying) {
          title = 'TV';
        } else if (group.lineInPlaying) {
          title = 'Line In';
        } else if (group.track.title) {
          title = group.track.title || '';
        }
        return title;
      }
      return '';
    },
  },
  mutations: {
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
      state.settings = deepmerge(state.settings, settings);
    },
    UPDATE_SETTINGS(state, payload) {
      Object.prop(state.settings, payload.property, payload.value);
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    SET_TRACK_TIMER(state, timer) {
      clearInterval(state.currentTrackTimer);
      state.currentTrackTimer = timer;
    },
    CLEAR_TRACK_TIMER(state) {
      clearInterval(state.currentTrackTimer);
    },
    SET_PREVIOUS_ROUTE_PATH(state, path) {
      state.previousRoutePath = path;
    },
  },
  actions: {
    updateZoneGroup({ commit, dispatch }, data) {
      commit('UPDATE_ZONE_GROUP', data);
      dispatch('updateTrackTimer');
      dispatch('setDocumentTitleForActiveGroup');
    },
    setActiveZoneGroup({ commit, dispatch }, groupId) {
      localStorage.setItem('activeZoneGroupId', groupId);
      commit('SET_ACTIVE_ZONE', groupId);
      dispatch('setDocumentTitleForActiveGroup');
      dispatch('updateTrackTimer');
    },
    loadActiveZoneGroup({ state, dispatch }) {
      let activeZoneGroupId = localStorage.getItem('activeZoneGroupId');
      const validGroupId = state.zoneGroups.some(zg => zg.id === activeZoneGroupId);
      if (!activeZoneGroupId || !validGroupId) {
        // can't continue if there are no zone groups...
        if (state.zoneGroups.length === 0) return;

        // Try to find a zoneGroup that is playing, else pick first zoneGroup in list
        const zoneGroup = state.zoneGroups.find(zg => zg.state === PlayState.playing);
        if (zoneGroup) {
          activeZoneGroupId = zoneGroup.id;
        } else {
          activeZoneGroupId = state.zoneGroups[0].id;
        }
      }
      dispatch('setActiveZoneGroup', activeZoneGroupId);
    },
    setDocumentTitleForActiveGroup({ commit, state, getters }) {
      const zoneGroup = getters.getGroupById(state.activeZoneGroupId);
      let documentTitle = null;
      if (zoneGroup && zoneGroup.track) {
        const artist = zoneGroup.track.artist ? ` · ${zoneGroup.track.artist}` : '';
        const title = getters.trackTitleForGroup(zoneGroup.id);
        const groupName = getters.groupName(zoneGroup.id);
        documentTitle = `${title}${artist} - ${groupName}`;
      }
      if (documentTitle) {
        commit('SET_DOCUMENT_TITLE_FOR_ACTIVE_GROUP', documentTitle);
      }
    },
    updateTrackTimer({ dispatch, getters, commit }) {
      const group = getters.activeZoneGroup;
      if (group) {
        if (group.state === PlayState.playing) {
          dispatch('startTrackTimer');
        } else {
          commit('CLEAR_TRACK_TIMER');
        }
      }
    },
    async startTrackTimer({ commit, dispatch, getters }) {
      const group = getters.activeZoneGroup;
      if (!group) return;
      // Get an update on the position of this track before starting the time
      const response = await groupsAPI.getTrackPosition(group.id);
      const track = { ...group.track, position: response.data.position };
      commit('UPDATE_ZONE_GROUP', { groupId: group.id, update: { track } });

      // Start the track timer now that we have the current position
      const timer = setInterval(() => { dispatch('updateCurrentTrackPosition'); }, 1000);
      commit('SET_TRACK_TIMER', timer);
    },
    updateCurrentTrackPosition({ getters, commit }) {
      const group = getters.activeZoneGroup;
      if (group) {
        const newPosition = group.track.position + 1;
        const track = { ...group.track, position: newPosition };
        commit('UPDATE_ZONE_GROUP', { groupId: group.id, update: { track } });
      }
    },
    loadSettings({ commit }) {
      const settings = JSON.parse(localStorage.getItem('settings'));
      if (settings) {
        // Merge together
        commit('MERGE_SETTINGS', settings);
      }
    },
  },
});
