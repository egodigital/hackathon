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

import * as egoose from '@egodigital/egoose';
import { GET, Swagger } from '@egodigital/express-controllers';
import { ControllerBase, Request, Response } from './_share';


/**
 * Controller for / endpoints.
 */
export class Controller extends ControllerBase {
    /**
     * [GET]  /
     */
    @GET()
    @Swagger({
        "tags": [
            "default"
        ],
        "summary": "Returns general information.",
        "produces": [
            "application/json",
        ],
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "schema": {
                    "$ref": "#/definitions/RootResponse"
                }
            },
        },
    })
    public async index(req: Request, res: Response) {
        return res.json({
            'me': {
                'ip': req.socket.remoteAddress,
                'port': req.socket.remotePort,
            },
            'now': egoose.utc()
                .toISOString(),
        });
    }
}
