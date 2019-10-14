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
import * as joi from 'joi';
import { GET, POST, Swagger } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../_share';


interface NewVehicle {
    country?: string;
    licensePlate: string;
    manufacturer: string;
    model: string;
    name?: string;
}

const SCHEMA_NEW_VEHICLE = joi.object({
    country: joi.string()
        .trim()
        .uppercase()
        .allow(null, '')
        .optional(),
    licensePlate: joi.string()
        .trim()
        .uppercase()
        .min(1)
        .required(),
    manufacturer: joi.string()
        .trim()
        .min(1)
        .required(),
    model: joi.string()
        .trim()
        .min(1)
        .required(),
    name: joi.string()
        .trim()
        .optional(),
});


/**
 * Controller for /api/v2/vehicles endpoints.
 */
export class Controller extends APIv2ControllerBase {
    /**
     * [GET]  /
     */
    @GET('/')
    @Swagger({
        "summary": "Returns a list of all vehicles.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleListResponse"
                }
            },
        },
    })
    public get_all_vehicles(req: ApiV2Request, res: ApiV2Response) {
        return this.__app.withDatabase(async db => {
            const VEHICLE_DOCS = await db.Vehicles
                .find({ 'team_id': req.team.id })
                .sort({ 'licensePlate': -1 })
                .exec();

            const RESULT: any[] = [];
            for (const V of VEHICLE_DOCS) {
                RESULT.push(
                    await database.vehicleToJSON(V, db)
                );
            }

            return RESULT;
        });
    }

    /**
     * [POST]  /
     */
    @POST('/', SCHEMA_NEW_VEHICLE)
    @Swagger({
        "summary": "Creates a new vehicle.",
        "parameters": [
            {
                "in": "body",
                "name": "body",
                "description": "Options for a request.",
                "required": true,
                "schema": {
                    "$ref": "#/definitions/CreateVehicleRequest"
                }
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/VehicleItem"
                }
            },
        },
    })
    public create_new_vehicle(req: ApiV2Request, res: ApiV2Response) {
        return this.__app.withDatabase(async db => {
            const NEW_VEHICLE: NewVehicle = req.body;

            const NEW_DATA: any = {
                'license_plate': NEW_VEHICLE.licensePlate,
                'manufacturer': NEW_VEHICLE.manufacturer,
                'model_name': NEW_VEHICLE.model,
                'team_id': req.team.id,
            };

            if (!egoose.isEmptyString(NEW_VEHICLE.country)) {
                NEW_DATA['country'] = NEW_VEHICLE.country;
            }

            if (!egoose.isEmptyString(NEW_VEHICLE.name)) {
                NEW_DATA['name'] = NEW_VEHICLE.name;
            }

            const NEW_DOC = (await db.Vehicles.insertMany([
                NEW_DATA
            ]))[0];

            return await database.vehicleToJSON(NEW_DOC, db);
        });
    }
}
