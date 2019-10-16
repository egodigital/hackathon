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
        @blur="() => updateView()"
      ></v-text-field>
      <v-btn icon @click="toggleDarkMode">
        <v-icon>{{ isDark ? 'fa-moon' : 'fa-sun' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-container v-show="!isAPIKeyValid" fluid fill-height grid-list-md text-xs-center>
      <v-layout row wrap align-center>
        <v-flex class="display-1" style="text-align: center;">
          {{ $t('no_api_key') }}
        </v-flex>
      </v-layout>
    </v-container>

    <v-content v-if="isAPIKeyValid">
      <router-view />
    </v-content>

    <v-btn fab fixed right bottom color="error" @click="reset" v-if="isAPIKeyValid">Reset</v-btn>

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
import utils from "./utils";

export default {
  name: "App",
  data: () => ({
    apiKey: null,
    isAPIKeyValid: false
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
          this.alertError(err.response.data.data);
        });
    },
    start() {
      localStorage.setItem("key", this.apiKey);
      this.setKey(this.apiKey);
      this.$root.loadEnvironments();
      this.$root.loadVehicles();
    },
    updateView() {
      this.isAPIKeyValid = "" !== utils.toStringSafe(this.apiKey).trim();
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
    this.axios.defaults.baseURL = utils.withBaseUrl();

    if (localStorage.hasOwnProperty("key")) {
      this.apiKey = localStorage.getItem("key");
      this.start();
    }
  },
  mounted() {
    this.updateView();
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
