<template>
  <v-list class="song-list" two-line>
    <template v-for="(song, index) in songs">
      <song-item
      @hide-menu="showMenu = false"
      @show-menu="showSongMenu"
      :doubleClickURIData="doubleClickURIData"
      :song="song" :songNumber="index + 1" :key="`${song.uri}#${index}`"
      :albumMode="albumMode" :allAlbum="allAlbum"></song-item>
    </template>
    <v-menu
      max-width="180px"
      offset-y bottom
      offset-x
      v-model="showMenu"
      absolute
      :position-x="menuPosition.x"
      :position-y="menuPosition.y">
      <v-list color="secondary">
        <v-list-tile @click="playNow(selectedSongURI)">
          <v-list-tile-title>Play Now</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="playNext(selectedSongURI)">
          <v-list-tile-title>Play Next</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="addToEndOfQueue(selectedSongURI)">
          <v-list-tile-title>Add to End of Queue</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="replaceQueueAndPlay(selectedSongURI)">
          <v-list-tile-title>Replace Queue</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-list>
</template>


<script>
import SongItem from '@/components/SongItem.vue';
import playQueueActions from '@/mixins/playQueueActions';

export default {
  name: 'SongList',
  mixins: [playQueueActions],
  components: { SongItem },
  props: {
    songs: {
      type: Array,
      required: true,
    },
    albumMode: {
      type: Boolean,
      default: false,
    },
    allAlbum: {
      type: Boolean,
      default: false,
    },
    doubleClickURIData: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    showMenu: false,
    menuPosition: {
      x: 0,
      y: 0,
    },
    selectedSongURI: null,
  }),
  methods: {
    showSongMenu(event, uri) {
      this.showMenu = false;
      this.menuPosition.x = event.clientX;
      this.menuPosition.y = event.clientY;
      this.selectedSongURI = uri;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
  },
  computed: {
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
  },
};
</script>

<style>
.song-list {
  background: rgba(0,0,0,0)!important;
}
.song-list > * {
  user-select: none;
}
</style>
