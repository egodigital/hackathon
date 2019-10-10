import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    key: null,
    snackbar: {
      show: false,
      timeout: 5000,
      multiline: false,
      color: null,
      text: ""
    },
    environments: [],
    bookings: [],
    vehicles: []
  },
  mutations: {
    SET_KEY: (state, key) => {
      state.key = key;
    },
    SET_SNACKBAR: (state, snackbar) => {
      let wait = 0;

      if (state.snackbar.show) {
        wait = 300;
        state.snackbar.show = false;
      }

      setTimeout(() => {
        state.snackbar.color = snackbar.color;
        state.snackbar.text = snackbar.text;
        state.snackbar.multiline = state.snackbar.text.length > 70;
        state.snackbar.show = true;
      }, wait);
    },
    HIDE_SNACKBAR: state => {
      state.snackbar.show = false;
    },
    SET_ENVIRONMENTS: (state, environments) => {
      state.environments = environments;
    },
    SET_BOOKINGS: (state, bookings) => {
      state.bookings = bookings;
    },
    PUSH_BOOKINGS: (state, booking) => {
      state.bookings.push(booking);
    },
    SET_VEHICLES: (state, vehicles) => {
      state.vehicles = vehicles;
    },
    PUSH_VEHICLES: (state, vehicle) => {
      state.vehicles.push(vehicle);
    }
  },
  actions: {
    setKey: (context, key) => {
      context.commit("SET_KEY", key);
    },
    alertSuccess: (context, text) => {
      context.commit("SET_SNACKBAR", {
        color: "success",
        text: text
      });
    },
    alertWarning: (context, text) => {
      context.commit("SET_SNACKBAR", {
        color: "warning",
        text: text
      });
    },
    alertError: (context, text) => {
      context.commit("SET_SNACKBAR", {
        color: "error",
        text: text
      });
    },
    alertInfo: (context, text) => {
      context.commit("SET_SNACKBAR", {
        color: "info",
        text: text
      });
    },
    closeAlert: context => {
      context.commit("HIDE_SNACKBAR");
    },
    setEnvironments: (context, environments) => {
      context.commit("SET_ENVIRONMENTS", environments);
    },
    setBookings: (context, bookings) => {
      context.commit("SET_BOOKINGS", bookings);
    },
    pushBooking: (context, booking) => {
      context.commit("PUSH_BOOKINGS", booking);
    },
    clearBooking: (context) => {
      context.commit("SET_BOOKINGS", []);
    },
    setVehicles: (context, vehicles) => {
      context.commit("SET_VEHICLES", vehicles);
    },
    pushVehicles: (context, vehicle) => {
      context.commit("PUSH_VEHICLES", vehicle);
    },
    clearVehicles: (context) => {
      context.commit("SET_VEHICLES", []);
    },
  },
});