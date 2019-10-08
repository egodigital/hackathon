<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="7">
        <NewBooking />
        <Bookings />
      </v-col>
      <v-col cols="12" sm="5">
        <Vehicles />
        <NewVehicle />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import NewBooking from "../components/NewBooking";
import Bookings from "../components/Bookings";
import Vehicles from "../components/Vehicles";
import NewVehicle from "../components/NewVehicle";

export default {
  components: {
    NewBooking,
    Bookings,
    Vehicles,
    NewVehicle
  }
};
</script>
