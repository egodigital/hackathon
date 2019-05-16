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

import * as egoose from '@egodigital/egoose';
import * as fsExtra from 'fs-extra';
import { ControllerBase } from '@egodigital/express-controllers';


interface PackageJSON {
    displayName: string;
    version: string;
}


/**
 * /controllers/swagger.ts
 *
 * Base path: '/swagger'
 */
export class Controller extends ControllerBase {
    /** @inheritdoc */
    public __init() {
        const PACKAGE_JSON: PackageJSON = JSON.parse(
            fsExtra.readFileSync(
                __dirname + '/../../package.json',
                'utf8'
            )
        );

        const HOST = egoose.IS_LOCAL_DEV ?
            'localhost' : 'ego-vehicle-api.azurewebsites.net';
        const SCHEMES: any[] = egoose.IS_LOCAL_DEV ?
            ["http"] : ["https"];

        egoose.setupSwaggerUIFromSourceFiles({
            cwd: __dirname,
            document: {
                host: HOST,
                basePath: '/',
                info: {
                    contact: {
                        name: 'e.GO Digital GmbH',
                        email: "hello@e-go-digital.com",
                        url: 'https://github.com/egodigital/hackathon/tree/master/vehicle-api',
                    },
                    description: "Describes all endpoints of the vehicle API.",
                    license: {
                        name: 'GPL 3.0',
                        url: 'https://github.com/egodigital/hackathon/blob/master/vehicle-api/LICENSE',
                    },
                    title: PACKAGE_JSON.displayName,
                    version: PACKAGE_JSON.version,
                },
                schemes: SCHEMES,
                tags: {
                    'v1': 'Version 1',
                },
            },
            title: 'Vehicle API by e.GO',
        }, this.__app);
    }
}
