<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="loadMethod"
      :libraryItem="sonosFavorites">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout wrap v-else>
      <library-item-count :total="sonosFavorites.total"
        label="Favorites"></library-item-count>
      <v-flex xs12>
        <song-list :songs="items"></song-list>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import MusicLibraryAPI from '@/services/API/musicLibrary';
import SongList from '@/components/SongList.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'SonosFavorites',
  components: { SongList, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    sonosFavorites: {},
    loading: true,
    error: false,
    errorMessage: null,
  }),
  methods: {
    loadMethod: MusicLibraryAPI.getSonosFavorites,
    loadedItems(data) {
      this.loading = false;
      this.sonosFavorites = deepmerge(this.sonosFavorites, data);
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    items() {
      return this.sonosFavorites.items || [];
    },
  },
};
</script>
