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
import * as egoose from '@egodigital/egoose';
import { PATCH, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleBookingControllerBase, ApiV2VehicleBookingRequest, ApiV2VehicleBookingResponse } from './_share';
import { logBooking } from '../../_share';
import { HttpResult } from '../../../../../_share';


/**
 * Controller for /api/v2/vehicles/bookings/:booking_id/finish endpoints.
 */
export class Controller extends APIv2VehicleBookingControllerBase {
    /**
     * [PATCH]  /
     */
    @PATCH('/')
    @Swagger({
        "summary": "Finishes a booking.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleBookingItem"
                }
            },
            "400": {
                "schema": {
                    "$ref": "#/definitions/ErrorResponse"
                }
            },
        },
    })
    public cancel_vehicle_booking(req: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse) {
        return this.__app.withDatabase(async db => {
            const NOW = egoose.utc();

            if ('active' === egoose.normalizeString(req.booking.status)) {
                let newEvent: string;
                if (NOW.isSameOrBefore(req.booking.time)) {
                    newEvent = 'finished_in_time';
                } else {
                    newEvent = 'finished_late';
                }

                await db.VehicleBookings
                    .updateOne({
                        '_id': req.booking.id,
                    }, {
                        'event': newEvent,
                        'status': 'finished',
                    })
                    .exec();

                await logBooking(
                    db, req, req.booking,
                    {
                        'event': newEvent,
                        'status': 'finished',
                    }
                );

                const BOOKING_DOC = await db.VehicleBookings
                    .findById(req.booking.id)
                    .exec();

                return await database.vehicleBookingToJSON(
                    BOOKING_DOC, db
                );
            }

            return HttpResult.BadRequest((req: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse) => {
                return res.json({
                    success: false,
                    data: `Booking status is '${req.booking.status}' and must be one of the following values: 'active'`,
                });
            });
        });
    }
}
