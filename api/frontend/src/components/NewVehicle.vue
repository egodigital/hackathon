<template>
  <v-row>
    <v-col cols="12" class="px-5 pb-0 pt-5">Add Vehicle</v-col>
    <v-col sm="4">
      <v-text-field solo label="License plate" v-model="licensePlate"></v-text-field>
    </v-col>
    <v-col sm="4">
      <v-text-field solo label="Model" v-model="model"></v-text-field>
    </v-col>
    <v-col sm="4" class="pt-4">
      <v-btn @click="addVehicle">
        <v-icon left>fa-plus</v-icon>Add
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      licensePlate: null,
      model: null
    };
  },
  methods: {
    addVehicle() {
      if (!this.licensePlate || !this.model) {
        this.alertWarning("Please fill all form fields.");
        return;
      }

      this.axios
        .post(
          "vehicles",
          {
            country: "D",
            manufacturer: "e.GO",
            licensePlate: this.licensePlate,
            model: this.model
          },
          this.$root.axiosOptions
        )
        .then(response => {
          if (response.data.success) {
            this.licensePlate = null;
            this.model = null;
            this.$root.loadVehicles();
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    },
    ...mapActions(["clearVehicles", "setVehicles", "alertWarning"])
  },
  computed: {
    ...mapState(["environments", "vehicles"])
  }
};
</script>
