import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

const options = {
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#3898d6',
        secondary: '#282828',
        tertiary: '#252f3a',
        accent: '#243B55',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
  customProperties: true,
  icons: {
    iconfont: 'mdi',
  },
};

export default new Vuetify(options);
