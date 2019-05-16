/**
 * This file is part of the vehicle-api distribution (https://github.com/egodigital/hackathon/vehicle-api).
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import VueI18n from 'vue-i18n';
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'vuetify/src/stylus/app.styl';
import App from './App.vue';
import router from './router';
import store from './store';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
//import 'material-design-icons-iconfont/dist/material-design-icons.css';
import '@fortawesome/fontawesome-free/css/all.css';
import en from 'vuetify/es5/locale/en';
import lang from './lang';
import variables from './styles/variables.scss';

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.use(VueI18n);

let browserLang = String(navigator.language).toLowerCase()
  .trim();
browserLang = 'en';

const i18n = new VueI18n({
  locale: browserLang,
  fallbackLocale: 'en',
  messages: lang.messages,
});

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: variables.primaryOne
  },
  lang: {
    locales: {
      en
    },
    current: browserLang
  }
});

// Vue.filter('date', (value, format) => {
//   if (value) {
//     let _format = format ? format : "DD. MMM. YYYY HH:mm";
//     return moment(String(value)).format(_format);
//   }
// })

// Vue.filter('currency', (value, currency) => {
//   if (value || value === 0) {
//     let _currency = currency ? currency : "€";
//     let val = (value / 1).toFixed(2).replace('.', ',')
//     return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " " + _currency
//   }
// })

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
  methods: {
    getApiUrl() {
      return (process.env.VUE_APP_ROOT_API || '') + "/api";
    },
  }
}).$mount('#app')