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
import { ControllerBase, Request } from '../../_share';


/**
 * An admin API request.
 */
export interface AdminApiRequest extends Request {
}


/**
 * A basic admin API controller.
 */
export abstract class AdminControllerBase extends ControllerBase {
    /** @inheritdoc */
    public get __use() {
        return [
            // log request
            async (req: Request, res: express.Response, next: express.NextFunction) => {
                try {
                    const TAG = `request.AdminControllerBase(${req.path}::${req.method})'`;

                    const MSG = {
                        client: {
                            address: req.socket.remoteAddress,
                            port: req.socket.remotePort,
                        },
                        headers: req.headers,
                        params: req.params,
                        protocol: req.protocol,
                        query: req.query,
                    };

                    this._logger
                        .trace(MSG, TAG);
                } catch (e) {
                    console.error(e, 'AdminControllerBase(1)');
                }

                return next();
            },

            async (req: Request, res: express.Response, next: express.NextFunction) => {
                try {
                    const ADMIN_API_KEY = egoose.toStringSafe(
                        process.env.ADMIN_API_KEY,
                    ).trim();
                    const X_API_KEY = egoose.toStringSafe(
                        req.headers['x-api-key']
                    ).trim();

                    if (ADMIN_API_KEY === X_API_KEY) {
                        return next();
                    }
                } catch (e) {
                    this._logger
                        .err(e, 'AdminControllerBase(2)');
                }

                // incorrect API key
                return res.status(404)
                    .send() as any;
            }
        ];
    }
}
