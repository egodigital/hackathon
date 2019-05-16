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

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    apiKey: null,
    darkMode: false
  },
  mutations: {
    SET_API_KEY: (state, key) => {
      state.apiKey = key;
      localStorage.apiKey = key;
    },
    TOGGLE_DARK_MODE: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.darkMode = state.darkMode;
    }
  },
  actions: {
    setApiKey: (context, key) => {
      context.commit("SET_API_KEY", key);
    },
    toggleDarkMode: (context) => {
      context.commit("TOGGLE_DARK_MODE");
    }
  }
})