<template>
  <v-app dark>
    <div class="app-background"></div>
    <v-content class="now-playing-bar-padding">
      <transition name="fade">
        <v-container fluid fill-height v-if="discoveringSonos">
          <v-layout align-center justify-center>
            <LoadingView></LoadingView>
          </v-layout>
        </v-container>
      </transition>
      <transition name="fade">
        <v-container fluid fill-height v-if="hasError && !discoveringSonos">
          <v-layout align-center justify-center>
            <ErrorView></ErrorView>
          </v-layout>
        </v-container>
      </transition>
      <transition name="fade">
        <div v-if="!discoveringSonos && !hasError" class="fill-height">
          <!-- eslint-disable-next-line -->
          <v-navigation-drawer width="230" fixed app clipped floating :permanent="true" :mini-variant.sync="$vuetify.breakpoint.mdAndDown">
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
          <v-container fill-height>
            <v-layout>
              <router-view/>
            </v-layout>
          </v-container>
          <NowPlayingBar></NowPlayingBar>
        </div>
      </transition>
    </v-content>
  </v-app>
</template>

<script>
import NowPlayingBar from '@/components/NowPlayingBar.vue';

export default {
  components: { NowPlayingBar },
  name: 'App',
  data: () => ({
    items: [
      { icon: 'search', text: 'Search', path: '/search' },
      { icon: 'music_note', text: 'Now Playing', path: '/' },
      { icon: 'speaker_group', text: 'Rooms', path: '/rooms' },
      { icon: 'library_music', text: 'Music Library', path: '/library' },
    ],
  }),
  computed: {
    discoveringSonos() {
      return this.$store.state.discoveringSonos;
    },
    hasError() {
      return this.$store.state.hasError;
    },
  },
};
</script>

<style>
.theme--dark.v-list {
  background: #282828;
}
.now-playing-bar-padding {
  padding-bottom: 90px!important;
}
.app-background {
  background-size: cover;
  background-repeat: no-repeat;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
  opacity: 1;
  transition: opacity .25s;
  background-image: linear-gradient(to top, #141e30, #243b55);
}
.fade-enter-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
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

/** Set a default image for album art until it loads **/
.album-art-image .v-image__image {
  z-index: unset;
}
.album-art-image .v-image__image:before, .v-image .background-image:before {
    content: ' ';
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-image: url('/img/empty-album-art.b8a07499.png');
}
.album-art-image .v-image__image--preload {
  -webkit-filter: none;
  filter: none;
}

.album-collage .column {
  float: left;
  width: 50%;
  padding: 0px;
}
.album-collage {
  max-width: 380px;
  margin: 0 auto;
  -webkit-box-shadow: 0 0 10px rgba(0,0,0,.3);
  box-shadow: 0 0 10px rgba(0,0,0,.3);
  user-select: none;
}
.album-collage:after {
  content: "";
  display: table;
  clear: both;
}

.item-link, .item-link-separator {
  text-decoration: none;
  font-weight: bold;
  display: block;
  color: white;
  opacity: 0.6;
}
.item-link-separator {
  padding: 0px 8px;
}
.item-link:hover {
  text-decoration: underline;
  opacity: 1.0;
}
.item-link.album, .item-link.artist {
  font-weight: 500;
}
.play-button {
  letter-spacing: 0.1em;
  max-width: 200px;
  margin: 0 auto;
}

.play-button .v-btn {
  width: 100%;
  margin: 0px;
  letter-spacing: 0.1em;
}
.play-button .v-btn .v-icon--right {
  margin: 0px;
}
.no-select {
  user-select: none;
}
.background-image {
  -webkit-transition: all .3s ease-in-out;
  transition: all .3s ease-in-out;
  background-size: contain;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (min-width: 960px) {
  .container {
    max-width: 950px;
  }
}
@media (min-width: 1264px) {
  .container {
    max-width: 1255px;
  }
}
@media (min-width: 1904px) {
  .container {
    max-width: 1855px;
  }
}

html {
  overflow-y: auto;
}

</style>
