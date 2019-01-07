<template>
  <v-menu
    transition="slide-y-transition"
    class="d-block play-button"
    max-width="200"
    offset-y bottom>
    <v-btn class="play-button" :class="buttonClass"
    large slot="activator" color="primary darken-2 mb-3">
      Play
      <v-icon right>arrow_drop_down</v-icon>
    </v-btn>
    <v-list color="secondary">
      <v-list-tile @click="playNow(uriObject)">
        <v-list-tile-title>Play Now</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="playNext(uriObject)">
        <v-list-tile-title>Play Next</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="addToEndOfQueue(uriObject)">
        <v-list-tile-title>Add to End of Queue</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="replaceQueueAndPlay(uriObject)">
        <v-list-tile-title>Replace Queue</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import playQueueActions from '@/mixins/playQueueActions';

export default {
  name: 'PlayButtonMenu',
  mixins: [playQueueActions],
  props: {
    uri: {
      type: String,
      default: null,
    },
    uriData: {
      type: Object,
      default: null,
    },
    buttonClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    uriObject() {
      return this.uriData ? this.uriData : { uri: this.uri };
    },
  },
};

</script>
