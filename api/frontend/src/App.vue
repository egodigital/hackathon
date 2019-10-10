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

    <v-snackbar
      bottom
      right
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      :multi-line="snackbar.multiline"
    >
      {{ snackbar.text }}
      <v-btn text v-on:click="closeAlert">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import moment from "moment";
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
      this.axios
        .delete("/", this.$root.axiosOptions)
        .then(response => {
          this.alertSuccess("Data reset complete");
          this.$root.loadEnvironments();
          this.$root.loadVehicles();
        })
        .catch(err => {
          //
        });
    },
    start() {
      localStorage.setItem("key", this.apiKey);
      this.setKey(this.apiKey);
      this.$root.loadEnvironments();
      this.$root.loadVehicles();
    },
    ...mapActions(["setKey", "alertSuccess", "closeAlert"])
  },
  computed: {
    isDark() {
      return this.$vuetify.theme.dark;
    },
    ...mapState(["key", "snackbar", "environments", "vehicles"])
  },
  beforeMount() {
    this.axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;

    if (localStorage.hasOwnProperty("key")) {
      this.apiKey = localStorage.getItem("key");
      this.start();
    }
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
