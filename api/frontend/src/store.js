import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    key: null,
    environments: [],
    bookings: [],
    vehicles: []
  },
  mutations: {
    SET_KEY: (state, key) => {
      state.key = key;
    },
    SET_ENVIRONMENTS: (state, environments) => {
      state.environments = environments;
    },
    SET_BOOKINGS: (state, bookings) => {
      state.bookings = bookings;
    },
    SET_VEHICLES: (state, vehicles) => {
      state.vehicles = vehicles;
    }
  },
  actions: {
    setKey: (context, key) => {
      context.commit("SET_KEY", key);
    },
    setEnvironments: (context, environments) => {
      context.commit("SET_ENVIRONMENTS", environments);
    },
    setBookings: (context, bookings) => {
      context.commit("SET_BOOKINGS", bookings);
    },
    setVehicles: (context, vehicles) => {
      context.commit("SET_VEHICLES", vehicles);
    }
  },
});