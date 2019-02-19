<template>
  <v-container fluid pt-1 ma-0 :key="$route.params.pathMatch">
    <vue-headful :title="`${artist.name || ''} - Sonos Web`"></vue-headful>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getItems"
      :libraryItem="artist"
      :detailPath="path">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <div class="artist-title display-3 pb-3">
        {{ artist.name }}
      </div>
      <v-flex xs12>
        <play-button-menu :uri="artist.uri"></play-button-menu>
      </v-flex>
      <v-layout row wrap v-if="!loading">
        <library-item v-for="(item, index) in artist.items" :key="`${item.uri}#${index}`"
        :item="item" :name="artist.name" toPrefix="/spotify/album"
        :isSpotify="true" ></library-item>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import deepmerge from 'deepmerge';

import spotifyAuth from '@/mixins/spotifyAuth';
import spotifyAPI from '@/services/API/services/spotify';
import LibraryItem from '@/components/LibraryItem.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';
import PlayButtonMenu from '@/components/PlayButtonMenu.vue';

export default {
  name: 'Artist',
  mixins: [spotifyAuth],
  components: { LibraryItem, LoadLibraryOnScroll, PlayButtonMenu },
  data: () => ({
    artist: {},
    loading: true,
    error: false,
    errorMessage: '',
    path: null,
    pathMatch: null,
  }),
  async created() {
    this.path = this.$route.path;
    this.pathMatch = this.$route.params.pathMatch;
  },
  async beforeRouteUpdate(to, from, next) {
    this.path = to.path;
    this.pathMatch = to.params.pathMatch;
    this.artist = {};
    next();
  },
  methods: {
    getItems: spotifyAPI.get,
    loadedItems(data) {
      this.loading = false;
      this.artist = deepmerge(this.artist, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
};
</script>
