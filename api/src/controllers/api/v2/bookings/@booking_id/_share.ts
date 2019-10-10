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
import * as egoose from '@egodigital/egoose';
import * as moment from 'moment';
import { NextFunction, RequestHandler } from 'express';
import { SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../../_share';
import { VehicleBooking } from '../../../../../contracts';
import { VehicleSignalManager, VehicleCache } from '../../../../../vehicles';


/**
 * An API v2 (vehicle booking) request context.
 */
export interface ApiV2VehicleBookingRequest extends ApiV2Request {
    /**
     * The vehicle booking
     */
    booking: VehicleBooking;
}

/**
 * An API v2 (vehicle booking) response context.
 */
export interface ApiV2VehicleBookingResponse extends ApiV2Response {
}


/**
 * A basic API v2 controller (vehicle booking).
 */
export abstract class APIv2VehicleBookingControllerBase extends APIv2ControllerBase {
    /** @inheritdoc */
    public async __updateSwaggerPath(context: SwaggerPathDefinitionUpdaterContext) {
        super.__updateSwaggerPath(context);

        context.definition.parameters.push({
            "in": "path",
            "name": "booking_id",
            "description": "The ID of the booking.",
            "required": true,
            "example": "5d9c6192b00f0a01ace7cd91",
            "type": "string"
        });

        context.definition.responses['404'] = {
            "description": "Vehicle booking not found.",
            "schema": {
                "$ref": "#/definitions/ErrorResponse"
            }
        };
    }

    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return super.__use.concat([
            async (req: ApiV2VehicleBookingRequest, res: ApiV2VehicleBookingResponse, next: NextFunction) => {
                if (req['booking']) {
                    return next();
                }

                const BOOKING_ID = egoose.normalizeString(req.params['booking_id']);
                if ('' !== BOOKING_ID) {
                    return this.__app.withDatabase(async db => {
                        const BOOKING_DOC = await db.VehicleBookings.findOne({
                            '_id': BOOKING_ID,
                        }).exec();

                        if (BOOKING_DOC) {
                            const VEHICLE_ID = egoose.normalizeString(BOOKING_DOC.vehicle_id);
                            if ('' !== VEHICLE_ID) {
                                const VEHICLE_DOC = await db.Vehicles.findOne({
                                    '_id': VEHICLE_ID,
                                }).exec();

                                if (VEHICLE_DOC) {
                                    if (egoose.normalizeString(VEHICLE_DOC.team_id) === req.team.id) {
                                        req['booking'] = {
                                            event: egoose.normalizeString(BOOKING_DOC.event),
                                            id: BOOKING_DOC.id,
                                            status: egoose.normalizeString(BOOKING_DOC.status),
                                            time: moment.utc(BOOKING_DOC.time),
                                            vehicle: {
                                                cache: new VehicleCache(VEHICLE_DOC),
                                                id: VEHICLE_DOC.id,
                                                infotainment: {
                                                    data: !Buffer.isBuffer(VEHICLE_DOC.infotainment) ?
                                                        undefined : VEHICLE_DOC.infotainment,
                                                    mime: egoose.isEmptyString(VEHICLE_DOC.infotainment_mime) ?
                                                        undefined : egoose.normalizeString(VEHICLE_DOC.infotainment_mime),
                                                },
                                                name: egoose.isEmptyString(VEHICLE_DOC.name) ?
                                                    undefined : egoose.toStringSafe(VEHICLE_DOC.name).trim(),
                                                signals: new VehicleSignalManager(VEHICLE_DOC),
                                                state: VEHICLE_DOC.state,
                                            },
                                        };
                                    }
                                }
                            }

                            return next();
                        }
                    });
                }

                return res.status(404).json({
                    success: false,
                    data: `Vehicle booking '${BOOKING_ID}' not found!`,
                });
            }
        ]);
    }
}
