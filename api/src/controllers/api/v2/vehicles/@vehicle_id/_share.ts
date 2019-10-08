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

import { SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../../_share';


/**
 * An API v2 (vehicle) request context.
 */
export interface ApiV2VehicleRequest extends ApiV2Request {
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
        };
    }
}
