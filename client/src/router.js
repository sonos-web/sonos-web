import Vue from 'vue';
import Router from 'vue-router';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// const Home = () => import(/* webpackChunkName: "Home" */ './views/Home.vue');

import NowPlaying from './views/NowPlaying.vue';

const Rooms = () => import(/* webpackChunkName: "Rooms" */ './views/Rooms.vue');


Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'NowPlaying',
      component: NowPlaying,
      meta: { title: 'Now Playing - Sonos Web' },
    },
    {
      path: '/search',
      name: 'Search',
      meta: { title: 'Search - Sonos Web' },
    },
    {
      path: '/rooms',
      name: 'Rooms',
      component: Rooms,
      meta: { title: 'Rooms - Sonos Web' },
    },
    {
      path: '/library',
      name: 'MusicLibrary',
      meta: { title: 'Music Library - Sonos Web' },
    },

  ],
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
