/**
 * This file is part of the vehicle-booking-api distribution (https://github.com/egodigital/hackathon/api).
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
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as vehicles from '../../../../../../vehicles';
import { DELETE, GET, PATCH, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { KEY_SIGNALS, NOT_FOUND } from '../../../../../../contracts';
import { HttpResult } from '../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/signals endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @GET('/')
    @Swagger({
        "summary": "Gets a list of all signals.",
        "parameters": [
            {
                "in": "query",
                "name": "cache",
                "required": false,
                "type": "number",
                "enum": [
                    0,
                    1
                ],
                "default": 0,
                "description": "Use cache or not."
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleSignalListResponse"
                }
            },
            "304": {
                "description": "Data has not been modified."
            },
        }
    })
    public async get_vehicle_signals(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        // TODO: implement
        // @ts-ignore
        const USE_CACHE = '1' === egoose.toStringSafe(req.query.cache)
            .trim();

        let allSignals: any = await req.vehicle
            .cache.get(KEY_SIGNALS, NOT_FOUND);
        if (_.isSymbol(allSignals)) {
            allSignals = await req.vehicle.signals._getAll();

            await req.vehicle
                .cache.set(KEY_SIGNALS, allSignals);
        }

        return allSignals;
    }

    @PATCH({
        path: '/',
        use: express.json(),
    })
    @Swagger({
        "summary": "Updates a list of one or more vehicle signals.",
        "produces": [
            "application/json"
        ],
        "parameters": [
            {
                "in": "body",
                "name": "listOfVehicleSignalsToUpdate",
                "required": true,
                "schema": {
                    "$ref": "#/definitions/VehicleSignalListForPatchExample"
                },
                "description": "A list of one or more value signals to update."
            }
        ],
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "type": "object",
                "schema": {
                    "$ref": "#/definitions/VehicleSignalListResponse"
                }
            },
            "406": {
                "description": "At least one patch failed.",
                "schema": {
                    "$ref": "#/definitions/ErrorResponse"
                }
            },
        }
    })
    public async set_vehicle_signals(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        const VALUES: vehicles.VehicleSignalValueList = req.body;

        let allSignals: vehicles.VehicleSignalValueList;
        try {
            for (const NAME in VALUES) {
                const SIGNAL_SET = await req.vehicle.signals._set(
                    NAME, VALUES[NAME]
                );

                if (!SIGNAL_SET) {
                    return HttpResult.NotAcceptable((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                        return res.json({
                            success: false,
                            data: `PATCH FAILED: Signal '${NAME}' does not exist!`,
                        });
                    });
                }
            }
        } catch (e) {
            return HttpResult.NotAcceptable((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `ERROR: '${egoose.toStringSafe(e)}'`,
                });
            });
        } finally {
            // update cache

            allSignals = await req.vehicle.signals._getAll();
            await req.vehicle
                .cache.set(KEY_SIGNALS, allSignals);
        }

        return allSignals;
    }

    @DELETE('/')
    @Swagger({
        "summary": "Resets all signals.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleSignalListResponse"
                }
            },
        }
    })
    public async reset_signals(req: ApiV2VehicleRequest, res: ApiV2VehicleRequest) {
        return await this.__app.withDatabase(async (db) => {
            await db.VehicleSignals.deleteMany({
                'vehicle_id': req.vehicle.id,
            }).exec();

            const ALL_SIGNALS = await req.vehicle.signals._getAll();
            await req.vehicle
                .cache
                .set(KEY_SIGNALS, ALL_SIGNALS);

            return ALL_SIGNALS;
        });
    }
}
