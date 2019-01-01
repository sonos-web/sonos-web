import Vue from 'vue';
import vueHeadful from 'vue-headful';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import store from './store';
import './services/socket';

import ErrorView from './components/ErrorView.vue';
import LoadingView from './components/LoadingView.vue';

Vue.config.productionTip = false;

Vue.component('vue-headful', vueHeadful);
Vue.component('ErrorView', ErrorView);
Vue.component('LoadingView', LoadingView);

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    // initialize settings data
    this.$store.dispatch('loadSettings');
    if (!navigator.onLine) {
      store.commit('SET_HAS_ERROR', true);
      store.commit('SET_ERROR_MESSAGE', 'It looks like you are not connected to a local network.');
    }
  },
}).$mount('#app');
