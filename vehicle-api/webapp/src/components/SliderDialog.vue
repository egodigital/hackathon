<template>
  <v-container>
    <v-layout row>
      <v-flex grow align-self-center>
        <p class="text-xs-center mb-0 title">
          <strong>{{$t(config.signal)}}</strong>
        </p>
      </v-flex>
      <v-flex shrink>
        <v-btn flat icon v-on:click="$emit('close-dialog')">
          <v-icon>fa-times</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout align-space-around justify-center column>
      <v-flex mt-3 ml-2 mr-2>
        <v-slider
          thumb-label
          :ticks="config.max - config.min < 20 "
          :max="config.max"
          :min="config.min"
          :disabled="nanAllowed"
          :step="config.descAllowed ? 0.01: 1"
          v-model="value"
        ></v-slider>
      </v-flex>
      <v-flex v-if="config.nanAllowed" ml-2 mr-2>
        <v-checkbox v-model="nanAllowed" label="NaN ≙ not detected"></v-checkbox>
      </v-flex>
      <v-flex mt-1>
        <v-btn block color="primary" @click="sendSignalAndClose()">Set and Close</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "SliderDialog",
  props: {
    config: Object,
    modal: Boolean
  },
  data: function() {
    return { value: this.config.initValue, nanAllowed: false };
  },
  methods: {
    sendSignalAndClose: function() {
      let axiosConfig = {
        headers: {
          "X-Api-Key": this.config.apiKey
        }
      };
      let newValues = {};
      newValues[this.config.signal] = this.nanAllowed ? "NaN" : this.value;
      this.axios
        .patch("/v1/vehicle/signals", newValues, axiosConfig)
        .then(response => {
          this.$emit("close-dialog");
        })
        .catch(err => {
          this.$emit("close-dialog");
          console.error(
            "ERROR while setting '/v1/vehicle/signals' (" +
              JSON.stringify(newValues) +
              "): " +
              err
          );
        });
    }
  },
  watch: {
    modal: function(newBool, oldBool) {
      if (newBool && !oldBool) {
        //dialog opened
        this.value = this.config.initValue;
        if (isNaN(this.config.initValue)) {
          this.nanAllowed = true;
        } else {
          this.nanAllowed = false;
        }
      }
    }
  }
};
</script>
