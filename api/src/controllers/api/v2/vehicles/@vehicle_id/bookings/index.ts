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
import * as joi from 'joi';
import * as moment from 'moment';
import { GET, POST, Swagger } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { HttpResult } from '../../../../../_share';


interface NewVehicleBooking {
    from: string;
    until: string;
}

const SCHEMA_NEW_VEHICLE_BOOKING = joi.object({
    'from': joi.string()
        .trim()
        .isoDate()
        .required(),
    'until': joi.string()
        .trim()
        .isoDate()
        .required(),
});


/**
 * Controller for /api/v2/vehicles/:vehicle_id/bookings endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    /**
     * [GET]  /
     */
    @GET('/')
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
    public get_vehicle_bookings(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_ID = egoose.normalizeString(req.params['vehicle_id']);

            const VEHICLE_DOC = await db.Vehicles
                .findOne({
                    '_id': VEHICLE_ID,
                    'team_id': req.team.id,
                }).exec();

            if (VEHICLE_DOC) {
                const BOOKINGS_FILTER: any = {
                    '$and': [{
                        'vehicle_id': VEHICLE_DOC.id,
                    }]
                };

                let from: string | moment.Moment = egoose.toStringSafe(req.query['from'])
                    .trim();
                if ('' !== from) {
                    from = moment.utc(from);
                    if (!from.isValid()) {
                        return HttpResult.BadRequest((_: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                            return res.json({
                                success: false,
                                data: `Invalid 'from' date!`,
                            });
                        });
                    }

                    BOOKINGS_FILTER['$and'].push({
                        'from': {
                            '$gte': from.toDate(),
                        }
                    });
                }

                let until: string | moment.Moment = egoose.toStringSafe(req.query['until'])
                    .trim();
                if ('' !== until) {
                    until = moment.utc(until);
                    if (!until.isValid()) {
                        return HttpResult.BadRequest((_: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                            return res.json({
                                success: false,
                                data: `Invalid 'until' date!`,
                            });
                        });
                    }

                    BOOKINGS_FILTER['$and'].push({
                        'until': {
                            '$lte': until.toDate(),
                        }
                    });
                }

                let status = egoose.normalizeString(req.query['status'])
                    .trim();
                if ('' !== status) {
                    BOOKINGS_FILTER['$and'].push({
                        'status': status,
                    });
                }

                const BOOKING_DOCS = await db.VehicleBookings
                    .find(BOOKINGS_FILTER)
                    .exec();

                const RESULT: any[] = [];
                for (const B of BOOKING_DOCS) {
                    RESULT.push(
                        await database.vehicleBookingToJSON(B, db)
                    );
                }

                return RESULT;
            }

            return HttpResult.NotFound();
        });
    }

    /**
     * [POST]  /
     */
    @POST('/', SCHEMA_NEW_VEHICLE_BOOKING)
    @Swagger({
        "summary": "Creates a new booking for a vehicle.",
        "parameters": [
            {
                "in": "body",
                "name": "body",
                "description": "Options for a request.",
                "required": true,
                "schema": {
                    "$ref": "#/definitions/CreateVehicleBookingRequest"
                }
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleBookingListResponse"
                }
            },
        },
    })
    public create_vehicle_booking(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const NEW_BOOKING: NewVehicleBooking = req.body;

            const VEHICLE_ID = egoose.normalizeString(req.params['vehicle_id']);

            const VEHICLE_DOC = await db.Vehicles
                .findOne({
                    '_id': VEHICLE_ID,
                    'team_id': req.team.id,
                }).exec();

            if (VEHICLE_DOC) {
                const NEW_DOC = (await db.VehicleBookings.insertMany([{
                    'event': 'created',
                    'from': moment.utc(NEW_BOOKING.from)
                        .toDate(),
                    'status': 'new',
                    'until': moment.utc(NEW_BOOKING.until)
                        .toDate(),
                    'vehicle_id': VEHICLE_DOC.id,
                }]))[0];

                return await database.vehicleBookingToJSON(NEW_DOC, db);
            }

            return HttpResult.NotFound();
        });
    }
}
