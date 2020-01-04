<template>
  <v-menu
    transition="slide-y-transition"
    max-width="200"
    offset-y
    bottom>
    <template v-slot:activator="{ on }">
      <div :class="$style.playButtonContainer">
        <v-btn
          v-on="on"
          class="play-button"
          :class="buttonClass"
          large
          color="primary darken-2 mb-3">
          Play
          <v-icon right>arrow_drop_down</v-icon>
        </v-btn>
      </div>
    </template>
    <v-list color="secondary">
      <v-list-item @click="playNow(uriObject)">
        <v-list-item-title>Play Now</v-list-item-title>
      </v-list-item>
      <v-list-item @click="playNext(uriObject)">
        <v-list-item-title>Play Next</v-list-item-title>
      </v-list-item>
      <v-list-item @click="addToEndOfQueue(uriObject)">
        <v-list-item-title>Add to End of Queue</v-list-item-title>
      </v-list-item>
      <v-list-item @click="replaceQueueAndPlay(uriObject)">
        <v-list-item-title>Replace Queue</v-list-item-title>
      </v-list-item>
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

<style module lang="scss">
.playButtonContainer {
  display: block;
  text-align: center;

  button {
    width: 200px;
  }
}
</style>
