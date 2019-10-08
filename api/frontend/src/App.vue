<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <img v-if="isDark" :src="require('./assets/ego-logo-weiß.png')" id="ego-logo" />
        <img v-else :src="require('./assets/ego-logo-black.png')" id="ego-logo" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        outlined
        dense
        label="API Key"
        v-model="apiKey"
        hide-details
        style="max-width: 300px"
        append-icon="fa-paper-plane"
        @click:append="start"
        @keydown.enter="start"
      ></v-text-field>
      <v-btn icon @click="toggleDarkMode">
        <v-icon>{{ isDark ? 'fa-moon' : 'fa-sun' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>

    <v-btn fab fixed right bottom color="error" @click="reset">Reset</v-btn>
  </v-app>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "App",
  data: () => ({
    apiKey: null
  }),
  methods: {
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    reset() {
      //
    },
    start() {
      console.log("START");
      this.setKey(this.apiKey);
    },
    ...mapActions(["setKey", "setEnvironments", "setBookings", "setVehicles"])
  },
  computed: {
    isDark() {
      return this.$vuetify.theme.dark;
    },
    ...mapState(["key", "environments", "vehicles"])
  },
  mounted() {
    this.setEnvironments([
      {
        id: 1,
        name: "Campus"
      },
      {
        id: 2,
        name: "Werk"
      }
    ]);
    this.setVehicles([
      {
        id: 1,
        name: "Car 1",
        environment: this.environments[0],
        status: "available"
      },
      {
        id: 2,
        name: "Car 2",
        environment: this.environments[0],
        status: "charging"
      },
      {
        id: 2,
        name: "Car 3",
        environment: this.environments[0],
        status: "blocked"
      }
    ]);
    this.setBookings([
      {
        id: 1,
        car: this.vehicles[1],
        status: "new"
      },
      {
        id: 2,
        car: this.vehicles[1],
        status: "active"
      },
      {
        id: 3,
        car: this.vehicles[0],
        status: "finished_in_time"
      },
      {
        id: 4,
        car: this.vehicles[2],
        status: "canceled"
      },
      {
        id: 4,
        car: this.vehicles[2],
        status: "finished_late"
      }
    ]);
  }
};
</script>

<style>
#ego-logo {
  height: 50px;
  margin-top: 5px;
}

a {
  text-decoration: none;
}
</style>
