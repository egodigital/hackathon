<template>
  <v-card>
    <v-card-title>All Vehicles</v-card-title>
    <v-card-text>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th>ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">Location</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in vehicles" :key="item.name">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.environment.name }}</td>
              <td v-if="item.status === 'available'" class="success--text">{{ item.status }}</td>
              <td v-if="item.status === 'charging'" class="grey--text">{{ item.status }}</td>
              <td v-if="item.status === 'blocked'" class="error--text">{{ item.status }}</td>
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
    ...mapState(["vehicles"])
  }
};
</script>
