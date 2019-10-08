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
import { APIv2VehicleBookingControllerBase, ApiV2VehicleBookingRequest, ApiV2VehicleBookingResponse } from './_share';
import { HttpResult } from '../../../../../../_share';


/**
 * Controller for /api/v2/vehicles/:vehicle_id/bookings/:booking_id endpoints.
 */
export class Controller extends APIv2VehicleBookingControllerBase {
    /**
     * [GET]  /
     */
    @GET()
    @Swagger({
        "summary": "Returns a list of all bookings of a vehicle.",
        "parameters": [{
            "in": "query",
            "name": "from",
            "description": "The filter for start date (UTC).",
            "required": false,
            "example": "2019-09-05T23:09:19.790Z",
            "type": "string"
        }, {
            "in": "query",
            "name": "until",
            "description": "The filter for end date (UTC).",
            "required": false,
            "example": "2019-09-23T05:09:19.790Z",
            "type": "string"
        }],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleBookingItem"
                }
            },
        },
    })
    public index(req: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_ID = egoose.normalizeString(req.params['vehicle_id']);

            const VEHICLE_DOC = await db.Vehicles
                .findOne({
                    '_id': VEHICLE_ID,
                    'team_id': req.team.id,
                }).exec();

            if (VEHICLE_DOC) {
                const BOOKING_ID = egoose.normalizeString(req.params['booking_id']);

                const BOOKING_FILTER: any = {
                    '$and': [{
                        'id': BOOKING_ID,
                    }, {
                        'vehicle_id': VEHICLE_DOC.id,
                    }],
                };

                let from: string | moment.Moment = egoose.toStringSafe(req.query['from'])
                    .trim();
                if ('' !== from) {
                    from = moment.utc(from);
                    if (!from.isValid()) {
                        return HttpResult.BadRequest((_: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse) => {
                            return res.json({
                                success: false,
                                data: `Invalid 'from' date!`,
                            });
                        });
                    }

                    BOOKING_FILTER['$and'].push({
                        'time': {
                            '$gte': from.toDate(),
                        }
                    });
                }

                let until: string | moment.Moment = egoose.toStringSafe(req.query['until'])
                    .trim();
                if ('' !== until) {
                    until = moment.utc(until);
                    if (!until.isValid()) {
                        return HttpResult.BadRequest((_: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse) => {
                            return res.json({
                                success: false,
                                data: `Invalid 'until' date!`,
                            });
                        });
                    }

                    BOOKING_FILTER['$and'].push({
                        'time': {
                            '$lte': until.toDate(),
                        }
                    });
                }

                let status = egoose.normalizeString(req.query['status'])
                    .trim();
                if ('' !== status) {
                    BOOKING_FILTER['$and'].push({
                        'status': status,
                    });
                }

                const BOOKING_DOC = await db.VehicleBookings
                    .findOne(BOOKING_FILTER)
                    .exec();

                if (BOOKING_DOC) {
                    return {
                        event: egoose.normalizeString(BOOKING_DOC.event),
                        id: BOOKING_DOC.id,
                        status: egoose.normalizeString(BOOKING_DOC.status),
                        time: moment.utc(BOOKING_DOC.time)
                            .toISOString(),
                    };
                }
            }

            return HttpResult.NotFound();
        });
    }
}
