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
              <th class="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in bookings" :key="item.name">
              <td>{{ item.id }}</td>
              <td>{{ item.car.name }}</td>
              <td v-if="item.status === 'new'" class="primary--text">{{ item.status }}</td>
              <td v-if="item.status === 'active'" class="warning--text">{{ item.status }}</td>
              <td v-if="item.status === 'finished_in_time'" class="success--text">{{ item.status }}</td>
              <td v-if="item.status === 'finished_late'" class="error--text">{{ item.status }}</td>
              <td v-if="item.status === 'canceled'" class="grey--text">{{ item.status }}</td>
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
                    <v-btn small icon v-on="on" :disabled="item.status !== 'new'">
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
  computed: {
    ...mapState(["bookings"])
  }
};
</script>
