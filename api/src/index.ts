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
import * as express from 'express';
import { createApp } from './app';
import { initDatabaseSchema } from './database';
import { initDevEnvironment } from './dev';
import { initLogger } from './diagnostics';
import { initHost } from './host';


(async () => {
    await initDatabaseSchema();

    const HOST = express();

    const APP = await createApp(HOST);

    await initLogger(APP);
    await initHost(APP);

    if (egoose.IS_LOCAL_DEV) {
        await initDevEnvironment(APP);
    }

    let appPort = parseInt(
        egoose.toStringSafe(process.env.APP_PORT)
            .trim()
    );
    if (isNaN(appPort)) {
        appPort = 80;
    }

    APP.host.listen(appPort, () => {
        if (egoose.IS_LOCAL_DEV) {
            console.log(`🎉🎉🎉 Host is running on port ${appPort} 🎉🎉🎉`);
        }
    });
})();
