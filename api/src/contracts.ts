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
import { Express } from 'express';
import { WithDatabaseAction } from './database';


/**
 * An application context.
 */
export interface AppContext {
    /**
     * The underlying host instance.
     */
    readonly host: Express;
    /**
     * The app logger.
     */
    readonly log: egoose.Logger;
    /**
     * The content of app's 'package.json'.
     */
    readonly package: PackageJSON;
    /**
     * Executes an action for an open database connection.
     */
    readonly withDatabase: <TResult extends any = any>(action: WithDatabaseAction<TResult>, inTransaction?: boolean) => Promise<TResult>;
}

/**
 * Describes a package.json file.
 */
export interface PackageJSON {
    /**
     * The description of the package.
     */
    readonly description: string;
    /**
     * The name of the package.
     */
    readonly name: string;
    /**
     * The version of the package.
     */
    readonly version: string;
}

/**
 * A team.
 */
export interface Team {
    /**
     * The ID of the team.
     */
    readonly id: string;
    /**
     * The (display) name of the team.
     */
    readonly name: string;
}
