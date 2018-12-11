/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

import zonesAPI from '@/services/API/zones';

Vue.use(Vuex);


export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    isLoading: false,
    zoneGroups: [],
  },
  getters: {
    coordinatorZones: (state) => {
      const zones = [];
      state.zoneGroups.forEach((zoneGroup) => {
        const match = zoneGroup.members.filter(zone => zone.isCoordinator)[0];
        zones.push(match);
      });
      return zones;
    },
    memberZones: (state) => {
      const zones = [];
      state.zoneGroups.forEach((zoneGroup) => {
        const matches = zoneGroup.members.filter(zone => !zone.isCoordinator);
        matches.forEach((match) => {
          zones.push(match);
        });
      });
      return zones;
    },
  },
  mutations: {
    SET_IS_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_ZONES(state, zones) {
      state.zoneGroups = zones;
    },
  },
  actions: {
    async fetchZones(context) {
      try {
        context.commit('SET_IS_LOADING', true);
        const response = await zonesAPI.fetchZoneGroups();
        context.commit('SET_IS_LOADING', false);
        context.commit('SET_ZONES', response.data.zoneGroups);
      } catch (error) {
        console.log(error);
      }
    },
  },
});
