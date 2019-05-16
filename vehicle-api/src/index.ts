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

import * as database from './database';
import * as diagnostics from './diagnostics';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import { initControllers } from '@egodigital/express-controllers';


(async () => {
    database.initSchema();

    const APP = express();

    APP.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*,Content-Type,X-Api-Key");
        res.header("Access-Control-Allow-Methods", "*,GET,POST,PUT,DELETE,PATCH,OPTIONS");

        res.header('X-Powered-By', 'Vehicle API by e.GO');
        res.header('X-Tm-Mk', '1979-09-05 23:09');

        res.header('Last-Modified', (new Date()).toUTCString());

        if ('options' === egoose.normalizeString(req.method)) {
            return res.status(204)
                .send();
        }

        return next();
    });

    APP.disable('etag');

    initControllers({
        app: APP,
        cwd: __dirname + '/controllers',
    });

    const PORT = 80;

    APP.listen(PORT, () => {
        diagnostics.getLogger()
            .info(`API now runs on port ${PORT}...`, 'express.app');
    });
})();