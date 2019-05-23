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
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as vehicles from '../../../../vehicles';
import { Response } from 'express';
import { DELETE, GET, PATCH } from '@egodigital/express-controllers';
import { ApiControllerBase, ApiRequest, KEY_SIGNALS, NOT_FOUND } from '../_share';


/**
 * /controllers/api/v1/vehicle/signals.ts
 *
 * Base path: '/api/v1/vehicle/signals'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/signals:
     *   get:
     *     summary: Gets a list of all signals.
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
     *       - in: query
     *         name: cache
     *         required: false
     *         type: number
     *         enum:
     *           - 0
     *           - 1
     *         default: 0
     *         description: Use cache or not.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *         type: array
     *         items:
     *           $ref: '#/definitions/VehicleSignalList'
     *       '304':
     *         description: Data has not been modified.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET('/')
    public async get_vehicle_signals(req: ApiRequest, res: Response) {
        // TODO: implement
        // @ts-ignore
        const USE_CACHE = '1' === egoose.toStringSafe(req.query.cache)
            .trim();

        let allSignals: any = await req.vehicle
            .cache.get(KEY_SIGNALS, NOT_FOUND);
        if (_.isSymbol(allSignals)) {
            allSignals = await req.vehicle.signals._getAll();

            await req.vehicle
                .cache.set(KEY_SIGNALS, allSignals);
        }

        return res.json(
            allSignals
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/signals:
     *   patch:
     *     summary: Updates a list of one or more vehicle signals.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         name: ListOfVehicleSignalsToUpdate
     *         required: true
     *         schema:
     *           $ref: '#/definitions/VehicleSignalListForPatchExample'
     *         description: A list of one or more value signals to update.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *         type: object
     *         schema:
     *           $ref: '#/definitions/VehicleSignalList'
     *       '401':
     *         description: Wrong API key
     *       '406':
     *         description: At least one patch failed.
     *       '500':
     *         description: Server error
     */
    @PATCH({
        path: '/',
        use: express.json(),
    })
    public async set_vehicle_signals(req: ApiRequest, res: Response) {
        const VALUES: vehicles.VehicleSignalValueList = req.body;

        let allSignals: vehicles.VehicleSignalValueList;
        try {
            for (const NAME in VALUES) {
                const SIGNAL_SET = await req.vehicle.signals._set(
                    NAME, VALUES[NAME]
                );

                if (!SIGNAL_SET) {
                    return res.status(406)
                        .header('Content-type', 'text/plain')
                        .send(`PATCH FAILED: Signal '${NAME}' does not exist!`);
                }
            }
        } catch (e) {
            return res.status(406)
                .header('Content-type', 'text/plain')
                .send('ERROR: ' + egoose.toStringSafe(e));
        } finally {
            // update cache

            allSignals = await req.vehicle.signals._getAll();
            await req.vehicle
                .cache.set(KEY_SIGNALS, allSignals);
        }

        return res.json(
            allSignals
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/signals:
     *   delete:
     *     summary: Resets all signals.
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
     *         type: array
     *         items:
     *           $ref: '#/definitions/VehicleSignalList'
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @DELETE('/')
    public async reset_signals(req: ApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            await db.VehicleSignals.deleteMany({
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            }).exec();

            const ALL_SIGNALS = await req.vehicle.signals._getAll();
            await req.vehicle
                .cache.set(KEY_SIGNALS, ALL_SIGNALS);

            return res.json(
                ALL_SIGNALS
            );
        });
    }
}
