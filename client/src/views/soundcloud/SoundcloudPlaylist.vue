<template>
  <v-container fluid pt-1 ma-0 :key="$route.params.pathMatch">
    <vue-headful :title="documentTitle"></vue-headful>
    <load-library-on-scroll
      :total="total"
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getItems"
      :libraryItem="album"
      :detailPath="path">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap class="album-wrapper" v-else>
      <v-flex xs12 lg5 px-2>
        <div class="album-header">
          <div class="v-responsive v-image album-image-container">
            <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
            <div v-lazy:background-image="albumArtURL" class="background-image"></div>
          </div>

          <div class="album-header__body">
            <div class="album-title display-1 pt-3">
              {{ albumName }}
            </div>
            <router-link
            @mouseover="tooltipOnOverFlow"
            :to="`/soundcloud/user/${artistLink}`"
            class="item-link text-truncate text-xs-center pt-1">
            {{ artistName }}
            </router-link>
            <div class="total-top mt-2 text-xs-center
              subtitle-1
 font-weight-bold d-block no-select">
              {{ album.total }}
              <span class="grey--text text-uppercase caption font-weight-bold">
                {{ songLabel }}
              </span>
            </div>
            <play-button-menu buttonClass="mt-3 mb-0" :uriData="uriData"></play-button-menu>
            <div class="total-bottom text-xs-center
              subtitle-1
 font-weight-bold d-block no-select" v-if="!isUser && !isRelated">
              {{ album.total }}
              <span class="grey--text text-uppercase caption font-weight-bold">
                {{ songLabel }}
              </span>
            </div>
          </div>
        </div>
      </v-flex>
      <v-flex xs12 lg7 px-2>
        <song-list :songs="songs" :doubleClickURIData="uriData"
          :albumMode="isAlbum"></song-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import deepmerge from 'deepmerge';

import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';
import SoundcloudAPI from '@/services/API/services/soundcloud';
import SongList from '@/views/soundcloud/SoundcloudSongList.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';
import PlayButtonMenu from '@/components/PlayButtonMenu.vue';

export default {
  name: 'SoundcloudPlaylist',
  components: {
    SongList, LoadLibraryOnScroll, PlayButtonMenu,
  },
  mixins: [tooltipOnOverflow],
  props: {
    isUser: {
      type: Boolean,
      default: false,
    },
    isRelated: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    album: {},
    loading: true,
    error: false,
    errorMessage: '',
    albumName: null,
    label: 'Songs',
    path: null,
    pathMatch: null,
    total: null,
  }),
  async created() {
    this.path = this.$route.path;
    this.pathMatch = this.$route.params.pathMatch;
  },
  async beforeRouteUpdate(to, from, next) {
    this.path = to.path;
    this.pathMatch = to.params.pathMatch;
    this.album = {};
    next();
  },
  methods: {
    updateAlbumDetails() {
      this.albumName = this.album.name;
    },
    getItems: SoundcloudAPI.get,
    loadedItems(data) {
      this.loading = false;
      this.album = deepmerge(this.album, data);
      this.updateAlbumDetails();
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    isAlbum() {
      return this.album.isAlbum;
    },
    songs() {
      return this.album.items || [];
    },
    albumArtURL() {
      return this.album.albumArtURI || '';
    },
    artistName() {
      return this.album.artist;
    },
    artistLink() {
      return this.album.artistId;
    },
    documentTitle() {
      if (this.albumName && this.artistName) {
        return `${this.albumName} · ${this.artistName} - Sonos Web`;
      } if (this.albumName) {
        return `${this.albumName} - Sonos Web`;
      }
      return 'Sonos Web';
    },
    songLabel() {
      if (this.songs.length === 1) {
        return this.label.slice(0, -1);
      }
      return this.label;
    },
    uriData() {
      return { uri: this.album.uri };
    },
  },
  watch: {
    $route(to) {
      this.path = to.path;
      this.pathMatch = to.params.pathMatch;
      this.album = {};
      this.updateAlbumDetails();
    },
  },
};
</script>
