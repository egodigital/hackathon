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
import * as fs from 'fs-extra';
import { Express } from 'express';
import { AppContext } from './contracts';


/**
 * Creates a new app context.
 *
 * @param {Express} host The host.
 * 
 * @return {Promise<AppContext>} The promise with the new instance.
 */
export async function createApp(host: Express): Promise<AppContext> {
    const APP: AppContext = {
        host,
        log: new egoose.Logger(),
        package: JSON.parse(
            await fs.readFile(
                __dirname + '/../package.json',
                'utf8'
            )
        ),
        withDatabase: database.withDatabase,
    };

    (APP as any).withDatabase = database.withDatabase
        .bind(APP);

    return APP;
}
