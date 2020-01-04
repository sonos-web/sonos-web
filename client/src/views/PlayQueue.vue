<template>
  <v-container fluid pa-0 ma-0>
    <vue-headful :title="documentTitle"></vue-headful>
    <v-container fluid :fill-height="isQueueEmpty" px-0 mx-0>
      <div class="text-xs-center">
        <v-snackbar
          :color="saveQueueNotificationColor"
          top
          absolute
          v-model="showSaveQueueNotification">
          {{ saveQueueResultText }}
        </v-snackbar>
        <v-snackbar
          top
          absolute
          :timeout="settings.notifications.dragAndDropTracksInQueue.timeout"
          v-model="showDragAndDropInfo">
            {{ settings.notifications.dragAndDropTracksInQueue.text }}
          <v-btn color="primary" text @click="disableDragAndDropNotification">
            Got It
          </v-btn>
        </v-snackbar>
      </div>
      <v-layout row wrap>
        <v-flex xs12 ref="queueHeader" class="sticky" :class="stickyClass">
          <room-dropdown-menu hideIcon
            buttonClasses="display-1 font-weight-bold text-capitalize ma-0 px-2">
          </room-dropdown-menu>
          <div class="subtitle-1 grey--text text--lighten-1 pl-3 font-weight-bold pb-2">
            Queue
            <span class="caption grey--text text--darken-1 font-weight-bold">
              {{ queueInfoText }}
            </span>
          </div>
          <v-btn
            color="secondary"
            :class="$style.queueButtons"
            rounded
            depressed
            @click="clearQueue"
            :disabled="isQueueEmpty">
            Clear Queue
          </v-btn>
          <v-dialog max-width="350px" v-model="queueDialog" :disabled="isQueueEmpty">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                color="secondary"
                :class="$style.queueButtons"
                rounded depressed
                :disabled="isQueueEmpty">
                Save Queue
              </v-btn>
            </template>
              <v-card>
                <v-card-title class="pb-0">
                  <span class="headline font-weight-medium">Save Queue</span>
                </v-card-title>
                <v-card-text class="pt-1">
                  <div class="body-2 pb-2 grey--text text--lighten-2">
                    The Queue will be saved as a Sonos Playlist
                  </div>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-form ref="queueForm" lazy-validation @submit.prevent>
                        <v-text-field
                          v-model="playlistName"
                          autofocus
                          browser-autocomplete="off"
                          label="Name"
                          ref="playlistName"
                          required
                          :rules="[v => !!v || 'Enter a playlist name']">
                        </v-text-field>
                      </v-form>
                    </v-flex>
                  </v-layout>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="closeSaveQueueDialog">Cancel</v-btn>
                  <v-btn color="primary" text @click="saveQueue">Save</v-btn>
                </v-card-actions>
              </v-card>
          </v-dialog>
        </v-flex>
        <v-flex xs12 class="queue-items-section">
          <v-layout fill-height align-center justify-center v-if="isQueueEmpty">
            <div class="subtitle-1
 grey--text font-weight-medium">
              Songs you choose to play will appear here
            </div>
          </v-layout>
          <v-layout column wrap v-else>
            <queue-list :items="currentQueue"></queue-list>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
import TransportActions from '@/enums/TransportActions';
import groupsAPI from '@/services/API/groups';
import RoomDropdownMenu from '@/components/RoomDropdownMenu.vue';
import QueueList from '@/components/QueueList.vue';
import tooltipOnOverflow from '@/mixins/tooltipOnOverflow';

export default {
  name: 'PlayQueue',
  components: { RoomDropdownMenu, QueueList },
  mixins: [tooltipOnOverflow],
  data: () => ({
    queueDialog: false,
    showSaveQueueNotification: false,
    saveQueueNotificationColor: 'success darken-1',
    saveQueueResultText: null,
    playlistName: null,
    showDragAndDropInfo: false,
  }),
  created() {
    if (this.settings.notifications.dragAndDropTracksInQueue.show) {
      setTimeout(() => {
        this.showDragAndDropInfo = true;
      }, 2000);
    }
  },
  methods: {
    clearQueue() {
      groupsAPI.clearQueue(this.activeZoneGroupId);
    },
    async saveQueue() {
      if (this.$refs.queueForm.validate()) {
        const newPlaylist = this.playlistName;
        this.closeSaveQueueDialog();
        try {
          await groupsAPI.saveQueue(this.activeZoneGroupId, newPlaylist);
          this.saveQueueResultText = `Queue successfully saved as '${newPlaylist}'`;
          this.saveQueueNotificationColor = 'success darken-1';
          this.showSaveQueueNotification = true;
        } catch (error) {
          this.saveQueueResultText = `Error: new playlist '${newPlaylist}' could not be saved`;
          this.saveQueueNotificationColor = 'error darken-2';
          this.showSaveQueueNotification = true;
        }
      }
    },
    closeSaveQueueDialog() {
      this.playlistName = null;
      this.queueDialog = false;
      this.$refs.queueForm.reset();
    },
    disableDragAndDropNotification() {
      this.showDragAndDropInfo = false;
      this.$store.commit('UPDATE_SETTINGS', { property: 'notifications.dragAndDropTracksInQueue.show', value: false });
    },
  },
  computed: {
    documentTitle() {
      return `Play Queue · ${this.activeZoneGroupName} - Sonos Web`;
    },
    activeZoneGroupId() {
      return this.$store.state.activeZoneGroupId;
    },
    activeZoneGroup() {
      return this.$store.getters.activeZoneGroup;
    },
    activeZoneGroupName() {
      return this.$store.getters.groupName(this.activeZoneGroupId);
    },
    canSeek() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.actions.some(action => action === TransportActions.seek);
      }
      return false;
    },
    currentQueue() {
      if (this.activeZoneGroup) {
        return this.activeZoneGroup.queue || [];
      }
      return [];
    },
    settings() {
      return this.$store.state.settings;
    },
    isQueueEmpty() {
      return this.currentQueue.length === 0;
    },
    queueInfoText() {
      if (this.isQueueEmpty) {
        return '(Not in Use)';
      }
      const numSongs = `${this.activeZoneGroup.queue.length} songs`;
      return this.canSeek ? numSongs : `(Not in Use) ${numSongs}`;
    },
    stickyClass() {
      switch (this.$vuetify.breakpoint.name) {
        case 'md':
          return 'md';
        case 'sm':
        case 'xs':
          return 'sm';
        default:
          return '';
      }
    },
  },
};
</script>

<style>
.float-right {
  float: right;
}
.sticky {
  position: fixed;
  top: 0;
  left: 230px;
  width: calc(100% - 230px);
  z-index: 1;
  padding: 48px 48px 8px 48px;
  background-image: linear-gradient(to top, #21344c, #243b55);
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),
  0px 1px 1px 0px rgba(0,0,0,0.14),
  0px 1px 3px 0px rgba(0,0,0,0.12);
}
.sticky.md {
  left: 80px;
  width: calc(100% - 80px);
}
.sticky.sm {
  left: 80px;
  width: calc(100% - 80px);
  padding: 32px 32px 8px 32px;
}

.queue-items-section {
  padding-top: 156px;
}
</style>

<style module>
.queueButtons {
  text-transform: capitalize;
  margin-left: 5px;
  letter-spacing: unset;
  margin: 4px 8px;
}
</style>
