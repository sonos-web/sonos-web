<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :libraryItem="sonosPlaylists"
      :searchTerm="searchTerm">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap v-else>
      <library-item-count :total="sonosPlaylists.total"
        label="Sonos Playlists"></library-item-count>
      <library-item v-for="item in items" :key="item.uri"
        :item="item" toPrefix="/sonos-playlist"></library-item>
    </v-layout>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import MusicLibraryAPI from '@/services/API/musicLibrary';
import LibraryItem from '@/components/LibraryItem.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'SonosPlaylists',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  props: {
    search: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    sonosPlaylists: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  methods: {
    loadedItems(data) {
      this.loading = false;
      this.sonosPlaylists = deepmerge(this.sonosPlaylists, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    items() {
      return this.sonosPlaylists.items || [];
    },
    searchTerm() {
      if (this.search) {
        return this.$route.params.pathMatch;
      }
      return null;
    },
    loadMethod() {
      return this.search ? MusicLibraryAPI.searchSonosPlaylists : MusicLibraryAPI.getSonosPlaylists;
    },
  },
};
</script>
