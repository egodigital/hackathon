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
import { NextFunction, RequestHandler } from 'express';
import { SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../../_share';
import { Vehicle } from '../../../../../contracts';


/**
 * An API v2 (vehicle) request context.
 */
export interface ApiV2VehicleRequest extends ApiV2Request {
    /**
     * The current vehicle.
     */
    vehicle: Vehicle;
}

/**
 * An API v2 (vehicle) response context.
 */
export interface ApiV2VehicleResponse extends ApiV2Response {
}


/**
 * A basic API v2 controller (vehicle).
 */
export abstract class APIv2VehicleControllerBase extends APIv2ControllerBase {
    /** @inheritdoc */
    public async __updateSwaggerPath(context: SwaggerPathDefinitionUpdaterContext) {
        super.__updateSwaggerPath(context);

        context.definition.parameters.push({
            "in": "path",
            "name": "vehicle_id",
            "description": "The ID of the vehicle.",
            "required": true,
            "example": "5d9c6192b00f0a01ace7cd90",
            "type": "string"
        });

        context.definition.responses['404'] = {
            "description": "Vehicle not found.",
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
            async (req: ApiV2VehicleRequest, res: ApiV2VehicleResponse, next: NextFunction) => {
                if (req['vehicle']) {
                    return next();
                }

                const VEHICLE_ID = egoose.normalizeString(req.params['vehicle_id']);
                if ('' !== VEHICLE_ID) {
                    const VEHICLE_DOC = await this.__app.withDatabase(db => {
                        return db.Vehicles.findOne({
                            '_id': VEHICLE_ID,
                            'team_id': req.team.id,
                        }).exec();
                    });

                    if (VEHICLE_DOC) {
                        req['vehicle'] = {
                            id: VEHICLE_DOC.id,
                            name: egoose.isEmptyString(VEHICLE_DOC.name) ?
                                undefined : egoose.toStringSafe(VEHICLE_DOC.name).trim(),
                        };

                        return next();
                    }
                }

                return res.status(404).json({
                    success: false,
                    data: `Vehicle '${VEHICLE_ID}' not found!`,
                });
            }
        ]);
    }
}
