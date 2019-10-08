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
import { SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../../_share';


/**
 * An API v2 (vehicle booking) request context.
 */
export interface ApiV2VehicleBookingRequest extends ApiV2VehicleRequest {
}

/**
 * An API v2 (vehicle booking) response context.
 */
export interface ApiV2VehicleBookingResponse extends ApiV2VehicleResponse {
}


/**
 * A basic API v2 controller (vehicle booking).
 */
export abstract class APIv2VehicleBookingControllerBase extends APIv2VehicleControllerBase {
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
            "description": "Vehicle or booking not found.",
            "schema": {
                "$ref": "#/definitions/ErrorResponse"
            }
        };
    }
}
