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
import * as fs from 'fs-extra';
import * as path from 'path';
import { InitControllersSwaggerOptionsValue } from '@egodigital/express-controllers';
import { AppContext } from './contracts';
import { getResourcePath } from './utils';

/**
 * Creates Swagger options for 'initControllers()' function.
 *
 * @param {AppContext} app The underlying application (context),
 * 
 * @return {InitControllersSwaggerOptionsValue} The promise with the options value.
 */
export async function createSwaggerOptions(app: AppContext): Promise<InitControllersSwaggerOptionsValue> {
    return egoose.IS_LOCAL_DEV ? {
        definitions: DEFINITIONS,
        document: {
            host: egoose.IS_LOCAL_DEV ? 'localhost' : 'ego-vehicle-api.azurewebsites.net',
            info: {
                contact: {
                    email: 'hello@e-go-digital.com',
                },
                description: 'Describes all backend endpoints.',
                title: 'Vehicle Booking API by e.GO Digital ',
                version: app.package.version,
            },
            schemes: [egoose.IS_LOCAL_DEV ? 'http' : 'https'],
            tags: {
                'defaults': 'Defaults',
                'vehicles': 'Vehicles',
            },
        },

        title: 'e.GO Digital Backend',
    } : false;
}


const DEFINITIONS: any = {};
if (egoose.IS_LOCAL_DEV) {
    const DEFINITIONS_DIR = getResourcePath(
        'swagger/definitions'
    );
    for (const DEF_FILE of fs.readdirSync(DEFINITIONS_DIR)) {
        try {
            const FULL_PATH = path.join(
                DEFINITIONS_DIR, DEF_FILE
            );

            if (!fs.statSync(FULL_PATH).isFile()) {
                continue;
            }

            if (!DEF_FILE.endsWith('.json')) {
                continue;
            }

            const DEF_NAME = path.basename(
                DEF_FILE, path.extname(DEF_FILE)
            ).trim();
            if ('' !== DEF_FILE) {
                DEFINITIONS[DEF_NAME] = JSON.parse(
                    fs.readFileSync(FULL_PATH, 'utf8')
                );

                console.log(`✅✅✅  Loaded Swagger definition from '${
                    DEF_FILE
                    }'  ✅✅✅`);
            }
        } catch (e) {
            console.log(`⚠️⚠️⚠️  Could not load Swagger definition from '${
                DEF_FILE
                }': '${
                egoose.toStringSafe(e)
                }'  ⚠️⚠️⚠️`);
        }
    }
}
