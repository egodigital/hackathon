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
import { Response } from 'express';
import { DELETE, GET } from '@egodigital/express-controllers';
import { ApiControllerBase, ApiRequest } from '../_share';


/**
 * /controllers/api/v1/vehicle/events.ts
 *
 * Base path: '/api/v1/vehicle/events'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/events:
     *   get:
     *     summary: Gets a list of unhandled events and marks them as handled.
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
     *         required: false
     *         description: Regex filter for event name (case insensitive).
     *         type: string
     *         name: filter
     *         example: '(signal_change)'
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *         type: array
     *         items:
     *           $ref: '#/definitions/VehicleEvent'
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET('/')
    public async get_events(req: ApiRequest, res: Response) {
        const NOW = egoose.utc();

        let filter: RegExp;
        if (!egoose.isEmptyString(req.query.filter)) {
            filter = new RegExp(req.query.filter, 'i');
        }

        return await this._withDatabase(async (db) => {
            const FILTER: any = {
                "is_handled": false,
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            };

            if (!_.isNil(filter)) {
                FILTER['name'] = filter;
            }

            const DOCS = await db.VehicleEvents
                .find(FILTER)
                .sort({
                    'creation_time': 1,
                    '_id': 1,
                })
                .limit(100)
                .exec();

            // mark as 'handled'
            for (const D of DOCS) {
                await db.VehicleEvents.updateOne({
                    '_id': D._id
                }, {
                        'is_handled': true,
                        'last_update': NOW.toDate(),
                    }).exec();
            }

            return res.json(
                DOCS.map(
                    d => database.toJSONVehicleEvent(d)
                ).map(d => {
                    d.is_handled = true;
                    d.last_update = database.toISOString(NOW);

                    return d;
                })
            );
        }, true);
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/events:
     *   delete:
     *     summary: Removes the complete queue of events.
     *     tags:
     *       - v1
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '204':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @DELETE('/')
    public async delete_events(req: ApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            await db.VehicleEvents.deleteMany({
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            }).exec();

            return res.status(204)
                .send();
        });
    }
}
