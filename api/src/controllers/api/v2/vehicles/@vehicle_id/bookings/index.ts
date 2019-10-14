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
import { logBooking } from '../../_share';
import { VehicleBooking } from '../../../../../../contracts';


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
        "summary": "Returns a list of bookings of a vehicle, with optional filters.",
        "parameters": [{
            "in": "query",
            "name": "from",
            "description": "The filter for start date (UTC).",
            "required": false,
            "example": "2019-09-05T23:09:19.790Z",
            "type": "string"
        }, {
            "in": "status",
            "name": "from",
            "description": "The filter for the status.",
            "required": false,
            "example": "finished",
            "type": "string"
        }, {
            "in": "query",
            "name": "until",
            "description": "The filter for end date (UTC).",
            "required": false,
            "example": "2019-09-23T05:09:19.790Z",
            "type": "string"
        }, {
            "in": "query",
            "name": "vehicle",
            "description": "The filter for the ID of the vehicle.",
            "required": false,
            "example": "5d9c5d82734cb701240245d8",
            "type": "string"
        }],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleBookingListResponse"
                }
            },
            "400": {
                "schema": {
                    "$ref": "#/definitions/ErrorResponse"
                }
            },
        },
    })
    public get_vehicle_bookings(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const BOOKINGS_FILTER: any = {
                '$and': [{
                    'vehicle_id': req.vehicle.id,
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

            let vehicle = egoose.normalizeString(req.query['vehicle']);
            if ('' !== vehicle) {
                BOOKINGS_FILTER['$and'].push({
                    'vehicle_id': vehicle,
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
                .sort({
                    'time': 1,
                    '_id': 1,
                })
                .exec();

            const RESULT: any[] = [];
            for (const B of BOOKING_DOCS) {
                RESULT.push(
                    await database.vehicleBookingToJSON(B, db)
                );
            }

            return RESULT;
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
            "409": {
                "description": "There is still an active booking.",
                "schema": {
                    "$ref": "#/definitions/ErrorResponse"
                }
            },
        },
    })
    public create_vehicle_booking(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        return this.__app.withDatabase(async db => {
            const NEW_BOOKING: NewVehicleBooking = req.body;

            if ('charging' === egoose.normalizeString(req.vehicle.status)) {
                return HttpResult.PreconditionFailed((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                    return res.json({
                        success: false,
                        data: `Vehicle is charging!`,
                    });
                });
            }

            const CREATE_BOOKING = async () => {
                const NEW_DOC = (await db.VehicleBookings.insertMany([{
                    'event': 'created',
                    'from': moment.utc(NEW_BOOKING.from)
                        .toDate(),
                    'status': 'new',
                    'until': moment.utc(NEW_BOOKING.until)
                        .toDate(),
                    'vehicle_id': req.vehicle.id,
                }]))[0];

                const BOOKING: VehicleBooking = {
                    event: NEW_DOC.event,
                    id: NEW_DOC.id,
                    status: NEW_DOC.status,
                    time: moment.utc(NEW_DOC.time),
                    vehicle: req.vehicle,
                };

                await logBooking(
                    db, req, BOOKING
                );

                return await database.vehicleBookingToJSON(NEW_DOC, db);
            };

            let latestBooking = await db.VehicleBookings
                .findOne({
                    '$and': [
                        {
                            '$or': [
                                {
                                    'status': 'active',
                                },
                                {
                                    'status': 'new',
                                }
                            ]
                        },
                        {
                            'vehicle_id': req.vehicle.id,
                        }
                    ],
                })
                .sort({
                    'time': -1,
                    '_id': -1,
                })
                .exec();
            if (!latestBooking) {


                return CREATE_BOOKING();
            }

            return HttpResult.Conflict((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `There is already a booking (${
                        latestBooking.id
                        }) with status '${
                        egoose.normalizeString(latestBooking.status)
                        }'!`,
                });
            });
        }, true);
    }
}
