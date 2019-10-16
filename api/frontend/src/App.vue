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
        <v-flex class="display-1" style="text-align: center;">{{ $t('no_api_key') }}</v-flex>
      </v-layout>
    </v-container>

    <v-content v-if="isAPIKeyValid">
      <router-view />
    </v-content>

    <v-btn
      fab
      fixed
      right
      bottom
      color="error"
      @click="() => openAskBeforeResetDialog()"
      v-if="isAPIKeyValid"
    >Reset</v-btn>

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

    <v-dialog v-model="showAskBeforeResetDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline orange darken-1">{{ $t('dialogs.reset.title') }}</v-card-title>
        <v-card-text class="pt-4">{{ $t('dialogs.reset.message') }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="() => { showAskBeforeResetDialog = false; }">{{ $t('no') }}</v-btn>
          <v-btn
            color="error"
            @click="() => { showAskBeforeResetDialog = false; reset(); }"
          >{{ $t('yes') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    isAPIKeyValid: false,
    showAskBeforeResetDialog: false
  }),
  methods: {
    openAskBeforeResetDialog() {
      this.showAskBeforeResetDialog = true;
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
      this.updateView();

      localStorage.setItem("key", this.apiKey);
      this.setKey(this.apiKey);

      if (this.isAPIKeyValid) {
        this.$root.loadEnvironments();
        this.$root.loadVehicles();
      }
    },
    toggleDarkMode() {
      let flag = !this.$vuetify.theme.dark;

      this.$vuetify.theme.dark = flag;
      localStorage.setItem("dark_mode", flag ? "1" : "0");
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
    this.$vuetify.theme.dark = "1" === localStorage.getItem("dark_mode");

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
