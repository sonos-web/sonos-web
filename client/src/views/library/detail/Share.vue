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
        <library-item v-for="item in folders" :key="item.uri"
        :item="item" :name="name" :isShare="isShare" toPrefix="/share"></library-item>
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
  name: 'Share',
  components: { LibraryItem, LoadLibraryOnScroll, PlayButtonMenu },
  data: () => ({
    items: {},
    loading: true,
    error: false,
    errorMessage: '',
    name: '',
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
    this.items = {};
    next();
  },
  methods: {
    getItems: libraryDetailAPI.get,
    loadedItems(data) {
      this.loading = false;
      this.items = deepmerge(this.items, data);
      this.name = this.$Base64.decode(this.pathMatch);
      if (!this.isShare) {
        this.$router.replace(`/album/${this.$Base64.encodeURI(this.folders[0].album)}`);
      }
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    isShare() {
      const song = this.folders.find(folder => folder.artist !== null && folder.album !== null);
      return !song;
    },
    folders() {
      return this.items.items || [];
    },
    allURI() {
      if (this.folders.length) {
        return this.folders[0].uri;
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
  word-break: break-word;
}
</style>
