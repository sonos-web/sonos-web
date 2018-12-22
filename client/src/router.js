import Vue from 'vue';
import Router from 'vue-router';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.

const Search = () => import(/* webpackChunkName: "Search" */ './views/Search.vue');
const NowPlaying = () => import(/* webpackChunkName: "Now Playing" */ './views/NowPlaying.vue');
const Rooms = () => import(/* webpackChunkName: "Rooms" */ './views/rooms/Rooms.vue');
const MusicLibrary = () => import(/* webpackChunkName: "Music Library" */ './views/MusicLibrary.vue');


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
      name: 'MusicLibrary',
      component: MusicLibrary,
    },

  ],
});

export default router;
