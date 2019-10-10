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

import * as database from '../../../../database';
import * as egoose from '@egodigital/egoose';
import * as moment from 'moment';
import { GET, Swagger } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../_share';
import { HttpResult } from '../../../_share';


/**
 * Controller for /api/v2/vehicles/bookings endpoints.
 */
export class Controller extends APIv2ControllerBase {
    /**
     * [GET]  /
     */
    @GET('/')
    @Swagger({
        "summary": "Returns all vehicle bookings.",
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
    public get_all_vehicle_bookings(req: ApiV2Request, res: ApiV2Response) {
        return this.__app.withDatabase(async db => {
            const RESULT: any[] = [];

            let from: string | moment.Moment = egoose.toStringSafe(req.query['from'])
                .trim();
            if ('' !== from) {
                from = moment.utc(from);
                if (!from.isValid()) {
                    return HttpResult.BadRequest((req: ApiV2Request, res: ApiV2Response) => {
                        return res.json({
                            success: false,
                            data: `Value for 'from' is invalid!`,
                        });
                    });
                }
            }

            let until: string | moment.Moment = egoose.toStringSafe(req.query['until'])
                .trim();
            if ('' !== until) {
                until = moment.utc(until);
                if (!until.isValid()) {
                    return HttpResult.BadRequest((req: ApiV2Request, res: ApiV2Response) => {
                        return res.json({
                            success: false,
                            data: `Value for 'until' is invalid!`,
                        });
                    });
                }
            }

            const VEHICLES_DOCS = await db.Vehicles
                .find({ 'team_id': req.team.id })
                .exec();

            for (const V of VEHICLES_DOCS) {
                const VEHICLE = await database.vehicleToJSON(V, db);

                const FILTER: any = {
                    '$and': [{
                        'vehicle_id': VEHICLE.id,
                    }],
                };

                if (moment.isMoment(from)) {
                    FILTER['$and'].push({
                        'from': {
                            '$gte': from.toDate(),
                        },
                    });
                }

                if (moment.isMoment(until)) {
                    FILTER['$and'].push({
                        'until': {
                            '$lte': until.toDate(),
                        },
                    });
                }

                const BOOKING_DOCS = await db.VehicleBookings
                    .find(FILTER)
                    .exec();

                for (const B of BOOKING_DOCS) {
                    const BOOKING = await database.vehicleBookingToJSON(B, db);

                    RESULT.push(BOOKING);
                }
            }

            return egoose.from(RESULT)
                .orderBy(x => x.time)
                .thenBy(x => x.id)
                .toArray();
        });
    }
}
