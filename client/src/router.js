import Vue from 'vue';
import Router from 'vue-router';
// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// const Home = () => import(/* webpackChunkName: "Home" */ './views/Home.vue');
// const About = () => import(/* webpackChunkName: "About" */ './views/About.vue');

import Home from './views/Home.vue';
import About from './views/About.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
});
