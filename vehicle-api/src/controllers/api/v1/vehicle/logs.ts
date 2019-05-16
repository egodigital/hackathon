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
 * /controllers/api/v1/vehicle/logs.ts
 *
 * Base path: '/api/v1/vehicle/logs'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/logs/signals:
     *   get:
     *     summary: Gets vehicle signal logs.
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
     *         description: The maximum number of results.
     *         type: number
     *         name: limit
     *         default: 100
     *       - in: query
     *         required: false
     *         description: The maximum number of results.
     *         type: number
     *         name: limit
     *         default: 100
     *       - in: query
     *         required: false
     *         description: The zero based offset.
     *         type: number
     *         name: offset
     *         default: 0
     *       - in: query
     *         required: false
     *         description: Sort order.
     *         type: string
     *         name: sort
     *         enum:
     *           - 'asc'
     *           - 'desc'
     *         example: 'asc'
     *         default: 'desc'
     *       - in: query
     *         required: false
     *         description: Regex filter for signal name (case insensitive).
     *         type: string
     *         name: filter
     *         example: '(turn_signal_right)'
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *         type: array
     *         items:
     *           $ref: '#/definitions/VehicleSignalLog'
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET('/signals')
    public async get_signal_logs(req: ApiRequest, res: Response) {
        let limit = parseInt(
            egoose.toStringSafe(req.query.limit)
                .trim()
        );
        if (isNaN(limit)) {
            limit = 100;
        }
        limit = Math.max(limit, 1);
        limit = Math.min(limit, 100);

        let offset = parseInt(
            egoose.toStringSafe(req.query.offset)
                .trim()
        );
        if (isNaN(offset)) {
            offset = 0;
        }
        offset = Math.max(offset, 0);

        let filter: RegExp;
        if (!egoose.isEmptyString(req.query.filter)) {
            filter = new RegExp(req.query.filter, 'i');
        }

        const SORT_ASC = 'ASC' === egoose.normalizeString(req.query.sort);

        return await this._withDatabase(async (db) => {
            const FILTER: any = {
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            };

            if (!_.isNil(filter)) {
                FILTER['name'] = filter;
            }

            const DOCS = await db.VehicleSignalLogs
                .find(FILTER)
                .limit(limit)
                .skip(offset)
                .sort({
                    'creation_time': SORT_ASC ? 1 : -1,
                    '_id': SORT_ASC ? 1 : -1,
                })
                .exec();

            return res.json(
                DOCS.map(d => database.toJSONVehicleSignalLog(d))
            );
        });
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/logs/signals:
     *   delete:
     *     summary: Deletes all vehicle signal logs.
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
    @DELETE('/signals')
    public async delete_signal_logs(req: ApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            await db.VehicleSignalLogs.deleteMany({
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            }).exec();

            return res.status(204)
                .send();
        });
    }
}
