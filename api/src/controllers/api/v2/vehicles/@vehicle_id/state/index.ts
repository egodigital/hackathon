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
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import { DELETE, GET, PATCH, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { HttpResult } from '../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/state endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @PATCH({
        path: '/',
        use: express.json(),
    })
    @Swagger({
        "summary": "Sets a state value for the vehicle.",
        "tags": [
            "v1"
        ],
        "consumes": [
            "application/json"
        ],
        "parameters": [
            {
                "in": "header",
                "name": "X-Api-Key",
                "required": true,
                "type": "string",
                "description": "The API key."
            },
            {
                "in": "body",
                "name": "NewVehicleStateValue",
                "required": true,
                "description": "The new value."
            }
        ],
        "responses": {
            "200": {},
            "401": {
                "description": "Wrong API key."
            },
            "500": {
                "description": "Server error."
            }
        }
    })
    public set_vehicle_state(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, {
                'last_update': egoose.utc()
                    .toDate(),
                'state': req.body,
            }).exec();

            return HttpResult.OK(req.body);
        }, true);
    }

    @DELETE('/')
    @Swagger({
        "summary": "Unsets the state value for the vehicle.",
        "consumes": [
            "application/json"
        ],
        "responses": {
            "200": {},
        }
    })
    public async unset_vehicle_state(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        const CURRENT_STATE = req.vehicle.state;

        await this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, {
                'last_update': egoose.utc()
                    .toDate(),
                '$unset': {
                    'state': "",
                },
            }).exec();
        });

        return HttpResult.OK(CURRENT_STATE);
    }

    @GET('/')
    @Swagger({
        "summary": "Gets the state value of the vehicle.",
        "consumes": [
            "application/json"
        ],
        "responses": {
            "200": {},
        }
    })
    public async get_vehicle_state(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return HttpResult.OK(req.vehicle.state);
    }
}
