<template>
  <v-card>
    <v-card-title>All Vehicles</v-card-title>
    <v-card-text>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">License plate</th>
              <th class="text-left">Model</th>
              <th class="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in vehicles" :key="item.name">
              <td>{{ item.licensePlate }}</td>
              <td>{{ item.model }}</td>
              <td v-if="item.status === 'available'" class="success--text">{{ item.status }}</td>
              <td v-if="item.status === 'charging'" class="grey--text">{{ item.status }}</td>
              <td v-if="item.status === 'blocked'" class="error--text">{{ item.status }}</td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      :disabled="item.status === 'blocked'"
                      @click="toggleCharging(item)"
                    >
                      <v-icon small>fa-gas-pump</v-icon>
                    </v-btn>
                  </template>
                  <span>Toggle charging</span>
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
    toggleCharging(vehicle) {
      let status = vehicle.status === "charging" ? "available" : "charging";

      this.axios
        .patch(
          `vehicles/${vehicle.id}`,
          {
            status: status
          },
          this.$root.axiosOptions
        )
        .then(response => {
          if (response.data.success) {
            this.$root.loadVehicles();
          }
        })
        .catch(err => {
          this.alertError(err.response.data.data);
        });
    }
  },
  computed: {
    ...mapState(["vehicles"])
  }
};
</script>
