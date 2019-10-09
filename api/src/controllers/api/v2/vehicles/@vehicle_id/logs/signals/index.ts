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
import * as database from '../../../../../../../database';
import * as egoose from '@egodigital/egoose';
import { DELETE, GET, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../../_share';
import { HttpResult } from '../../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/logs/signals endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @GET('/')
    @Swagger({
        "summary": "Gets vehicle signal logs.",
        "produces": [
            "application/json"
        ],
        "parameters": [
            {
                "in": "query",
                "required": false,
                "description": "The maximum number of results.",
                "type": "number",
                "name": "limit",
                "default": 100
            },
            {
                "in": "query",
                "required": false,
                "description": "The maximum number of results.",
                "type": "number",
                "name": "limit",
                "default": 100
            },
            {
                "in": "query",
                "required": false,
                "description": "The zero based offset.",
                "type": "number",
                "name": "offset",
                "default": 0
            },
            {
                "in": "query",
                "required": false,
                "description": "Sort order.",
                "type": "string",
                "name": "sort",
                "enum": [
                    "asc",
                    "desc"
                ],
                "example": "asc",
                "default": "desc"
            },
            {
                "in": "query",
                "required": false,
                "description": "Regex filter for signal name (case insensitive).",
                "type": "string",
                "name": "filter",
                "example": "(turn_signal_right)"
            }
        ],
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "schema": {
                    "$ref": "#/definitions/VehicleSignalLogListResponse"
                }
            },
        }
    })
    public async get_signal_logs(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        let limit = parseInt(
            egoose.toStringSafe(req.query.limit)
                .trim()
        );
        if (isNaN(limit)) {
            limit = 100;
        }
        limit = Math.max(limit, 1);
        limit = Math.min(limit, 100);

        let offset = parseInt(
            egoose.toStringSafe(req.query.offset)
                .trim()
        );
        if (isNaN(offset)) {
            offset = 0;
        }
        offset = Math.max(offset, 0);

        let filter: RegExp;
        if (!egoose.isEmptyString(req.query.filter)) {
            filter = new RegExp(req.query.filter, 'i');
        }

        const SORT_ASC = 'asc' === egoose.normalizeString(req.query.sort);

        return await this.__app.withDatabase(async (db) => {
            const FILTER: any = {
                'vehicle_id': req.vehicle.id,
            };

            if (!_.isNil(filter)) {
                FILTER['name'] = filter;
            }

            const DOCS = await db.VehicleSignalLogs
                .find(FILTER)
                .limit(limit)
                .skip(offset)
                .sort({
                    'creation_time': SORT_ASC ? 1 : -1,
                    '_id': SORT_ASC ? 1 : -1,
                })
                .exec();

            const RESULT: any[] = [];
            for (const D of DOCS) {
                RESULT.push(
                    await database.vehicleSignalLogToJSON(D, db)
                );
            }

            return RESULT;
        });
    }

    @DELETE('/')
    @Swagger({
        "summary": "Deletes all vehicle signal logs.",
        "responses": {
            "204": {},
        }
    })
    public async delete_signal_logs(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return await this.__app.withDatabase(async (db) => {
            await db.VehicleSignalLogs.deleteMany({
                'vehicle_id': req.vehicle.id,
            }).exec();

            return HttpResult.NoContent();
        });
    }
}
