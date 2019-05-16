/**
 * This file is part of the vehicle-api distribution (https://github.com/egodigital/hackathon/vehicle-api).
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
import * as database from '../../../../database';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as joi from 'joi';
import { Response } from 'express';
import { DELETE, GET, PATCH } from '@egodigital/express-controllers';
import { ApiControllerBase, ApiRequest } from '../_share';


interface UpdateVehicleOptions {
    name?: string;
}


/**
 * @swaggerDefinition
 *
 * UpdateVehicleOptions:
 *   type: object
 *   properties:
 *     name:
 *       description: The new name.
 *       example: 'My awesome e.GO Life'
 */
const UPDATE_VEHICLE_OPTIONS_SCHEMA = joi.object({
    name: joi.string()
        .min(0)
        .max(256)
        .optional()
        .allow(null),
});


/**
 * /controllers/api/v1/vehicle/index.ts
 *
 * Base path: '/api/v1/vehicle'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1/vehicle:
     *   get:
     *     summary: Returns the information of the vehicle.
     *     tags:
     *       - v1
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *         schema:
     *           $ref: '#/definitions/Vehicle'
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET('/')
    public async get_vehicle(req: ApiRequest, res: Response) {
        return res.json(
            database.toJSONVehicle(req.vehicle.doc)
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle:
     *   patch:
     *     summary: Updates a vehicle.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         name: UpdateVehicleSignalOptions
     *         description: The data to update.
     *         required: true
     *         schema:
     *           $ref: '#/definitions/UpdateVehicleOptions'
     *     responses:
     *       '204':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key.
     *       '500':
     *         description: Server error.
     */
    @PATCH('/', UPDATE_VEHICLE_OPTIONS_SCHEMA)
    public async update_vehicle(req: ApiRequest, res: Response) {
        const OPTS: UpdateVehicleOptions = req.body;

        const NEW_DATA: any = {
            'last_update': egoose.utc()
                .toISOString(),
        };

        if (!_.isUndefined(OPTS.name)) {
            const NEW_NAME = egoose.toStringSafe(OPTS.name)
                .trim();

            NEW_DATA['name'] = '' === NEW_NAME ?
                null : NEW_NAME;
        }

        const NEW_DOC = await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.doc._id,
            }, NEW_DATA).exec();

            return await db.Vehicles
                .findById(req.vehicle.doc._id)
                .exec();
        }, true);

        return res.json(
            database.toJSONVehicle(NEW_DOC)
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/state:
     *   patch:
     *     summary: Sets a state value for the vehicle.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         name: NewVehicleStateValue
     *         required: true
     *         description: The new value.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key.
     *       '500':
     *         description: Server error.
     */
    @PATCH({
        path: '/state',
        use: express.json(),
    })
    public async set_vehicle_state(req: ApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.doc._id,
            }, {
                    'last_update': egoose.utc()
                        .toDate(),
                    'state': req.body,
                }).exec();

            return res.json(
                (await db.Vehicles
                    .findById(req.vehicle.doc._id)
                    .exec()).state
            );
        }, true);
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/state:
     *   delete:
     *     summary: Unsets the state value for the vehicle.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key.
     *       '500':
     *         description: Server error.
     */
    @DELETE('/state')
    public async unset_vehicle_state(req: ApiRequest, res: Response) {
        const CURRENT_STATE = req.vehicle.doc.state;

        await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.doc._id,
            }, {
                    'last_update': egoose.utc()
                        .toDate(),
                    '$unset': {
                        'state': "",
                    },
                }).exec();
        });

        return res.json(
            CURRENT_STATE
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/state:
     *   get:
     *     summary: Gets the state value of the vehicle.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key.
     *       '500':
     *         description: Server error.
     */
    @GET('/state')
    public async get_vehicle_state(req: ApiRequest, res: Response) {
        return res.json(
            req.vehicle.doc.state
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle:
     *   delete:
     *     summary: Resets the complete vehicle.
     *     tags:
     *       - v1
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key.
     *       '500':
     *         description: Server error.
     */
    @DELETE('/')
    public async reset_vehicle(req: ApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            // events
            await db.VehicleEvents.deleteMany({
                'vehicle_id': req.vehicle.doc._id,
            }).exec();

            // signals
            await db.VehicleSignals.deleteMany({
                'vehicle_id': req.vehicle.doc._id,
            }).exec();

            await db.Vehicles.updateOne({
                '_id': req.vehicle.doc._id,
            }, {
                    '$unset': {
                        'infotainment': "",
                        'infotainment_mime': "",
                        'last_update': "",
                        'name': "",
                        'state': "",
                    }
                }).exec();

            return res.json(
                database.toJSONVehicle(
                    await db.Vehicles
                        .findById(req.vehicle.doc._id)
                        .exec()
                )
            );
        }, true);
    }
}
