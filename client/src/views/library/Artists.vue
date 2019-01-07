<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getAlbumArtists"
      :libraryItem="albumArtists">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="albumArtists.total" label="Artists"></library-item-count>
      <library-item v-for="item in items" :key="item.uri"
        :item="item" toPrefix="/artist"></library-item>
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
  name: 'Artists',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    albumArtists: {},
    loading: true,
  }),
  methods: {
    getAlbumArtists: MusicLibraryAPI.getAlbumArtists,
    loadedItems(data) {
      this.loading = false;
      this.albumArtists = deepmerge(this.albumArtists, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.albumArtists.items || [];
    },
  },
};
</script>
