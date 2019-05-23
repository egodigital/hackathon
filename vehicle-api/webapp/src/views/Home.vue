<!--

  This file is part of the vehicle-api distribution (https://github.com/egodigital/hackathon/vehicle-api).
  Copyright (c) e.GO Digital GmbH, Aachen, Germany

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, version 3.

  This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.

-->

<template>
  <div :class="classes">
    <v-alert
      :value="false === isApiKeyValid"
      type="error"
      class="display-1 text-xs-center"
    >Your API key seems to be invalid!</v-alert>

    <v-container v-show="!!apiKey" fluid grid-list-md>
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
            label="Search"
            solo
            v-model="textSearch"
            placeholder="Highlight signals by using keywords, separated by comma(s) ..."
          ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md8>
          <v-layout row wrap>
            <v-flex xs12 sm6>
              <table>
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
                    >{{ signals.battery_total_kwh_capacity }} kW</p>
                  </td>
                </tr>
                <tr :class="matchSearch('brake_fluid_level') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'brake_fluid_level')"
                    >{{ $t('brake_fluid_level') }}</a>
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
                <tr :class="matchSearch('distance_to_object_back') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'distance_to_object_back')"
                    >{{ $t('distance_to_object_back') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,30, 'distance_to_object_back', signals.distance_to_object_back, true, true)"
                    >{{ signals.distance_to_object_back }} cm</p>
                  </td>
                </tr>
                <tr :class="matchSearch('distance_to_object_bottom') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'distance_to_object_bottom')"
                    >{{ $t('distance_to_object_bottom') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,30, 'distance_to_object_bottom', signals.distance_to_object_bottom, true)"
                    >{{ signals.distance_to_object_bottom }} cm</p>
                  </td>
                </tr>
                <tr :class="matchSearch('distance_to_object_front') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'distance_to_object_front')"
                    >{{ $t('distance_to_object_front') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,30, 'distance_to_object_front', signals.distance_to_object_front, true, true)"
                    >{{ signals.distance_to_object_front }} cm</p>
                  </td>
                </tr>
                <tr :class="matchSearch('distance_to_object_left') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'distance_to_object_left')"
                    >{{ $t('distance_to_object_left') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,30, 'distance_to_object_left', signals.distance_to_object_left, true, true)"
                    >{{ signals.distance_to_object_left }} cm</p>
                  </td>
                </tr>
                <tr :class="matchSearch('distance_to_object_right') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'distance_to_object_right')"
                    >{{ $t('distance_to_object_right') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,30, 'distance_to_object_right', signals.distance_to_object_right, true, true)"
                    >{{ signals.distance_to_object_right }} cm</p>
                  </td>
                </tr>
                <tr :class="matchSearch('distance_trip') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'distance_trip')">{{ $t('distance_trip') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,1500, 'distance_trip', signals.distance_trip, false)"
                    >{{ signals.distance_trip }} km</p>
                  </td>
                </tr>
                <tr :class="matchSearch('door_disc_front_left') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'door_disc_front_left')"
                    >{{ $t('door_disc_front_left') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.door_disc_front_left"
                      true-value="open"
                      false-value="closed"
                      @click.stop="writeSignal({'door_disc_front_left': signals.door_disc_front_left === 'open' ? 'closed': 'open'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('door_disc_front_right') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'door_disc_front_right')"
                    >{{ $t('door_disc_front_right') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.door_disc_front_right"
                      true-value="open"
                      false-value="closed"
                      @click.stop="writeSignal({'door_disc_front_right': signals.door_disc_front_right === 'open' ? 'closed': 'open'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('door_front_left') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'door_front_left')">{{ $t('door_front_left') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.door_front_left"
                      true-value="open"
                      false-value="closed"
                      @click.stop="writeSignal({'door_front_left': signals.door_front_left === 'open' ? 'closed': 'open'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('door_front_right') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'door_front_right')">{{ $t('door_front_right') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.door_front_right"
                      true-value="open"
                      false-value="closed"
                      @click.stop="writeSignal({'door_front_right': signals.door_front_right === 'open' ? 'closed': 'open'})"
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
                <tr :class="matchSearch('flash') ? 'hightlighted' : ''">
                  <td>{{ $t('flash') }}</td>
                  <td>
                    <v-switch
                      v-model="signals.flash"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'flash': signals.flash === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
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
                <tr :class="matchSearch('high_beam') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'high_beam')">{{ $t('high_beam') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.high_beam"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'high_beam': signals.high_beam === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('mileage') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'mileage')">{{ $t('mileage') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,1000000, 'mileage', signals.mileage, false)"
                    >{{ signals.mileage }} km</p>
                  </td>
                </tr>
                <tr :class="matchSearch('motor_control_lamp') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'motor_control_lamp')"
                    >{{ $t('motor_control_lamp') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.motor_control_lamp"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'motor_control_lamp': signals.motor_control_lamp === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
              </table>
            </v-flex>

            <v-flex xs12 sm6>
              <table>
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
                    <a
                      @click="showPopover($event, 'power_consumption')"
                    >{{ $t('power_consumption') }}</a>
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
                <tr :class="matchSearch('pulse_sensor_steering_wheel') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'pulse_sensor_steering_wheel')"
                    >{{ $t('pulse_sensor_steering_wheel') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,300, 'pulse_sensor_steering_wheel', signals.pulse_sensor_steering_wheel, false, true)"
                    >{{ signals.pulse_sensor_steering_wheel }}</p>
                  </td>
                </tr>
                <tr :class="matchSearch('rain_sensor') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'rain_sensor')">{{ $t('rain_sensor') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.rain_sensor"
                      true-value="rain"
                      false-value="no_rain"
                      @click.stop="writeSignal({'rain_sensor': signals.rain_sensor === 'no_rain' ? 'rain': 'no_rain'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('rear_running_lights') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'rear_running_lights')"
                    >{{ $t('rear_running_lights') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.rear_running_lights"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'rear_running_lights': signals.rear_running_lights === 'on' ? 'off': 'on'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('side_lights') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'side_lights')">{{ $t('side_lights') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.side_lights"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'side_lights': signals.side_lights === 'on' ? 'off': 'on'})"
                      hide-details
                    ></v-switch>
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
                <tr :class="matchSearch('stop_lights') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'stop_lights')">{{ $t('stop_lights') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.stop_lights"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'stop_lights': signals.stop_lights === 'on' ? 'off': 'on'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('temperature_inside') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'temperature_inside')"
                    >{{ $t('temperature_inside') }}</a>
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
                <tr :class="matchSearch('tire_pressure_back_left') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'tire_pressure_back_left')"
                    >{{ $t('tire_pressure_back_left') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,5, 'tire_pressure_back_left', signals.tire_pressure_back_left, true)"
                    >{{ signals.tire_pressure_back_left }} bar</p>
                  </td>
                </tr>
                <tr :class="matchSearch('tire_pressure_back_right') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'tire_pressure_back_right')"
                    >{{ $t('tire_pressure_back_right') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,5, 'tire_pressure_back_right', signals.tire_pressure_back_right, true)"
                    >{{ signals.tire_pressure_back_right }} bar</p>
                  </td>
                </tr>
                <tr :class="matchSearch('tire_pressure_front_left') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'tire_pressure_front_left')"
                    >{{ $t('tire_pressure_front_left') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,5, 'tire_pressure_front_left', signals.tire_pressure_front_left, true)"
                    >{{ signals.tire_pressure_front_left }} bar</p>
                  </td>
                </tr>
                <tr :class="matchSearch('tire_pressure_front_right') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'tire_pressure_front_right')"
                    >{{ $t('tire_pressure_front_right') }}</a>
                  </td>
                  <td>
                    <p
                      @click="showSliderDialog(0,5, 'tire_pressure_front_right', signals.tire_pressure_front_right, true)"
                    >{{ signals.tire_pressure_front_right }} bar</p>
                  </td>
                </tr>
                <tr :class="matchSearch('trunk') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'trunk')">{{ $t('trunk') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.trunk"
                      true-value="open"
                      false-value="closed"
                      @click.stop="writeSignal({'trunk': signals.trunk === 'open' ? 'closed': 'open'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('turn_signal_left') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'turn_signal_left')">{{ $t('turn_signal_left') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.turn_signal_left"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'turn_signal_left': signals.turn_signal_left === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('turn_signal_right') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'turn_signal_right')"
                    >{{ $t('turn_signal_right') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.turn_signal_right"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'turn_signal_right': signals.turn_signal_right === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('warning_blinker') ? 'hightlighted' : ''">
                  <td>
                    <a @click="showPopover($event, 'warning_blinker')">{{ $t('warning_blinker') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.warning_blinker"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'warning_blinker': signals.warning_blinker === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
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
                <tr :class="matchSearch('windshield_wipers') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'windshield_wipers')"
                    >{{ $t('windshield_wipers') }}</a>
                  </td>
                  <td>
                    <v-switch
                      v-model="signals.windshield_wipers"
                      true-value="on"
                      false-value="off"
                      @click.stop="writeSignal({'windshield_wipers': signals.windshield_wipers === 'off' ? 'on': 'off'})"
                      hide-details
                    ></v-switch>
                  </td>
                </tr>
                <tr :class="matchSearch('wiping_water_level') ? 'hightlighted' : ''">
                  <td>
                    <a
                      @click="showPopover($event, 'wiping_water_level')"
                    >{{ $t('wiping_water_level') }}</a>
                  </td>
                  <td>
                    <v-progress-linear
                      class="elevation-3"
                      color="primary"
                      height="20"
                      :value="signals.wiping_water_level"
                      @click="showSliderDialog(0,100, 'wiping_water_level', signals.wiping_water_level, false)"
                    >{{ signals.wiping_water_level }}%</v-progress-linear>
                  </td>
                </tr>
              </table>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex xs12 sm6 md4>
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
          <l-map v-if="!sliderDialog" :zoom="zoom" :center="center" class="elevation-3">
            <l-tile-layer
              url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            ></l-tile-layer>
            <l-marker
              v-for="(marker, index) in markers"
              :key="index"
              :visible="true"
              :draggable="false"
              :lat-lng.sync="marker.position"
              :icon="marker.icon"
            ></l-marker>
          </l-map>
          <table>
            <tr :class="matchSearch('location') ? 'hightlighted' : ''">
              <td>
                <a @click="showPopover($event, 'location')">{{ $t('location') }}</a>
              </td>
              <td>{{ signals.location }}</td>
            </tr>
          </table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-show="!apiKey" fluid fill-height grid-list-md text-xs-center>
      <v-layout row wrap align-center>
        <v-flex class="display-1">
          First set
          <strong>Your API key</strong> in the input field on the right side of the upper menu ...
        </v-flex>
      </v-layout>
    </v-container>

    <v-menu v-model="popover.show" :position-x="popover.x" :position-y="popover.y">
      <v-card>
        <v-card-text>
          {{ popover.desc }}
          <v-divider></v-divider>values:
          <br>
          {{ popover.values }}
        </v-card-text>
      </v-card>
    </v-menu>

    <v-layout>
      <v-dialog lazy width="50%" v-model="sliderDialog">
        <v-card>
          <SliderDialog
            v-bind:modal="sliderDialog"
            v-on:close-dialog="sliderDialog = false"
            v-bind:config="sliderProps"
          ></SliderDialog>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
import classNames from "classnames";
import { mapState } from "vuex";
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import SliderDialog from "./../components/SliderDialog";
import { setTimeout } from "timers";

const Leaflet = eval("L");

export default {
  name: "page-home",
  components: { LMap, LTileLayer, LMarker, SliderDialog },
  data() {
    return {
      textSearch: null,
      signals: {},
      infotainment: null,
      infotainmentContentType: null,
      isApiKeyValid: null,
      isLoadingInfotainment: false,
      isLoadingSignals: false,
      lastKnownLocation: null,
      sliderDialog: false,
      sliderProps: {
        min: 0,
        max: 10,
        signal: "example",
        initValue: 5,
        descAllowed: false,
        nanAllowed: false
      },
      showIframe: false,
      popover: {
        show: false,
        desc: null,
        values: null
      },
      zoom: 15,
      center: Leaflet.latLng(50.782117, 6.047171),
      markers: [
        {
          position: Leaflet.latLng(50.782117, 6.047171),
          icon: Leaflet.icon({
            iconUrl: require("../assets/Map-Marker-PNG-Pic.png"),

            iconSize: [25, 40], // size of the icon
            iconAnchor: [12, 38] // point of the icon which will correspond to marker's location
          })
        }
      ]
    };
  },
  watch: {
    apiKey(value) {
      this.isApiKeyValid = null;

      if (value) {
        this.refresh(false);
      }
    },
    location(value) {
      if (value) {
        let updateMarkers = false;

        const CENTER = this.center;
        if (CENTER) {
          const NEW_LAT_LNG = Leaflet.latLng(value);

          updateMarkers =
            CENTER.lat !== NEW_LAT_LNG.lat || CENTER.lng !== NEW_LAT_LNG.lng;
        } else {
          updateMarkers = true;
        }

        if (updateMarkers) {
          this.center = Leaflet.latLng(value);
          this.markers.pop();
          this.markers.push({
            position: Leaflet.latLng(value),
            icon: Leaflet.icon({
              iconUrl: require("../assets/Map-Marker-PNG-Pic.png"),

              iconSize: [25, 40], // size of the icon
              iconAnchor: [12, 38] // point of the icon which will correspond to marker's location
            })
          });
        }
      } else {
        if (!this.center) {
          return;
        }

        this.center = value;
        this.markers.pop();
      }
    }
  },
  methods: {
    refresh(useCache) {
      this.checkIfValidApiKey();
      this.getSignals(useCache);
      this.getInfotainment(useCache);

      setTimeout(() => {
        this.refresh(true);
      }, 2000);
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
    checkIfValidApiKey() {
      if (!this.apiKey) return;

      if (null !== this.isApiKeyValid) {
        return;
      }

      let config = {
        headers: {
          "X-Api-Key": this.apiKey
        }
      };
      this.axios
        .get("/v1/vehicle", config)
        .then(response => {
          this.isApiKeyValid = 200 === response.status;
        })
        .catch(err => {
          this.isApiKeyValid = false;

          console.error("ERROR while getting '/v1/vehicle(1)': " + err);
        });
    },
    getSignals(useCache) {
      if (!this.apiKey) return;

      if (this.isLoadingSignals) {
        return;
      }
      this.isLoadingSignals = true;

      let config = {
        headers: {
          "X-Api-Key": this.apiKey
        }
      };
      this.axios
        .get("/v1/vehicle/signals?cache=" + (useCache ? "1" : "0"), config)
        .then(response => {
          this.isLoadingSignals = false;

          if (200 !== response.status) {
            console.warn(
              `Unexpected response code when getting '/v1/vehicle/signals(1)': ${
                response.status
              }`
            );
            return;
          }

          this.signals = response.data;
          this.showIframe = true;

          if (response.data) {
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

          console.error("ERROR while getting '/v1/vehicle/signals(1)': " + err);
        });
    },
    getInfotainment(useCache) {
      if (!this.apiKey) return;

      if (this.isLoadingInfotainment) {
        return;
      }
      this.isLoadingInfotainment = true;

      let config = {
        headers: {
          "X-Api-Key": this.apiKey
        },
        responseType: "arraybuffer"
      };
      this.axios
        .get("/v1/vehicle/infotainment?cache=" + (useCache ? "1" : "0"), config)
        .then(response => {
          this.isLoadingInfotainment = false;

          if (200 !== response.status) {
            console.warn(
              `Unexpected response code when getting '/v1/vehicle/infotainment(1)': ${
                response.status
              }`
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
            "ERROR while getting '/v1/vehicle/infotainment(1)': " + err
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
      let config = {
        headers: {
          "X-Api-Key": this.apiKey
        }
      };
      this.axios
        .patch("/v1/vehicle/signals", newValues, config)
        .then(response => {})
        .catch(err => {
          console.error(
            "ERROR while setting '/v1/vehicle/signals' (" +
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
        apiKey: this.apiKey
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
    classes() {
      return classNames(this.$options.name);
    },
    location() {
      let lat = 50.782117;
      let lon = 6.047171;
      if (this.signals.location) {
        [lat, lon] = this.signals.location.split(",");
        lat = Number(lat);
        lon = Number(lon);
      }
      return [lat, lon];
    },
    ...mapState(["apiKey"])
  },
  beforeMount() {
    this.refresh(false);
  }
};
</script>

<style scoped lang="scss">
@import "~leaflet/dist/leaflet.css";
@import "../styles/variables";
@import "../styles/functions";

.page-home {
  table {
    //width: 100%;
    border-collapse: collapse;

    tr {
      border-top: 1px solid #eee;

      &.hightlighted {
        background-color: rgba($primary-one, $lighter-3);
      }

      td {
        width: 50%;
        height: 30px;
        padding: 2px 8px;
        vertical-align: middle;

        a {
          color: black;

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

  /deep/ .v-progress-linear {
    margin: 0;

    .v-progress-linear__content {
      color: $white;
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
    background-image: url("../assets/Infotainmentsystem_mask.png");
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
}
</style>