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

import * as database from '../../../database';
import * as egoose from '@egodigital/egoose';
import { DELETE, GET, Swagger } from '@egodigital/express-controllers';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from './_share';
import { HttpResult } from '../../_share';


/**
 * Controller for /api/v2 endpoints.
 */
export class Controller extends APIv2ControllerBase {
    /**
     * [GET]  /
     */
    @GET('/')
    @Swagger({
        "summary": "Returns general information.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/GeneralInfoResponse"
                }
            },
        },
    })
    public async get_general_info(req: ApiV2Request, res: ApiV2Response) {
        return this.__app.withDatabase(async db => {
            const TEAM_DOC = await db.Teams
                .findById(req.team.id)
                .exec();

            if (!TEAM_DOC) {
                return HttpResult.NotFound((req: ApiV2Request, res: ApiV2Response) => {
                    return res.json({
                        success: false,
                        data: `Team '${req.team.id}' not found!`,
                    });
                });
            }

            return {
                'me': {
                    'ip': req.socket.remoteAddress,
                    'port': req.socket.remotePort,
                },
                'now': egoose.utc()
                    .toISOString(),
                'team': await database.teamToJSON(TEAM_DOC, db),
            };
        });
    }

    /**
     * [DELETE]  /
     */
    @DELETE('/')
    @Swagger({
        "summary": "Resets the data of the current team.",
        "responses": {
            "204": {
            },
        },
    })
    public async reset_team_data(req: ApiV2Request, res: ApiV2Response) {
        return this.__app.withDatabase(async db => {
            const TEAM_DOC = await db.Teams
                .findById(req.team.id)
                .exec();

            if (!TEAM_DOC) {
                return HttpResult.NotFound((req: ApiV2Request, res: ApiV2Response) => {
                    return res.json({
                        success: false,
                        data: `Team '${req.team.id}' not found!`,
                    });
                });
            }

            await database.resetTeam(TEAM_DOC.id, db);

            return HttpResult.NoContent();
        }, true);
    }
}
