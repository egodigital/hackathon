import Vue from 'vue';
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@fortawesome/fontawesome-free/css/all.css';
import {
  mapState,
  mapActions
} from 'vuex';
import moment from "moment";

Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

Vue.filter('date', (value, format) => {
  if (value) {
    let _format = format ? format : "DD.MM.YY";
    return moment(String(value)).format(_format);
  }
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  methods: {
    loadEnvironments() {
      this.axios
        .get("environments", this.$root.axiosOptions)
        .then(response => {
          this.setEnvironments(response.data.data);
        })
        .catch(err => {
          //
        });
    },
    loadVehicles() {
      this.axios
        .get("vehicles", this.$root.axiosOptions)
        .then(response => {
          this.setVehicles(response.data.data);
          this.loadBookings();
        })
        .catch(err => {
          //
        });
    },
    loadBookings() {
      let from = moment()
        .startOf("year")
        .add(-5, "years")
        .toISOString();
      let until = moment()
        .startOf("year")
        .add(5, "years")
        .toISOString();
      this.axios
        .get("bookings", {
          params: {
            from: from,
            until: until
          },
          headers: this.$root.axiosOptions.headers
        })
        .then(response => {
          this.setBookings(response.data.data);
        })
        .catch(err => {
          //
        });
    },
    ...mapActions(["setEnvironments", "setVehicles", "setBookings"])
  },
  computed: {
    axiosOptions() {
      return {
        headers: {
          "X-Api-Key": this.key
        }
      }
    },
    ...mapState(["key"])
  }
}).$mount('#app');