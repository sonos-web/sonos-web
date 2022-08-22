<template>
  <v-navigation-drawer
    width="200px"
    app
    right
    floating
    permanent
    class="now-playing-panel"
  >
    <v-container fill-height fluid pa-0>
      <v-layout align-center justify-space-between>
        <v-card text tile height="100%" class="flex-grow-1">
          <v-list-item>
            <v-list-item-subtitle class="text-center">
              {{ groupName(activeZoneGroupId) }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-avatar tile size="150px" class="mx-auto">
              <div class="v-responsive v-image">
                <div
                  v-lazy:background-image="albumArtURL"
                  class="background-image"
                  :key="albumArtURL"
                ></div>
              </div>
            </v-list-item-avatar>
          </v-list-item>

          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title
                @mouseover="tooltipOnOverFlow"
                :to="`/album/${encodedAlbum}`"
                class="text-truncate pa-0"
              >
                {{ track }}
              </v-list-item-title>
              <v-list-item-subtitle
                v-if="artist"
                @mouseover="tooltipOnOverFlow"
                :to="`/artist/${encodedArtist}`"
                class="text-truncate pa-0"
              >
                {{ artist }}
              </v-list-item-subtitle>
              <v-list-item-subtitle
                v-if="album"
                @mouseover="tooltipOnOverFlow"
                :to="`/artist/${encodedAlbum}`"
                class="text-truncate pa-0"
              >
                {{ album }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="d-flex">
              <v-btn
                :disabled="!previousEnabled"
                icon
                @click="previous"
                class="flex-grow-1"
              >
                <v-icon large>skip_previous</v-icon>
              </v-btn>

              <v-btn
                :disabled="!playStateEnabled"
                icon
                @click="playOrPause"
                class="flex-grow-1"
              >
                <v-icon x-large>{{ playStateIcon }}</v-icon>
              </v-btn>

              <v-btn
                :disabled="!nextEnabled"
                icon
                @click="next"
                class="flex-grow-1"
              >
                <v-icon large>skip_next</v-icon>
              </v-btn>
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-slider
              hide-details
              color="#b3b3b3"
              step="0"
              track-color="dark-grey"
              v-model="trackPosition"
              :readonly="!canSeek"
            >
              <div
                class="caption grey--text text--lighten-1 progress-time"
                slot="prepend"
              >
                {{ trackElapsedTime }}
              </div>
              <div
                class="caption grey--text text--lighten-1 progress-time"
                slot="append"
              >
                {{ trackDuration }}
              </div>
            </v-slider>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="d-flex">
              <v-btn
                class="play-mode-button flex-grow-1"
                :class="shuffleActive ? 'active' : ''"
                icon
                :disabled="!canSeek"
                @click="toggleShuffle"
              >
                <v-icon medium>shuffle</v-icon>
              </v-btn>

              <v-btn
                class="play-mode-button flex-grow-1"
                :class="repeatActive ? 'active' : ''"
                :disabled="!canSeek"
                icon
                @click="toggleRepeat"
              >
                <v-icon medium>{{ repeatIcon }}</v-icon>
              </v-btn>

              <v-btn
                class="queue-button flex-grow-1"
                :class="$route.name === 'PlayQueue' ? 'v-btn--active' : ''"
                title="Queue"
                icon
                @click="handleQueueButtonClick"
              >
                <v-icon medium>queue_music</v-icon>
              </v-btn>
            </v-list-item-title>
          </v-list-item>

          <v-list-item class="now-playing-panel-volume">
            <v-menu
              offset-y
              top
              :open-on-click="hasMembers"
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on }">
                <v-slider
                  thumb-label
                  v-on="on"
                  hide-details
                  color="#b3b3b3"
                  track-color="dark-grey"
                  :prepend-icon="volumeIcon"
                  @click:prepend="toggleMute"
                  v-model="volume"
                >
                </v-slider>
              </template>

              <v-card color="secondary pa-2">
                <member-volume-bar
                  v-for="member in activeZoneGroupMembers"
                  :key="member.id"
                  :zoneMember="member"
                >
                </member-volume-bar>
              </v-card>
            </v-menu>
          </v-list-item>
        </v-card>
      </v-layout>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
import MemberVolumeBar from '@/components/MemberVolumeBar.vue';
import NowPlayingMixin from '@/mixins/NowPlayingMixin';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'NowPlayingPanel',
  components: { MemberVolumeBar },
  mixins: [tooltipOnOverflow, NowPlayingMixin],
};
</script>

<style>
@media (min-width: 801px) {
  .now-playing-panel {
    display: none;
  }
}

@media (max-width: 800px) and (orientation: portrait) {
  .now-playing-panel {
    display: none;
  }
}

.now-playing-panel-volume {
  width: 100%;
  position: fixed;
  bottom: 0;
}
</style>
