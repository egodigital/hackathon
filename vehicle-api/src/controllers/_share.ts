/**
 * This file is part of the vehicle-api distribution (https://github.com/egodigital/hackathon/vehicle-api).
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as diagnostics from '../diagnostics';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { withDatabase } from '../database';
import { ControllerBase as ControllerBase_ExpressControllers, RequestErrorHandlerContext } from '@egodigital/express-controllers';


/**
 * @swaggerDefinition
 *
 * Vehicle:
 *   type: object
 *   required:
 *     - id
 *   properties:
 *     id:
 *       type: string
 *       description: The UUID of the vehicle.
 *       example: '05091979-2309-1979-0509-197923091979'
 *     last_update:
 *       type: string
 *       description: The time the vehicle has been updated.
 *       example: '1979-09-23T05:09:19.790Z'
 *     name:
 *       type: string
 *       description: The display name.
 *       example: 'My e.GO Life'
 *     state:
 *       description: A state value.
 */

/**
 * @swaggerDefinition
 *
 * VehicleEvent:
 *   type: object
 *   properties:
 *     creation_time:
 *       type: string
 *       description: The time the dataset has been created.
 *       example: '1979-09-05T23:09:19.790Z'
 *     id:
 *       type: string
 *       description: The ID of the entry.
 *       example: '012345678901234567890123'
 *     is_handled:
 *       type: boolean
 *       description: Indicates if event has been handled or not.
 *       example: true
 *     last_update:
 *       type: string
 *       description: The time the dataset has been updated.
 *       example: '1979-09-23T05:09:19.790Z'
 *     name:
 *       type: string
 *       description: The name.
 *       example: 'door_opened'
 *     data:
 *       description: The data.
 *       example: 'front_right'
 */

/**
 * @swaggerDefinition
 *
 * VehicleSignalList:
 *   type: object
 *   properties:
 *     brake_fluid_level:
 *       type: number
 *       default: 100
 *     battery_charging:
 *       type: string
 *       default: 'no'
 *     battery_charging_current:
 *       type: number
 *       default: 16
 *     battery_health:
 *       type: number
 *       default: 100
 *     battery_loading_capacity:
 *       type: number
 *       default: 11
 *     battery_state_of_charge:
 *       type: number
 *       default: 100
 *     calculated_remaining_distance:
 *       type: number
 *       default: 150
 *     central_locking_system:
 *       type: string
 *       default: closed
 *     distance_to_object_back:
 *       type: number
 *       default: -1
 *     distance_to_object_bottom:
 *       type: number
 *       default: 20
 *     distance_to_object_front:
 *       type: number
 *       default: -1
 *     distance_to_object_left:
 *       type: number
 *       default: -1
 *     distance_to_object_right:
 *       type: number
 *       default: -1
 *     distance_trip:
 *       type: number
 *       default: 0
 *     door_disc_front_left:
 *       type: string
 *       default: closed
 *     door_disc_front_right:
 *       type: string
 *       default: closed
 *     door_front_left:
 *       type: string
 *       default: closed
 *     door_front_right:
 *       type: string
 *       default: closed
 *     drive_mode:
 *       type: string
 *       default: eco
 *     flash:
 *       type: string
 *       default: 'off'
 *     heated_seats:
 *       type: string
 *       default: 'off'
 *     high_beam:
 *       type: string
 *       default: 'off'
 *     infotainment:
 *       type: string
 *       description: ''
 *       default: 'off'
 *     infotainment_volume:
 *       type: number
 *       default: 8
 *     location:
 *       type: string
 *       default: '51,7'
 *     mileage:
 *       type: number
 *       default: 0
 *     motor_control_lamp:
 *       type: string
 *       default: 'off'
 *     person_count:
 *       type: number
 *       default: 0
 *     pulse_sensor_steering_wheel:
 *       type: number
 *       default: -1
 *     power_consumption:
 *       type: number
 *       default: 0
 *     rain_sensor:
 *       type: string
 *       default: no_rain
 *     rear_running_lights:
 *       type: string
 *       default: 'off'
 *     side_lights:
 *       type: string
 *       default: 'off'
 *     speed:
 *       type: number
 *       default: 0
 *     stop_lights:
 *       type: string
 *       default: 'off'
 *     temperature_inside:
 *       type: number
 *       default: 20
 *     temperature_outside:
 *       type: number
 *       default: 10
 *     tire_pressure_back_left:
 *       type: number
 *       default: 3
 *     tire_pressure_back_right:
 *       type: number
 *       default: 3
 *     tire_pressure_front_left:
 *       type: number
 *       default: 3
 *     tire_pressure_front_right:
 *       type: number
 *       default: 3
 *     trunk:
 *       type: string
 *       default: closed
 *     turn_signal_left:
 *       type: string
 *       default: 'off'
 *     turn_signal_right:
 *       type: string
 *       default: 'off'
 *     warning_blinker:
 *       type: string
 *       default: 'off'
 *     weight:
 *       type: number
 *       default: 1200
 *     windshield_wipers:
 *       type: string
 *       default: 'off'
 *     wiping_water_level:
 *       type: number
 *       default: 100
 */

/**
 * @swaggerDefinition
 *
 * VehicleSignalListForPatchExample:
 *   type: object
 *   properties:
 *     location:
 *       type: string
 *       default: '51,7'
 *     turn_signal_left:
 *       type: string
 *       default: 'on'
 *     turn_signal_right:
 *       type: string
 *       default: 'on'
 */

/**
 * @swaggerDefinition
 *
 * VehicleSignalLog:
 *   type: object
 *   properties:
 *     creation_time:
 *       type: string
 *       description: The time the dataset has been created.
 *       example: '1979-09-05T23:09:19.790Z'
 *     id:
 *       type: string
 *       description: The ID of the entry.
 *       example: '012345678901234567890123'
 *     name:
 *       type: string
 *       description: The name of the signal.
 *       example: 'location'
 *     old_data:
 *       type: string
 *       description: The old value.
 *       example: '50.782117,6.047171'
 *     new_data:
 *       type: string
 *       description: The new value.
 *       example: '50.775294,6.133131'
 */


/**
 * A request.
 */
export interface Request extends express.Request {
}


/**
 * A basic controller.
 */
export abstract class ControllerBase extends ControllerBase_ExpressControllers {
    /**
     * Loads a file from '/res' folder.
     *
     * @param {string} p The relative path.
     *
     * @return {Promise<Buffer>} The promise with the loaded data.
     */
    public async _loadResource(p: string): Promise<Buffer> {
        return await fsExtra.readFile(
            path.resolve(
                path.join(
                    __dirname, '../res', egoose.toStringSafe(p)
                )
            )
        );
    }

    /**
     * Gets the logger of that controller.
     */
    public get _logger(): egoose.Logger {
        return diagnostics.getLogger();
    }

    /** @inheritdoc */
    public __error(ctx: RequestErrorHandlerContext) {
        return ctx.response
            .status(500)
            .send('ERROR: ' + ctx.error);
    }

    /** @inheritdoc */
    public readonly _withDatabase = withDatabase;
}
