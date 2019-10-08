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

import * as egoose from '@egodigital/egoose';
import { GET, Swagger } from '@egodigital/express-controllers';
import { APIv2EnvironmentControllerBase, ApiV2EnvironmentRequest, ApiV2EnvironmentResponse } from '../_share';
import { HttpResult } from '../../../../../_share';


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
            const ENVIROMENT_ID = egoose.normalizeString(req.params['environment_id']);

            const ENV_DOC = await db.Environments
                .findOne({
                    '_id': ENVIROMENT_ID,
                    'team_id': req.team.id,
                }).exec();

            if (ENV_DOC) {
                const VEHICLE_DOCS = await db.Vehicles
                    .find({
                        'environment_id': ENV_DOC.id,
                        'team_id': req.team.id,
                    }).exec();

                return egoose.from(VEHICLE_DOCS).select(v => {
                    return {
                        country: egoose.isEmptyString(v.country) ?
                            'D' : egoose.toStringSafe(v.country).toUpperCase().trim(),
                        id: v.id,
                        license_plate: egoose.toStringSafe(v.license_plate)
                            .toUpperCase()
                            .trim(),
                        manufacturer: egoose.toStringSafe(v.manufacturer)
                            .trim(),
                        model: egoose.toStringSafe(v.model_name)
                            .trim(),
                    };
                });
            }

            return HttpResult.NotFound();
        });
    }
}
