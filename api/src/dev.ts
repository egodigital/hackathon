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

import * as database from './database';
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

                await database.resetTeam(T.id, db);

                console.log(`🧪🧪🧪  Created initial data for team '${
                    T.name
                    }' (${T.id})  🧪🧪🧪`);
            }
        }
    }, true);
}
