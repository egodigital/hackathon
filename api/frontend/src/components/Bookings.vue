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
              <td v-if="item.status === 'finished_in_time'" class="success--text">{{ item.status }}</td>
              <td v-if="item.status === 'finished_late'" class="error--text">{{ item.status }}</td>
              <td v-if="item.status === 'cancelled'" class="grey--text">{{ item.status }}</td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn small icon v-on="on" :disabled="item.status !== 'active'">
                      <v-icon small>fa-sign-in-alt</v-icon>
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
import { mapState } from "vuex";

export default {
  data() {
    return {
      //
    };
  },
  methods: {
    cancelBooking(booking) {
      this.axios
        .patch(`bookings/${booking.id}/cancel`, {}, this.$root.axiosOptions)
        .then(response => {
          this.$root.loadBookings();
        })
        .catch(err => {
          //
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
          this.setBookings(response.data.data);
        })
        .catch(err => {
          //
        });
    }
  },
  computed: {
    ...mapState(["bookings"])
  }
};
</script>
