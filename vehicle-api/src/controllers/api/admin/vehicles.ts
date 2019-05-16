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
import { Response } from 'express';
import { DELETE, GET, POST } from '@egodigital/express-controllers';
import { AdminApiRequest, AdminControllerBase } from './_share';


/**
 * /controllers/api/v1/vehicles.ts
 *
 * Base path: '/api/v1/vehicles'
 */
export class Controller extends AdminControllerBase {
    @GET('/')
    public async get_vehicles(req: AdminApiRequest, res: Response) {
        const DOCS = await this._withDatabase(async (db) => {
            return await db.Vehicles
                .find()
                .exec();
        });

        return res.json(
            DOCS.map(d => d.toJSON())
        );
    }

    @POST('/')
    public async new_vehicle(req: AdminApiRequest, res: Response) {
        const NEW_DOC = await this._withDatabase(async (db) => {
            return (await db.Vehicles
                .insertMany([{
                }]))[0];
        });

        return res.json(
            NEW_DOC.toJSON()
        );
    }

    @DELETE('/:id')
    public async delete_vehicle(req: AdminApiRequest, res: Response) {
        return await this._withDatabase(async (db) => {
            const EXISTING_DOC = await db.Vehicles.findOne({
                'uuid': egoose.normalizeString(req.params.id)
            }).exec();

            if (_.isNil(EXISTING_DOC)) {
                return res.status(404)
                    .send();
            }

            await db.Vehicles.deleteOne({
                '_id': EXISTING_DOC._id,
            }).exec();

            return res.status(204)
                .send();
        }, true);
    }
}
