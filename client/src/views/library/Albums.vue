<template>
  <v-layout>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getAlbums"
      :libraryItem="albums">
    </load-library-on-scroll>
    <v-layout row wrap v-if="!loading">
      <library-item-count :total="albums.total" label="Albums"></library-item-count>
      <library-item v-for="item in items" :key="item.uri"
        :item="item" toPrefix="/album"></library-item>
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
  name: 'Albums',
  components: { LibraryItem, LibraryItemCount, LoadLibraryOnScroll },
  data: () => ({
    albums: {},
    loading: true,
  }),
  methods: {
    getAlbums: MusicLibraryAPI.getAlbums,
    loadedItems(data) {
      this.loading = false;
      this.albums = deepmerge(this.albums, data);
    },
    loadingError(error) {
      this.loading = false;
      console.log(error);
    },
  },
  computed: {
    items() {
      return this.albums.items || [];
    },
  },
};
</script>
