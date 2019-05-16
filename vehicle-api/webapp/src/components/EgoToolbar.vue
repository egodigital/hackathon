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
  <v-toolbar app :class="classes">
    <v-toolbar-title class="headline text-uppercase">
      <a href="https://e-go-digital.com/" target="_blank">
        <img v-if="darkMode" :src="require('../assets/Logo-eGOdigital-white.png')" id="ego-logo">
        <img v-else :src="require('../assets/Logo-eGOdigital-RGB.png')" id="ego-logo">
      </a>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-text-field
      ref="egoApiKeyTextField"
      v-model="textApiKey"
      type="password"
      label="e.GO Life ID"
      placeholder="Your API key"
      solo
      prepend-inner-icon="fa-car"
      style="max-width: 350px"
    ></v-text-field>
    <v-btn color="primary" class="btn-set-api-key" @click="submitApiKey">
      <v-icon>fa-check</v-icon>
    </v-btn>
    <v-btn icon class="btn-dark-mode" @click="toggleDarkMode">
      <v-icon v-if="darkMode">fa-moon</v-icon>
      <v-icon v-else>fa-sun</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
import classNames from "classnames";
import { mapState, mapActions } from "vuex";

export default {
  name: "ego-toolbar",
  components: {},
  data() {
    return {
      textApiKey: null
    };
  },
  methods: {
    submitApiKey() {
      this.setApiKey(this.textApiKey);
    },
    ...mapActions(["setApiKey", "toggleDarkMode"])
  },
  computed: {
    classes() {
      return classNames(this.$options.name);
    },
    ...mapState(["apiKey", "darkMode"])
  },
  mounted() {
    if (!this.textApiKey) {
      this.$refs
        .egoApiKeyTextField
        .focus();
    }
  },
  beforeMount() {
    if (this.apiKey) {
      this.textApiKey = this.apiKey;
    }
  }
};
</script>

<style scoped lang="scss">
@import "../styles/variables";
@import "../styles/functions";

.ego-toolbar {
  /deep/ .v-input {
    .v-input__control {
      .v-input__slot {
        margin: 0;

        .v-input__prepend-inner {
          margin-right: 6px;
        }
      }
    }
  }

  .btn-set-api-key {
    height: 48px;
    margin: 0 5px;
    min-width: auto;
  }

  .btn-dark-mode {
  }
}
</style>