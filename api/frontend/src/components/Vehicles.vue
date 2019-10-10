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
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in vehicles" :key="item.name">
              <td>{{ item.licensePlate }}</td>
              <td>{{ item.model }}</td>
              <td
                v-if="vehicleStatus(item) === 'available'"
                class="success--text"
              >{{ vehicleStatus(item) }}</td>
              <td
                v-if="vehicleStatus(item) === 'charging'"
                class="grey--text"
              >{{ vehicleStatus(item) }}</td>
              <td
                v-if="vehicleStatus(item) === 'blocked'"
                class="error--text"
              >{{ vehicleStatus(item) }}</td>
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
    vehicleStatus(item) {
      // TODO
      return "available";
    }
  },
  computed: {
    ...mapState(["vehicles"])
  }
};
</script>
