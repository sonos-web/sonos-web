<template>
  <v-app>
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
          <v-app-bar
            v-show="$vuetify.breakpoint.smAndDown"
            dark
            flat
          >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          </v-app-bar>
          <!-- eslint-disable-next-line -->
          <v-navigation-drawer
            width="230"
            fixed
            app
            clipped
            floating
            class="app-drawer"
            v-model="drawer"
            :permanent="$vuetify.breakpoint.mdAndUp">
            <v-list class="nav-link-list">
              <template v-for="item in items">
                <v-list-group
                  v-if="item.children"
                  :key="item.text"
                  v-model="item.model"
                  :prepend-icon="item.model ? item.icon : item['icon-alt']"
                  append-icon=""
                >
                  <v-list-item slot="activator">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.text }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.text"
                    :to="{path: child.path}"
                  >
                    <v-list-item-action v-if="child.icon">
                      <v-icon>{{ child.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ child.text }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>
                <v-list-item v-else :key="item.text" :to="{path: item.path}">
                  <v-list-item-action>
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.text }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
            <div class="version-text subtitle pa-3 grey--text text--darken-2">
              {{ APP_VERSION }}
            </div>
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
import { version } from '../package.json';

export default {
  components: { NowPlayingBar },
  name: 'App',
  data: () => ({
    drawer: false,
    items: [
      { icon: 'search', text: 'Search', path: '/search' },
      { icon: 'music_note', text: 'Now Playing', path: '/' },
      { icon: 'speaker_group', text: 'Rooms', path: '/rooms' },
      { icon: 'library_music', text: 'Music Library', path: '/library' },
      { icon: 'star', text: 'My Sonos', path: '/sonos' },
      { icon: 'contactless', text: 'Spotify', path: '/spotify' },
      { icon: 'cloud', text: 'Soundcloud', path: '/soundcloud' },
    ],
    APP_VERSION: `v${version}`,

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
.text-xs-center {
  text-align: center!important;
}
.app-drawer .v-list-item--active::before {
  opacity: 0;
}
.app-drawer .v-list .v-list-item--active {
  color:#3898da;
}
.app-drawer .v-list .v-list-item__title {
  font-weight: 500;
  font-size: 14px;
}
.version-text {
  position: absolute;
  bottom: 90px;
  left: 0px;
  font-size: 14px;
}
.theme--dark.v-list {
  background: #282828;
}
.now-playing-bar-padding {
  padding-bottom: 90px!important;
}
@media (max-width: 960px) {
  .now-playing-bar-padding {
    padding-bottom: 150px !important;
  }
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
.nav-link-list .v-list-item--active:after {
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
  position: relative;
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
.v-responsive.v-image {
  position: relative;
  z-index: 0
}

.item-link, .item-link-separator {
  text-decoration: none;
  font-weight: bold!important;
  display: block;
  color: white!important;
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
  font-size: 14px;
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
  background-position: center center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.library-tabs {
  width: 100%;
}
.library-tabs .v-tabs-bar.theme--dark {
  background-color: unset!important;
}
.library-tabs .v-tab {
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 0.1em;
}
.library-tabs .v-tab {
  position: relative;
  padding: 0px 8px;
}

.library-tabs .v-tab.v-tab--active {
  color: white;
}
.theme--dark.v-tabs .v-tab:hover::before {
  opacity: 0;
}

/**** Artist *****/
.artist-title {
  font-weight: 900;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

/***** Album *****/
.album-wrapper .background-image {
  display: block;
  width: 100%;
  -webkit-box-shadow: 0 0 10px rgba(0,0,0,.3);
  box-shadow: 0 0 10px rgba(0,0,0,.3);
  user-select: none;
}
.album-wrapper .album-image-container {
  max-width: 380px;
  margin: 0 auto;
}
.album-wrapper .album-title {
  font-weight: 900;
  text-align: center;
  word-break: break-word;
  font-size: 28px!important;
  line-height: 36px!important;
}
.album-wrapper .album-artist-title {
  text-align: center;
  font-weight: bold;
  opacity: 0.6;
}
.album-wrapper .album-header__body .total-top {
    display: none!important;
  }

@media (max-width: 1264px) {
  .album-header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    margin: 0 0 20px;
    max-width: 100%;
    padding-bottom: 20px;
    border-bottom: 1px solid hsla(0,0%,100%,.1);
  }
  .album-header__body {
    width: 75%;
    margin: 0 40px;
  }
  .album-wrapper .album-header__body > * {
    text-align: left!important;
    padding: 0px!important;
  }
  .album-wrapper .album-header__body > .play-button {
    margin: 50px 0px 0px 0px;
  }
  .album-wrapper .album-title {
    word-break:normal;
  }
  .album-wrapper .album-image-container {
    min-width: 210px;
    width: 25%;
  }
  .album-wrapper .album-header__body .total-top {
    display: block!important;
  }
  .album-wrapper .album-header__body .total-bottom {
    display: none!important;
  }
}
/*********/

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
