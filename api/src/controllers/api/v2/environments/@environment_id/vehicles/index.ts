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

import * as database from '../../../../../../database';
import { GET, Swagger } from '@egodigital/express-controllers';
import { APIv2EnvironmentControllerBase, ApiV2EnvironmentRequest, ApiV2EnvironmentResponse } from '../_share';


/**
 * Controller for /api/v2/environments/:environment_id/vehicles endpoints.
 */
export class Controller extends APIv2EnvironmentControllerBase {
    /**
     * [GET]  /
     */
    @GET()
    @Swagger({
        "summary": "Returns a list of all vehicles of an environment.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleListResponse"
                }
            },
        },
    })
    public index(req: ApiV2EnvironmentRequest, res: ApiV2EnvironmentResponse) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_DOCS = await db.Vehicles
                .find({
                    'environment_id': req.environment.id,
                    'team_id': req.team.id,
                }).exec();

            const RESULT: any[] = [];
            for (const V of VEHICLE_DOCS) {
                RESULT.push(
                    await database.vehicleToJSON(V, db)
                );
            }

            return RESULT;
        });
    }
}
