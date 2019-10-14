<template>
  <v-card>
    <v-card-title>Bookings</v-card-title>
    <v-card-text>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">From/Until</th>
              <th class="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in bookings" :key="item.name">
              <td>{{ item.id }}</td>
              <td>{{ item.vehicle.licensePlate }}</td>
              <td>{{ item.from | date }}/{{ item.until | date }}</td>
              <td v-if="item.status === 'new'" class="primary--text">{{ item.status }}</td>
              <td v-if="item.status === 'active'" class="warning--text">{{ item.status }}</td>
              <td
                v-if="item.status === 'finished' && item.event === 'finished_in_time'"
                class="success--text"
              >{{ item.status }} in time</td>
              <td
                v-if="item.status === 'finished' && item.event === 'finished_late'"
                class="error--text"
              >{{ item.status }} late</td>
              <td v-if="item.status === 'cancelled'" class="grey--text">{{ item.status }}</td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      :disabled="item.status !== 'new'"
                      @click="startBooking(item)"
                    >
                      <v-icon small>fa-play</v-icon>
                    </v-btn>
                  </template>
                  <span>Start booking</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      :disabled="item.status !== 'active'"
                      @click="finishBooking(item)"
                    >
                      <v-icon small>fa-stop</v-icon>
                    </v-btn>
                  </template>
                  <span>Finish booking</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      :disabled="item.status !== 'new'"
                      @click="cancelBooking(item)"
                    >
                      <v-icon small>fa-ban</v-icon>
                    </v-btn>
                  </template>
                  <span>Cancel booking</span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      //
    };
  },
  methods: {
    startBooking(booking) {
      this.axios
        .patch(`bookings/${booking.id}/start`, {}, this.$root.axiosOptions)
        .then(response => {
          if (response.data.success) {
            this.$root.loadBookings();
            this.$root.loadVehicles();
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    },
    finishBooking(booking) {
      this.axios
        .patch(`bookings/${booking.id}/finish`, {}, this.$root.axiosOptions)
        .then(response => {
          if (response.data.success) {
            this.startVehicleCharing(booking);
          }
        })
        .catch(err => {
          console.log(err);
          this.alertError(err.response.data.data);
        });
    },
    cancelBooking(booking) {
      this.axios
        .patch(`bookings/${booking.id}/cancel`, {}, this.$root.axiosOptions)
        .then(response => {
          if (response.data.success) {
            this.$root.loadBookings();
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    },
    startVehicleCharing(booking) {
      this.axios
        .patch(
          `vehicles/${booking.vehicle.id}`,
          {
            status: "charging"
          },
          this.$root.axiosOptions
        )
        .then(response => {
          if (response.data.success) {
            this.$root.loadBookings();
            this.$root.loadVehicles();
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    },
    loadBookings() {
      let from = moment()
        .startOf("year")
        .add(-5, "years")
        .toISOString();
      let until = moment()
        .startOf("year")
        .add(5, "years")
        .toISOString();
      this.axios
        .get("bookings", {
          params: {
            from: from,
            until: until
          },
          headers: this.$root.axiosOptions.headers
        })
        .then(response => {
          if (response.data.success) {
            this.setBookings(response.data.data);
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    },
    ...mapActions(["alertError"])
  },
  computed: {
    ...mapState(["bookings"])
  }
};
</script>
