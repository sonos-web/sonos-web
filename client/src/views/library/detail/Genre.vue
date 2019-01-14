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
      <v-layout row wrap>
        <library-item v-for="item in artists" :key="item.uri"
        :item="item" :name="name" :allPrefix="allPrefix" toPrefix="/artist"></library-item>
      </v-layout>
      <LoadingView v-if="loading" absolute message="Loading..."></LoadingView>
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
  name: 'Genre',
  components: { LibraryItem, LoadLibraryOnScroll, PlayButtonMenu },
  data: () => ({
    items: {},
    loading: true,
    error: false,
    errorMessage: '',
    name: '',
    path: null,
    pathMatch: null,
    allGenre: false,
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
        this.allGenre = true;
      } else {
        this.name = this.$Base64.decode(this.pathMatch);
        this.allGenre = false;
      }
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    artists() {
      return this.items.items || [];
    },
    allPrefix() {
      return this.path.indexOf('genre/all') ? '/genre/songs' : '/genre';
    },
    allURI() {
      if (this.items.items) {
        const allItem = this.items.items.find(item => item.title === 'All');
        return allItem.uri;
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
