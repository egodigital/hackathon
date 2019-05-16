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

import * as database from '../../../database';
import * as egoose from '@egodigital/egoose';
import { Response } from 'express';
import { GET } from '@egodigital/express-controllers';
import { ApiControllerBase, ApiRequest } from './_share';


/**
 * /controllers/api/v1/index.ts
 *
 * Base path: '/api/v1'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1:
     *   get:
     *     summary: Shows API / server information.
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
     *           $ref: '#/definitions/ApiInformation'
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET()
    public async index(req: ApiRequest, res: Response) {
        /**
         * @swaggerDefinition
         *
         * ApiInformation:
         *   type: object
         *   properties:
         *     ip:
         *       type: string
         *       description: The IP of the requesting client.
         *       example: '104.215.148.63'
         *     now:
         *       type: string
         *       description: The server time, in UTC.
         *       example: '1979-09-05T23:09:19.790Z'
         *     vehicle:
         *       description: The vehicle information.
         *       $ref: '#/definitions/Vehicle'
         */
        return res.json({
            ip: req.socket
                .remoteAddress,
            now: egoose.utc()
                .toISOString(),
            vehicle: database.toJSONVehicle(req.vehicle.doc),
        });
    }
}
