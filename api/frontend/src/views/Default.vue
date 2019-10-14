<template>
  <div class="py-5">
    <v-tabs v-model="currentTab" background-color="transparent">
      <v-tabs-slider></v-tabs-slider>
      <v-tab v-for="(tab, index) in tabs" :key="index" :href="`#tab-${index}`">{{tab}}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currentTab" style="background-color: transparent">
      <v-tab-item value="tab-0">
        <Booking />
      </v-tab-item>

      <v-tab-item value="tab-1">
        <Signals />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import Booking from "./Booking";
import Signals from "./Signals";

export default {
  components: {
    Booking,
    Signals
  },
  data: () => ({
    currentTab: null,
    tabs: ["booking_simulation", "vehicle_signals"]
  })
};
</script>
