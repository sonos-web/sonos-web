<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getGenres"
      :libraryItem="genres">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="genres.total" label="Genres"></library-item-count>
      <library-item v-for="item in items"
      :key="item.uri" :item="item" toPrefix="/genre"></library-item>
    </v-layout>
    <LoadingView v-if="loading" absolute message="Loading..."></LoadingView>
  </v-layout>
</template>

<script>
import deepmerge from 'deepmerge';
import MusicLibraryAPI from '@/services/API/musicLibrary';
import LibraryItem from '@/components/LibraryItem.vue';
import LibraryItemCount from '@/components/LibraryItemCount.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';

export default {
  name: 'Genres',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    genres: {},
    loading: true,
  }),
  methods: {
    getGenres: MusicLibraryAPI.getGenres,
    loadedItems(data) {
      this.loading = false;
      this.genres = deepmerge(this.genres, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.genres.items || [];
    },
  },
};
</script>
