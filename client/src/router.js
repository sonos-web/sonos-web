import Vue from 'vue';
import Router from 'vue-router';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// const Home = () => import(/* webpackChunkName: "Home" */ './views/Home.vue');

import NowPlaying from './views/NowPlaying.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: NowPlaying,
    },
  ],
});
