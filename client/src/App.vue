<template>
  <v-app dark>
    <v-content>
      <transition name="fade">
        <v-container fluid fill-height v-if="discoveringSonos">
          <v-layout align-center justify-center>
            <LoadingView></LoadingView>
          </v-layout>
        </v-container>
      </transition>
      <transition name="fade">
        <div v-if="!discoveringSonos">
          <!-- eslint-disable-next-line -->
          <v-navigation-drawer fixed app clipped floating :permanent="true" :mini-variant.sync="miniNav">
            <v-list class="nav-link-list">
              <template v-for="item in items">
                <v-list-tile :key="item.text" :to="{path: item.path}">
                  <v-list-tile-action>
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{ item.text }}
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </v-navigation-drawer>
          <v-container fluid fill-height>
            <v-layout>
              <router-view/>
            </v-layout>
          </v-container>
          <!-- eslint-disable-next-line -->
          <v-toolbar fixed clipped-left flat color="secondary" class="now-playing-bar" height="90px">
          </v-toolbar>
        </div>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    miniNav: false,
    windowWidth: 0,
    items: [
      { icon: 'search', text: 'Search', path: '/search' },
      { icon: 'music_note', text: 'Now Playing', path: '/' },
      { icon: 'speaker_group', text: 'Rooms', path: '/rooms' },
      { icon: 'library_music', text: 'Music Library', path: '/library' },
    ],
  }),
  mounted() {
    // Update on initial load
    this.windowSizeChanged();

    this.$nextTick(() => {
      window.addEventListener('resize', this.windowSizeChanged);
    });
  },
  methods: {
    windowSizeChanged() {
      this.windowWidth = window.innerWidth;
    },
  },
  computed: {
    discoveringSonos() {
      return this.$store.state.discoveringSonos;
    },
  },
  watch: {
    windowWidth(newWidth) {
      this.miniNav = newWidth < 1264;
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.windowSizeChanged);
  },
};
</script>

<style>

.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.theme--dark.application {
  background: #141e30; /* fallback for old browsers */
  background: -webkit-linear-gradient(to top, #141e30, #243b55);
  background: linear-gradient(to top, #141e30, #243b55);
}
.v-toolbar--fixed.now-playing-bar {
  top: auto;
  bottom: 0;
}
.v-navigation-drawer .v-list {
  background: transparent;
}
.theme--dark.v-navigation-drawer {
  background-color: rgba(14,21,33,0.8);
}
.nav-link-list .v-list__tile--active:after {
    content: "";
    display: block;
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: 4px;
    left: 0px;
    background-color: #3898d6;
}
</style>
