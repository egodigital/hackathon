import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import lang from '../lang.js'

Vue.use(Vuetify);

let en = lang.messages.en

export default new Vuetify({
  lang: {
    locales: {
      en
    },
    current: 'en',
  },
  icons: {
    iconfont: 'fa',
  }
});