
<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="3">
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
        <v-col cols="12" sm="9">
          <v-text-field
            label="Search"
            solo
            v-model="textSearch"
            placeholder="Highlight signals by using keywords, separated by comma(s) ..."
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <table v-if="signals">
            <tr :class="matchSearch('battery_charging') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'battery_charging')">{{ $t('battery_charging') }}</a>
              </td>
              <td>
                <v-switch
                  v-model="signals.battery_charging"
                  true-value="yes"
                  false-value="no"
                  hide-details
                  @click.stop="writeSignal({'battery_charging': signals.battery_charging === 'no' ? 'yes': 'no'})"
                ></v-switch>
              </td>
            </tr>
            <tr :class="matchSearch('battery_charging_current') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'battery_charging_current')"
                >{{ $t('battery_charging_current') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(0,50, 'battery_charging_current', signals.battery_charging_current, false)"
                >{{ signals.battery_charging_current }} amp</p>
              </td>
            </tr>
            <tr :class="matchSearch('battery_health') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'battery_health')">{{ $t('battery_health') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  :value="signals.battery_health"
                  @click="showSliderDialog(0,100, 'battery_health', signals.battery_health, false)"
                >{{ signals.battery_health }}%</v-progress-linear>
              </td>
            </tr>
            <tr :class="matchSearch('battery_loading_capacity') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'battery_loading_capacity')"
                >{{ $t('battery_loading_capacity') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(0,100, 'battery_loading_capacity', signals.battery_loading_capacity, false)"
                >{{ signals.battery_loading_capacity }} kW</p>
              </td>
            </tr>
            <tr :class="matchSearch('battery_state_of_charge') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'battery_state_of_charge')"
                >{{ $t('battery_state_of_charge') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  :value="signals.battery_state_of_charge"
                  @click="showSliderDialog(0,100, 'battery_state_of_charge', signals.battery_state_of_charge, false)"
                >{{ signals.battery_state_of_charge }}%</v-progress-linear>
              </td>
            </tr>
            <tr :class="matchSearch('battery_total_kwh_capacity') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'battery_total_kwh_capacity')"
                >{{ $t('battery_total_kwh_capacity') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(14, 24, 'battery_total_kwh_capacity', signals.battery_total_kwh_capacity, false)"
                >{{ signals.battery_total_kwh_capacity }} kWh</p>
              </td>
            </tr>
            <tr :class="matchSearch('brake_fluid_level') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'brake_fluid_level')">{{ $t('brake_fluid_level') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  :value="signals.brake_fluid_level"
                  @click="showSliderDialog(0,100, 'brake_fluid_level', signals.brake_fluid_level, false)"
                >{{ signals.brake_fluid_level }}%</v-progress-linear>
              </td>
            </tr>
            <tr :class="matchSearch('calculated_remaining_distance') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'calculated_remaining_distance')"
                >{{ $t('calculated_remaining_distance') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(0,500, 'calculated_remaining_distance', signals.calculated_remaining_distance, false)"
                >{{ signals.calculated_remaining_distance }} km</p>
              </td>
            </tr>
            <tr :class="matchSearch('central_locking_system') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'central_locking_system')"
                >{{ $t('central_locking_system') }}</a>
              </td>
              <td>
                <v-switch
                  v-model="signals.central_locking_system"
                  true-value="open"
                  false-value="closed"
                  @click.stop="writeSignal({'central_locking_system': signals.central_locking_system === 'open' ? 'closed': 'open'})"
                  hide-details
                ></v-switch>
              </td>
            </tr>
            <tr :class="matchSearch('drive_mode') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'drive_mode')">{{ $t('drive_mode') }}</a>
              </td>
              <td>{{ signals.drive_mode }}</td>
            </tr>
            <tr :class="matchSearch('heated_seats') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'heated_seats')">{{ $t('heated_seats') }}</a>
              </td>
              <td>
                <v-switch
                  v-model="signals.heated_seats"
                  true-value="on"
                  false-value="off"
                  @click.stop="writeSignal({'heated_seats': signals.heated_seats === 'off' ? 'on': 'off'})"
                  hide-details
                ></v-switch>
              </td>
            </tr>
            <tr :class="matchSearch('person_count') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'person_count')">{{ $t('person_count') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  :value="signals.person_count / 4 * 100"
                  @click="showSliderDialog(0,4, 'person_count', signals.person_count, false)"
                >{{ signals.person_count }}/4</v-progress-linear>
              </td>
            </tr>
            <tr :class="matchSearch('power_consumption') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'power_consumption')">{{ $t('power_consumption') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  :value="signals.power_consumption / 40 * 100"
                  @click="showSliderDialog(0,40, 'power_consumption', signals.power_consumption, false)"
                >{{ signals.power_consumption }}/40</v-progress-linear>
              </td>
            </tr>
            <tr :class="matchSearch('speed') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'speed')">{{ $t('speed') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(0,200, 'speed', signals.speed, false)"
                >{{ signals.speed }}</p>
              </td>
            </tr>
            <tr :class="matchSearch('temperature_inside') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'temperature_inside')">{{ $t('temperature_inside') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(-50,70, 'temperature_inside', signals.temperature_inside, false)"
                >{{ signals.temperature_inside }}°C</p>
              </td>
            </tr>
            <tr :class="matchSearch('temperature_outside') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'temperature_outside')"
                >{{ $t('temperature_outside') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(-50,70, 'temperature_outside', signals.temperature_outside, false)"
                >{{ signals.temperature_outside }}°C</p>
              </td>
            </tr>
            <tr :class="matchSearch('weight') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'weight')">{{ $t('weight') }}</a>
              </td>
              <td>
                <p
                  @click="showSliderDialog(1200,3500, 'weight', signals.weight, false)"
                >{{ signals.weight }}</p>
              </td>
            </tr>
          </table>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="infotainment-wrapper">
            <v-img
              class="infotainment-preview"
              :src="infotainment"
              v-if="String(infotainmentContentType).toLowerCase().trim().startsWith('image/')"
            />
            <video
              id="ego-infotainment-video-preview"
              class="infotainment-preview"
              :src="infotainment"
              autoplay
              controls
              loop
              v-if="String(infotainmentContentType).toLowerCase().trim().startsWith('video/')"
            >Your browser does not support the video tag.</video>
          </div>

          <table>
            <tr :class="matchSearch('infotainment') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'infotainment')">{{ $t('infotainment') }}</a>
              </td>
              <td>
                <v-switch
                  v-model="signals.infotainment"
                  true-value="on"
                  false-value="off"
                  @click.stop="writeSignal({'infotainment': signals.infotainment === 'off' ? 'on': 'off'})"
                  hide-details
                ></v-switch>
              </td>
            </tr>
            <tr :class="matchSearch('infotainment_volume') ? 'hightlighted' : ''">
              <td>
                <a
                  @click="showPopover($event, 'infotainment_volume')"
                >{{ $t('infotainment_volume') }}</a>
              </td>
              <td>
                <v-progress-linear
                  class="elevation-3"
                  color="primary"
                  height="20"
                  @click="showSliderDialog(0,10, 'infotainment_volume', signals.infotainment_volume, false)"
                  :value="signals.infotainment_volume / 10 * 100"
                >{{ signals.infotainment_volume }}/10</v-progress-linear>
              </td>
            </tr>
          </table>
        </v-col>
      </v-row>
    </v-container>

    <v-menu v-model="popover.show" :position-x="popover.x" :position-y="popover.y">
      <v-card>
        <v-card-text>
          {{ popover.desc }}
          <v-divider></v-divider>values:
          <br />
          {{ popover.values }}
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { setTimeout } from "timers";

export default {
  components: {},
  data() {
    return {
      vehicle: null,
      textSearch: null,
      signals: {
        // battery_charging: "no",
        // battery_charging_current: 16,
        // battery_health: 100,
        // battery_loading_capacity: 11,
        // battery_state_of_charge: 100,
        // battery_total_kwh_capacity: 17.5,
        // brake_fluid_level: 100,
        // calculated_remaining_distance: 150,
        // drive_mode: "eco"
        // heated_seats: "off"
        // infotainment: "off"
        // infotainment_volume: 5
        // location: "50.782117,6.047171"
        // mileage: 0
        // motor_control_lamp: "off"
        // person_count: 0
        // power_consumption: 0
        // pulse_sensor_steering_wheel: "NaN"
        // rain_sensor: "no_rain"
        // rear_running_lights: "off"
        // side_lights: "off"
        // speed: 0
        // stop_lights: "off"
        // temperature_inside: 20
        // temperature_outside: 10
        // tire_pressure_back_left: 3
        // tire_pressure_back_right: 3
        // tire_pressure_front_left: 3
        // tire_pressure_front_right: 3
        // trunk: "closed"
        // turn_signal_left: "off"
        // turn_signal_right: "off"
        // warning_blinker: "off"
        // weight: 1200
        // windshield_wipers: "off"
        // wiping_water_level: 100
      },
      infotainment: null,
      infotainmentContentType: null,
      iskeyValid: null,
      isLoadingInfotainment: false,
      isLoadingSignals: false,
      lastKnownLocation: null,
      showIframe: false,
      popover: {
        show: false,
        desc: null,
        values: null
      }
    };
  },
  watch: {
    key(value) {
      if (value) {
        this.refresh(false);
      }
    },
    vehicle(value) {
      if (value) {
        this.refresh(false);
      }
    }
  },
  methods: {
    refresh(useCache) {
      if (this.key && this.vehicle) {
        this.checkIfValidkey();
        this.getSignals(useCache);
        this.getInfotainment(useCache);
        setTimeout(() => {
          this.refresh(false);
          // this.refresh(true)
        }, 2000);
      }
    },
    showPopover(e, item) {
      e.preventDefault();
      setTimeout(() => {
        this.popover.show = true;
        this.popover.title = item.replace("_", " ");
        this.popover.desc = this.$t(`${item}_desc`);
        this.popover.values = this.$t(`${item}_values`);
        this.popover.x = e.clientX;
        this.popover.y = e.clientY;
      }, 50);
    },
    checkIfValidkey() {
      if (!this.key) return;
      if (null !== this.iskeyValid) {
        return;
      }
      this.axios
        .get(`vehicles/${this.vehicle.id}`, this.$root.axiosOptions)
        .then(response => {
          this.iskeyValid = 200 === response.status;
        })
        .catch(err => {
          this.iskeyValid = false;
          console.error("ERROR while getting 'vehicles/:id': " + err);
        });
    },
    getSignals(useCache) {
      if (!this.key) return;
      if (this.isLoadingSignals) {
        return;
      }
      this.isLoadingSignals = true;
      this.axios
        .get(
          `vehicles/${this.vehicle.id}/signals?cache=` + (useCache ? "1" : "0"),
          this.$root.axiosOptions
        )
        .then(response => {
          this.isLoadingSignals = false;
          if (200 !== response.status) {
            console.warn(
              `Unexpected response code when getting 'vehicles/:id/signals(1)': ${response.status}`
            );
            return;
          }
          this.signals = response.data.data;
          this.showIframe = true;
          if (response.data.success) {
            this.setInfotainmentVolume(response.data.infotainment_volume);
          }
        })
        .catch(err => {
          this.isLoadingSignals = false;
          if (err.response) {
            if (304 === err.response.status) {
              return; // cached
            }
          }
          console.error(
            "ERROR while getting 'vehicles/:id/signals(1)': " + err
          );
        });
    },
    getInfotainment(useCache) {
      if (!this.key) return;
      if (this.isLoadingInfotainment) {
        return;
      }
      this.isLoadingInfotainment = true;
      let config = this.$root.axiosOptions;
      config.responseType = "arraybuffer";
      this.axios
        .get(
          `vehicles/${this.vehicle.id}/infotainment?cache=` +
            (useCache ? "1" : "0"),
          config
        )
        .then(response => {
          this.isLoadingInfotainment = false;
          if (200 !== response.status) {
            console.warn(
              `Unexpected response code when getting 'vehicles/:id/infotainment(1)': ${response.status}`
            );
            return;
          }
          let contentType = response.headers["content-type"];
          let data = `data:${contentType};base64,${new Buffer(
            response.data,
            "binary"
          ).toString("base64")}`;
          if (this.infotainment !== data) {
            this.infotainmentContentType = contentType;
            this.infotainment = data;
          }
        })
        .catch(err => {
          this.isLoadingInfotainment = false;
          if (err.response) {
            if (304 === err.response.status) {
              return; // cached
            }
          }
          console.error(
            "ERROR while getting 'vehicles/:id/infotainment': " + err
          );
        });
    },
    matchSearch(id) {
      const ID_FOR_SEARCH = id
        .toLowerCase()
        .replace("_", " ")
        .trim();
      const SEARCH = this.textSearch;
      if (SEARCH) {
        return SEARCH.toLowerCase()
          .replace(";", ",") // only use , separators
          .trim()
          .split(",") // extract words
          .map(s => s.trim())
          .filter(s => "" !== s)
          .some(
            // at least one word should match
            s => ID_FOR_SEARCH.indexOf(s) !== -1
          );
      }
      return false;
    },
    setInfotainmentVolume(signalValue) {
      if (isNaN(signalValue)) {
        return;
      }
      const ELEMENT = document.getElementById("ego-infotainment-video-preview");
      if (!ELEMENT) {
        return;
      }
      const ELEMENT_VALUE = signalValue / 10.0;
      if (ELEMENT.volume !== ELEMENT_VALUE) {
        ELEMENT.volume = ELEMENT_VALUE;
      }
    },
    writeSignal(newValues) {
      this.axios
        .patch(
          `vehicles/${this.vehicle.id}/signals`,
          newValues,
          this.$root.axiosOptions
        )
        .then(response => {})
        .catch(err => {
          console.error(
            "ERROR while setting 'vehicles/:id/signals' (" +
              JSON.stringify(newValues) +
              "): " +
              err
          );
        });
    },
    showSliderDialog(min, max, signal, initValue, descAllowed, nanAllowed) {
      this.sliderProps = {
        min: min,
        max: max,
        initValue: initValue,
        signal: signal,
        descAllowed: descAllowed,
        key: this.key
      };
      if (nanAllowed) {
        this.sliderProps.nanAllowed = true;
      } else {
        this.sliderProps.nanAllowed = false;
      }
      this.sliderDialog = true;
    }
  },
  computed: {
    ...mapState(["key", "vehicles"])
  },
  beforeMount() {
    this.refresh(false);
  }
};
</script>

<style scoped lang="scss">
@import "../styles/_colors";

table {
  //width: 100%;
  border-collapse: collapse;

  tr {
    border-top: 1px solid #eee;

    &.hightlighted {
      background-color: map-get($primary-one, "lighten-3");
    }

    td {
      width: 50%;
      height: 30px;
      padding: 2px 8px;
      vertical-align: middle;

      a {
        &:hover {
          cursor: help;
        }
      }

      p {
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
}

.v-input {
  margin-top: 0;
  padding-top: 0;
}

>>> .v-progress-linear {
  margin: 0;

  .v-progress-linear__content {
    color: white;
    padding: 0 5px;
  }
}

img {
  width: 100%;
}

.infotainment-wrapper {
  position: relative;
  padding-top: 60%;
  width: 600px;
  max-width: 100%;
  // background-image: url("../assets/Infotainmentsystem_mask.png");
  background-size: contain;

  .infotainment-preview {
    position: absolute;
    top: 11.5%;
    left: 11.5%;
    right: 6.8%;
    bottom: 19.5%;
    border-radius: 3px;
  }
}

.vue2leaflet-map {
  height: 300px;
  width: 600px;
  max-width: 100%;
}
</style>
