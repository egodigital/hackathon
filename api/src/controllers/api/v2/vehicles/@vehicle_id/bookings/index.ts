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
import * as moment from 'moment';
import { GET, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { HttpResult } from '../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/bookings endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    /**
     * [GET]  /
     */
    @GET()
    @Swagger({
        "summary": "Returns a list of all bookings of a vehicle.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleBookingListResponse"
                }
            },
        },
    })
    public index(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_ID = egoose.normalizeString(req.params['vehicle_id']);

            const VEHICLE_DOC = await db.Vehicles
                .findOne({
                    '_id': VEHICLE_ID,
                    'team_id': req.team.id,
                }).exec();

            if (VEHICLE_DOC) {
                const BOOKING_DOCS = await db.VehicleBookings
                    .find({
                        'vehicle_id': VEHICLE_DOC.id,
                    }).exec();

                return egoose.from(BOOKING_DOCS).select(b => {
                    return {
                        event: egoose.normalizeString(b.event),
                        id: b.id,
                        status: egoose.normalizeString(b.status),
                        time: moment.utc(b.time)
                            .toISOString(),
                    };
                });
            }

            return HttpResult.NotFound();
        });
    }
}
