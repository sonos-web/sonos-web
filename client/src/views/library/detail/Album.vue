<template>
  <v-container fluid pt-1 ma-0 :key="$route.params.pathMatch">
    <vue-headful :title="documentTitle"></vue-headful>
    <load-library-on-scroll
      @loading-error="loadingError"
      @loaded-items="loadedItems"
      :asyncLoadMethod="getItems"
      :libraryItem="items"
      :detailPath="path">
    </load-library-on-scroll>
    <ErrorView v-if="error" absolute :message="errorMessage"></ErrorView>
    <LoadingView v-else-if="loading" absolute message="Loading..."></LoadingView>
    <v-layout row wrap class="album-wrapper" v-else>
      <v-flex xs12 lg5 px-2>
        <div class="album-header">
          <div class="v-responsive v-image album-image-container" v-if="!albumCollageImages.length">
            <div class="v-responsive__sizer" style="padding-bottom: 100%;"></div>
            <div v-lazy:background-image="albumArtURL" class="background-image"></div>
          </div>
          <album-collage v-else :images="albumCollageImages"></album-collage>
          <div class="album-header__body">
            <div class="album-title display-1 pt-3">
              {{ albumName }}
            </div>
            <router-link
            @mouseover="tooltipOnOverFlow"
            :to="`/artist/${encodedArtist}`"
            class="item-link text-truncate text-xs-center pt-1">
            {{ artistName }}
            </router-link>
            <div class="total-top mt-2 text-xs-center
              subheading font-weight-bold d-block no-select">
              {{ items.total }}
              <span class="grey--text text-uppercase caption font-weight-bold">
                {{ songLabel }}
              </span>
            </div>
            <play-button-menu buttonClass="mt-3 mb-0" :uriData="uriData"></play-button-menu>
            <div class="total-bottom text-xs-center
              subheading font-weight-bold d-block no-select">
              {{ items.total }}
              <span class="grey--text text-uppercase caption font-weight-bold">
                {{ songLabel }}
              </span>
            </div>
          </div>
        </div>
      </v-flex>
      <v-flex xs12 lg7 px-2>
        <song-list :songs="songs" :doubleClickURIData="uriData"
          :albumMode="!isPlaylist" :allAlbum="allAlbum"></song-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import deepmerge from 'deepmerge';

import libraryDetailAPI from '@/services/API/libraryDetail';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';
import SongList from '@/components/SongList.vue';
import LoadLibraryOnScroll from '@/components/LoadLibraryOnScroll.vue';
import PlayButtonMenu from '@/components/PlayButtonMenu.vue';
import AlbumCollage from '@/components/AlbumCollage.vue';

export default {
  name: 'Album',
  components: {
    SongList, LoadLibraryOnScroll, PlayButtonMenu, AlbumCollage,
  },
  mixins: [tooltipOnOverflow],
  props: {
    isNormalPlaylist: {
      type: Boolean,
      default: false,
    },
    isSonosPlaylist: {
      type: Boolean,
      default: false,
    },
    isGenrePlaylist: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    items: {},
    loading: true,
    error: false,
    errorMessage: '',
    albumName: null,
    label: 'Songs',
    allAlbum: false,
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
    updateAlbumDetails() {
      this.allAlbum = this.path.indexOf('artist/all/') !== -1;
      this.albumName = this.$Base64.decode(this.pathMatch);
    },
    getItems: libraryDetailAPI.get,
    loadedItems(data) {
      this.loading = false;
      this.items = deepmerge(this.items, data);
      this.updateAlbumDetails();
    },
    loadingError(error) {
      this.loading = false;
      this.error = true;
      this.errorMessage = `${error.response.status}: ${error.response.data}`;
    },
  },
  computed: {
    songs() {
      return this.items.items || [];
    },
    albumArtURL() {
      if (this.songs.length) {
        return this.songs[0].albumArtURI || '';
      }
      return '';
    },
    artistName() {
      if (this.songs.length && !this.allAlbum && !this.isPlaylist) {
        return this.songs[0].artist;
      }
      return null;
    },
    encodedArtist() {
      if (this.artistName) {
        return this.$Base64.encodeURI(this.artistName);
      }
      return '';
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
    isPlaylist() {
      return this.isNormalPlaylist || this.isGenrePlaylist;
    },
    albumCollageImages() {
      if (this.allAlbum || this.isPlaylist) {
        // Get a list of 4 unique albums
        const uniqueAlbums = [...new Set(this.songs.map(song => song.album))].slice(0, 4);
        if (uniqueAlbums.length === 4) {
          // return 4 unique album art image links
          return uniqueAlbums.map((album) => {
            const song = this.songs.find(item => item.album === album);
            return song.albumArtURI;
          });
        }
        return [];
      }
      return [];
    },
    uriData() {
      if (this.allAlbum) {
        return { artistPath: `${this.albumName}/` };
      }
      if (this.isNormalPlaylist) {
        return { playlistName: this.albumName };
      }
      if (this.isSonosPlaylist) {
        return { sonosPlaylistName: this.albumName };
      }
      if (this.isGenrePlaylist) {
        return { genrePath: `${this.albumName}//` };
      }
      return { artistPath: `${this.artistName}/${this.albumName}` };
    },
  },
  watch: {
    $route(to) {
      this.path = to.path;
      this.pathMatch = to.params.pathMatch;
      this.items = {};
      this.updateAlbumDetails();
    },
  },
};
</script>
