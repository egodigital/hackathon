<!--

  This file is part of the vehicle-api distribution (https://github.com/egodigital/hackathon/vehicle-api).
  Copyright (c) e.GO Digital GmbH, Aachen, Germany

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, version 3.

  This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
  <v-app :dark="darkMode">
    <EgoToolbar/>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import EgoToolbar from "./components/EgoToolbar";
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  components: {
    EgoToolbar
  },
  data() {
    return {};
  },
  methods: {
    ...mapActions(["setApiKey", "toggleDarkMode"])
  },
  computed: {
    ...mapState(["apiKey", "darkMode"])
  },
  beforeMount() {
    this.axios.defaults.baseURL = this.$root.getApiUrl();

    if (localStorage.apiKey) {
      this.setApiKey(localStorage.apiKey);
    }
    if (localStorage.darkMode && localStorage.darkMode == "true") {
      this.toggleDarkMode();
    }
  }
};
</script>

<style lang="scss">
#ego-logo {
  height: 32px;
  margin-top: 12px;
}

a {
  text-decoration: none;
}

#app.theme--dark {
  table {
    td,
    th {
      a {
        color: #ffffff;
      }
    }
  }
}
</style>
