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
import * as database from '../../../../../../database';
import * as egoose from '@egodigital/egoose';
import { DELETE, GET, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { HttpResult } from '../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/events endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @GET('/')
    @Swagger({
        "summary": "Gets a list of unhandled events and marks them as handled.",
        "produces": [
            "application/json"
        ],
        "parameters": [
            {
                "in": "query",
                "required": false,
                "description": "Regex filter for event name (case insensitive).",
                "type": "string",
                "name": "filter",
                "example": "(signal_change)"
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleEventListResponse"
                }
            },
        }
    })
    public async get_events(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        const NOW = egoose.utc();

        let filter: RegExp;
        if (!egoose.isEmptyString(req.query.filter)) {
            filter = new RegExp(req.query.filter, 'i');
        }

        return await this.__app.withDatabase(async (db) => {
            const FILTER: any = {
                "is_handled": false,
                'vehicle_id': req.vehicle.id,
            };

            if (!_.isNil(filter)) {
                FILTER['name'] = filter;
            }

            const DOCS = await db.VehicleEvents
                .find(FILTER)
                .sort({
                    'creation_time': 1,
                    '_id': 1,
                })
                .limit(100)
                .exec();

            // mark as 'handled'
            for (const D of DOCS) {
                await db.VehicleEvents.updateOne({
                    '_id': D._id
                }, {
                    'is_handled': true,
                    'last_update': NOW.toDate(),
                }).exec();
            }

            const RESULT: any[] = [];
            for (const D of DOCS) {
                const ITEM = await database.vehicleEventToJSON(D, db);
                ITEM.isHandled = true;
                ITEM.lastUpdate = NOW.toISOString();

                RESULT.push(ITEM);
            }

            return RESULT;
        }, true);
    }

    @DELETE('/')
    @Swagger({
        "summary": "Removes the complete queue of events.",
        "responses": {
            "204": {},
        }
    })
    public async delete_events(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return await this.__app.withDatabase(async (db) => {
            await db.VehicleEvents.deleteMany({
                'vehicle_id': req.vehicle.id,
            }).exec();

            return HttpResult.NoContent();
        });
    }
}
