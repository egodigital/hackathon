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
import * as nocache from 'nocache';
import { initControllers } from '@egodigital/express-controllers';
import { AppContext } from './contracts';
import { createSwaggerOptions } from './swagger';


/**
 * Initializes the host.
 *
 * @param {AppContext} app The application context with the host.
 */
export async function initHost(app: AppContext) {
    app.host
        .use(nocache());

    app.host.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*,Content-Type,X-Api-Key");
        res.header("Access-Control-Allow-Methods", "*,GET,POST,PUT,DELETE,PATCH,OPTIONS");

        res.header('X-Powered-By', 'Vehicle Booking API by e.GO');
        res.header('X-Tm-Mk', '1979-09-05 23:09');

        res.header('Last-Modified', (new Date()).toUTCString());

        if ('OPTIONS' === req.method) {
            return res.status(204)
                .send();
        }

        return next();
    });

    initControllers({
        app: app.host,
        controllerConstructorArgs: function () {
            arguments[0] = app;  // update __app argument (1st)

            return arguments;
        },
        cwd: __dirname + '/controllers',
        files: egoose.IS_LOCAL_DEV ? '**/*.ts' : '**/*.js',
        swagger: await createSwaggerOptions(app),
    });
}
