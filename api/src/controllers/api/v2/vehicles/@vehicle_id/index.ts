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

import * as _ from 'lodash';
import * as database from '../../../../../database';
import * as egoose from '@egodigital/egoose';
import * as joi from 'joi';
import { DELETE, GET, PATCH, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from './_share';
import { HttpResult } from '../../../../_share';


interface UpdateVehicleOptions {
    name?: string;
    status?: string;
}


const UPDATE_VEHICLE_OPTIONS_SCHEMA = joi.object({
    name: joi.string()
        .min(0)
        .max(256)
        .optional()
        .allow(null, ''),
    status: joi.string()
        .optional()
        .allow(null, '', 'available', 'blocked', 'charging'),
});


/**
 * Controller for /api/v2/vehicles/:vehicle_id endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @GET('/')
    @Swagger({
        "summary": "Returns the information of the vehicle.",
        "produces": [
            "application/json"
        ],
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "schema": {
                    "$ref": "#/definitions/GetVehicleResponse"
                }
            },
        }
    })
    public get_vehicle(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_DOC = await db.Vehicles
                .findById(req.vehicle.id)
                .exec();

            if (VEHICLE_DOC) {
                return await database.vehicleToJSON(VEHICLE_DOC, db);
            }

            return HttpResult.NotFound((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `Vehicle '${req.vehicle.id}' not found!`,
                });
            });
        });
    }

    @PATCH('/', UPDATE_VEHICLE_OPTIONS_SCHEMA)
    @Swagger({
        "summary": "Updates a vehicle.",
        "consumes": [
            "application/json"
        ],
        "parameters": [
            {
                "in": "body",
                "name": "updateVehicleOptions",
                "description": "The data to update.",
                "required": true,
                "schema": {
                    "$ref": "#/definitions/UpdateVehicleRequest"
                }
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/UpdateVehicleResponse"
                }
            },
        }
    })
    public async update_vehicle(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        const OPTS: UpdateVehicleOptions = req.body;

        const NEW_DATA: any = {
            'last_update': egoose.utc()
                .toISOString(),
        };

        if (!_.isUndefined(OPTS.name)) {
            const NEW_NAME = egoose.toStringSafe(OPTS.name)
                .trim();

            NEW_DATA['name'] = '' === NEW_NAME ?
                null : NEW_NAME;
        }

        if (!egoose.isEmptyString(OPTS.status)) {
            NEW_DATA['status'] = OPTS.status;
        }

        return this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, NEW_DATA).exec();

            const NEW_DOC = await db.Vehicles
                .findById(req.vehicle.id)
                .exec();

            return await database.vehicleToJSON(NEW_DOC, db);
        }, true);
    }

    @DELETE('/')
    @Swagger({
        "summary": "Resets the complete vehicle.",
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "schema": {
                    "$ref": "#/definitions/DeleteVehicleResponse"
                }
            },
        }
    })
    public async reset_vehicle(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return await this.__app.withDatabase(async (db) => {
            const VEHICLE_DOC = await db.Vehicles
                .findById(req.vehicle.id)
                .exec();

            if (!VEHICLE_DOC) {
                return HttpResult.NotFound((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                    return res.json({
                        success: false,
                        data: `Vehicle '${req.vehicle.id}' not found!`,
                    });
                });
            }

            // events
            await db.VehicleEvents.deleteMany({
                'vehicle_id': req.vehicle.id,
            }).exec();

            // signals
            await db.VehicleSignals.deleteMany({
                'vehicle_id': req.vehicle.id,
            }).exec();

            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, {
                '$unset': {
                    'infotainment': "",
                    'infotainment_mime': "",
                    'last_update': "",
                    'name': "",
                    'state': "",
                }
            }).exec();

            return await database.vehicleToJSON(VEHICLE_DOC, db);
        }, true);
    }
}
