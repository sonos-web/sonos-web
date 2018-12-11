import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import store from './store';

import LoadingView from '@/components/LoadingView';

Vue.config.productionTip = false;

Vue.component('LoadingView', LoadingView);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
