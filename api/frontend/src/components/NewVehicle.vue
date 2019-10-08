<template>
  <v-row>
    <v-col cols="12" class="px-5 pb-0 pt-5">Add Vehicle</v-col>
    <v-col sm="4">
      <v-text-field solo label="Name" v-model="name"></v-text-field>
    </v-col>
    <v-col sm="4">
      <v-select
        solo
        label="Location"
        :items="environments"
        return-object
        item-text="name"
        v-model="environment"
        hide-details
      ></v-select>
    </v-col>
    <v-col sm="4" class="pt-4">
      <v-btn @click="addVehicle">
        <v-icon left>fa-plus</v-icon>Add
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import moment from "moment";
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      name: null,
      environment: null
    };
  },
  methods: {
    addVehicle() {
      let vehicles = this.vehicles;
      this.setVehicle(vehicles);
    },
    ...mapActions(["setVehicle"])
  },
  computed: {
    ...mapState(["environments", "vehicles"])
  }
};
</script>
