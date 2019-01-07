import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.

const Search = () => import(/* webpackChunkName: "Search" */ './views/Search.vue');
const NowPlaying = () => import(/* webpackChunkName: "Now Playing" */ './views/NowPlaying.vue');
const Rooms = () => import(/* webpackChunkName: "Rooms" */ './views/rooms/Rooms.vue');

const MusicLibrary = () => import(/* webpackChunkName: "Music Library" */ './views/MusicLibrary.vue');
const Artists = () => import(/* webpackChunkName: "Artists" */ './views/library/Artists.vue');
const Albums = () => import(/* webpackChunkName: "Albums" */ './views/library/Albums.vue');
const Songs = () => import(/* webpackChunkName: "Songs" */ './views/library/Songs.vue');
const Genres = () => import(/* webpackChunkName: "Genres" */ './views/library/Genres.vue');
const Playlists = () => import(/* webpackChunkName: "Playlists" */ './views/library/Playlists.vue');
const Shares = () => import(/* webpackChunkName: "Shares" */ './views/library/Shares.vue');

const Artist = () => import(/* webpackChunkName: "Artist" */ './views/library/detail/Artist.vue');
const Album = () => import(/* webpackChunkName: "Album" */ './views/library/detail/Album.vue');
const Genre = () => import(/* webpackChunkName: "Genre" */ './views/library/detail/Genre.vue');
const Share = () => import(/* webpackChunkName: "Share" */ './views/library/detail/Share.vue');

const PlayQueue = () => import(/* webpackChunkName: "Play Queue" */ './views/PlayQueue.vue');


Vue.use(Router);
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'NowPlaying',
      component: NowPlaying,
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
    },
    {
      path: '/rooms',
      name: 'Rooms',
      component: Rooms,
    },
    {
      path: '/library',
      component: MusicLibrary,
      children: [
        {
          path: '',
          name: 'library',
          redirect: { name: 'Artists' },
        },
        {
          path: '/library/artists',
          name: 'Artists',
          component: Artists,
        },
        {
          path: '/library/albums',
          name: 'Albums',
          component: Albums,
        },
        {
          path: '/library/songs',
          name: 'Songs',
          component: Songs,
        },
        {
          path: '/library/genres',
          name: 'Genres',
          component: Genres,
        },
        {
          path: '/library/playlists',
          name: 'Playlists',
          component: Playlists,
        },
        {
          path: '/library/shares',
          name: 'Shares',
          component: Shares,
        },
      ],
    },
    {
      path: '/artist/all/*',
      name: 'AllArtist',
      component: Album,
    },
    {
      path: '/artist/*',
      name: 'Artist',
      component: Artist,
    },
    {
      path: '/album/*',
      name: 'Album',
      component: Album,
    },
    {
      path: '/genre/all/*/songs',
      name: 'AllGenre',
      component: Album,
      props: { isGenrePlaylist: true },
    },
    {
      path: '/genre/*',
      name: 'Genre',
      component: Genre,
    },
    {
      path: '/playlist/*',
      name: 'Playlist',
      component: Album,
      props: { isNormalPlaylist: true },
    },
    {
      path: '/share/*',
      name: 'Share',
      component: Share,
    },
    {
      path: '/queue',
      name: 'PlayQueue',
      component: PlayQueue,
    },
  ],
});

router.beforeEach((to, from, next) => {
  store.commit('SET_PREVIOUS_ROUTE_PATH', from.path);
  next();
});

export default router;
