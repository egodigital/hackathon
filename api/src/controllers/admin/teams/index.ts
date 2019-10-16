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
import * as joi from 'joi';
import { GET, POST, Swagger } from '@egodigital/express-controllers';
import { AdminControllerBase, AdminRequest, AdminResponse } from '../_share';


interface NewTeam {
    name: string;
}

const SCHEMA_NEW_TEAM = joi.object({
    name: joi.string()
        .trim()
        .min(1)
        .required(),
});


/**
 * Controller for /admin/teams endpoints.
 */
export class Controller extends AdminControllerBase {
    /**
     * [POST]  /
     */
    @POST('/', SCHEMA_NEW_TEAM)
    @Swagger({
        "summary": "Creates a new team.",
        "parameters": [
            {
                "in": "body",
                "name": "body",
                "description": "Options for a request.",
                "required": true,
                "schema": {
                    "$ref": "#/definitions/CreateTeamRequest"
                }
            }
        ],
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/CreateTeamResponse"
                }
            },
        },
    })
    public async create_new_team(req: AdminRequest, res: AdminResponse) {
        return this.__app.withDatabase(async db => {
            const NEW_TEAM: NewTeam = req.body;

            const NEW_TEAM_DOC = (await db.Teams.insertMany([{
                api_key: egoose.uuid(),
                name: NEW_TEAM.name,
            }]))[0];

            return {
                apiKey: NEW_TEAM_DOC.api_key,
                id: NEW_TEAM_DOC.id,
                name: NEW_TEAM_DOC.name,
            };
        });
    }

    /**
     * [GET]  /
     */
    @GET('/')
    @Swagger({
        "summary": "Lists all teams.",
        "responses": {
            "200": {
                "schema": {
                    "$ref": "#/definitions/ListTeamsResponse"
                }
            },
        },
    })
    public async get_all_teams(req: AdminRequest, res: AdminResponse) {
        return this.__app.withDatabase(async db => {
            const TEAM_DOCS = await db.Teams
                .find()
                .exec();

            return egoose.from(TEAM_DOCS)
                .select(doc => {
                    return {
                        apiKey: doc.api_key,
                        id: doc.id,
                        name: doc.name,
                    }
                })
                .orderBy(x => egoose.normalizeString(x.name))
                .thenBy(x => x.id)
                .toArray();
        });
    }
}
