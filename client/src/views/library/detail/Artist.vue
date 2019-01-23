<template>
  <v-container fluid pt-1 ma-0 :key="$route.params.pathMatch">
    <vue-headful :title="`${name} - Sonos Web`"></vue-headful>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getItems"
      :libraryItem="items"
      :detailPath="path">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <div class="artist-title display-3 pb-3">
        {{ name }}
      </div>
      <v-flex xs12>
        <play-button-menu :uri="allURI"></play-button-menu>
      </v-flex>
      <v-layout row wrap v-if="!loading">
        <library-item v-for="item in albums" :showSubtitle="allArtist" :key="item.uri"
        :item="item" :name="name" allPrefix="/artist" toPrefix="/album"></library-item>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import deepmerge from 'deepmerge';

import libraryDetailAPI from '@/services/API/libraryDetail';
import LibraryItem from '@/components/LibraryItem.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';
import PlayButtonMenu from '@/components/PlayButtonMenu.vue';

export default {
  name: 'Artist',
  components: { LibraryItem, LoadLibraryOnScroll, PlayButtonMenu },
  data: () => ({
    items: {},
    loading: true,
    error: false,
    errorMessage: '',
    name: '',
    path: null,
    pathMatch: null,
    allArtist: false,
  }),
  async created() {
    this.path = this.$route.path;
    this.pathMatch = this.$route.params.pathMatch;
  },
  async beforeRouteUpdate(to, from, next) {
    this.path = to.path;
    this.pathMatch = to.params.pathMatch;
    this.items = {};
    next();
  },
  methods: {
    getItems: libraryDetailAPI.get,
    loadedItems(data) {
      this.loading = false;
      this.items = deepmerge(this.items, data);
      if (this.pathMatch.indexOf('all/') !== -1) {
        this.name = this.$Base64.decode(this.pathMatch.replace('all/', ''));
        this.allArtist = true;
      } else {
        this.name = this.$Base64.decode(this.pathMatch);
        this.allArtist = false;
      }
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    albums() {
      // Filter out the all Album if there is only one other album
      let albums;
      if (this.items.items && this.items.items.length === 2) {
        albums = this.items.items.filter(album => album.title !== 'All' && album.uri.slice(-1) !== '/');
      } else {
        albums = this.items.items;
      }
      return albums || [];
    },
    allURI() {
      if (this.items.items) {
        const allItem = this.items.items.find(item => item.title === 'All');
        if (allItem) return allItem.uri;
        return '';
      }
      return '';
    },
  },
};
</script>


<style>
.artist-title {
  font-weight: 900;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}
</style>
