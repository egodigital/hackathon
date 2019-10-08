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
import { AppContext } from './contracts';


/**
 * Initializes the development environment.
 *
 * @param {AppContext} app The underlying application (context).
 */
export async function initDevEnvironment(app: AppContext) {
    await initDatabase(app);
}


async function initDatabase(app: AppContext) {
    await app.withDatabase(async db => {
        let teams = await db.Teams
            .find();

        // teams
        if (!teams.length) {
            let teamName = egoose.toStringSafe(process.env.TEAM_NAME)
                .trim();
            if ('' === teamName) {
                teamName = 'Team #1';
            }

            let apiKey = egoose.toStringSafe(process.env.API_KEY)
                .trim();
            if ('' === apiKey) {
                apiKey = '00000000-0000-0000-0000-000000000000';
            }

            teams = await db.Teams.insertMany([{
                'api_key': apiKey,
                'name': teamName,
            }]);

            for (const T of teams) {
                console.log(`🏳️🏳️🏳️  Created team '${
                    T.name
                    }' (${T.id}) with API key '${
                    T.api_key
                    }'  🏳️🏳️🏳️`);

                const NEW_ENVIRONMENT = (await db.Environments.insertMany([{
                    'name': 'e.GO Campus-Boulevard 30, Aachen, Germany',
                    'team_id': T.id,
                }]))[0];

                console.log(`🏠🏠🏠  Created environment '${
                    NEW_ENVIRONMENT.name
                    }' (${NEW_ENVIRONMENT.id}) for team '${
                    T.id
                    }'  🏠🏠🏠`);

                const NEW_VEHICLES = await db.Vehicles.insertMany([{
                    'country': 'D',
                    'environment_id': NEW_ENVIRONMENT.id,
                    'license_plate': 'AC-EGO 123',
                    'manufacturer': 'e.GO',
                    'model_name': 'Life 20',
                    'team_id': T.id,
                }, {
                    'country': 'D',
                    'environment_id': NEW_ENVIRONMENT.id,
                    'license_plate': 'AC-EGO 456',
                    'manufacturer': 'e.GO',
                    'model_name': 'Life 40',
                    'team_id': T.id,
                }, {
                    'country': 'D',
                    'environment_id': NEW_ENVIRONMENT.id,
                    'license_plate': 'AC-EGO 789',
                    'manufacturer': 'e.GO',
                    'model_name': 'Life 60',
                    'team_id': T.id,
                }, {
                    'country': 'D',
                    'environment_id': NEW_ENVIRONMENT.id,
                    'license_plate': 'AC-EGO 1011',
                    'manufacturer': 'e.GO',
                    'model_name': 'Life CS',
                    'team_id': T.id,
                }, {
                    'country': 'D',
                    'environment_id': NEW_ENVIRONMENT.id,
                    'license_plate': 'AC-EGO 1213',
                    'manufacturer': 'e.GO',
                    'model_name': 'Life CS',
                    'team_id': T.id,
                }]);

                for (const V of NEW_VEHICLES) {
                    console.log(`🚗🚗🚗  Created vehicle '${
                        V.license_plate
                        }' (${V.id}) for team '${
                        T.id
                        }'  🚗🚗🚗`);
                }
            }
        }
    }, true);
}
