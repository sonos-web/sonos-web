<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful title="Soundcloud - Sonos Web"></vue-headful>
      <v-layout wrap>
        <v-tabs
        class="library-tabs pb-3"
        centered
        show-arrows>
          <v-tab v-for="(tab, index) in tabs" :to="tab.link" :key="index">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-layout>
  </v-container>
</template>

<script>
import SoundcloudAPI from '@/services/API/services/soundcloud';

export default {
  name: 'Soundcloud',
  data: () => ({
    tabs: [
      { title: 'Stream', link: '/soundcloud/stream' },
      { title: 'Search', link: '/soundcloud/search' },
    ],
  }),
  methods: {
    async authorize() {
      const response = await SoundcloudAPI.getAuthURL();
      window.location = response.data.authURL;
    },
  },
};
</script>
