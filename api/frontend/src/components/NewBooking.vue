<template>
  <v-row>
    <v-col sm="3">
      <v-select
        solo
        label="Vehicle"
        :items="vehicles"
        return-object
        item-text="licensePlate"
        v-model="vehicle"
        hide-details
      ></v-select>
    </v-col>
    <v-col sm="3">
      <DatetimePicker label="From" v-model="dateFrom"></DatetimePicker>
    </v-col>
    <v-col sm="3">
      <DatetimePicker label="Until" v-model="dateUntil"></DatetimePicker>
    </v-col>
    <v-col sm="3" class="pt-4">
      <v-btn @click="addBooking">
        <v-icon left>fa-plus</v-icon>Add
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import moment from "moment";
import { mapState, mapActions } from "vuex";
import DatetimePicker from "../components/DatetimePicker";

export default {
  components: {
    DatetimePicker
  },
  data() {
    return {
      vehicle: null,
      dateFrom: null,
      dateUntil: null
    };
  },
  methods: {
    addBooking() {
      this.axios
        .post(
          `vehicles/${this.vehicle.id}/bookings`,
          {
            from: this.dateFrom.toISOString(),
            until: this.dateUntil.toISOString()
          },
          this.$root.axiosOptions
        )
        .then(response => {
          this.$root.loadBookings();
        })
        .catch(err => {
          //
        });
    },
    ...mapActions(["setBookings"])
  },
  computed: {
    ...mapState(["bookings", "vehicles"])
  }
};
</script>
