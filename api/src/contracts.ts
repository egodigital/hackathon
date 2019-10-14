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
import * as moment from 'moment';
import { Express } from 'express';
import { WithDatabaseAction } from './database';
import { VehicleSignalManager, VehicleCache } from './vehicles';


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
 * A decorator function.
 *
 * @param {any} target The target.
 * @param {string} propertyName The (property) name.
 * @param {PropertyDescriptor} propertyInfo The property information.
 */
export type DecoratorFunction = (target: any, propertyName: string, propertyInfo: PropertyDescriptor) => void;

/**
 * An environment.
 */
export interface Environment {
    /**
     * The ID of the environment.
     */
    readonly id: string;
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

/**
 * A vehicle.
 */
export interface Vehicle {
    /**
     * A cache for the vehicle.
     */
    readonly cache: VehicleCache;
    /**
     * The ID of the vehicle.
     */
    readonly id: string;
    /**
     * The status of the infotainment.
     */
    readonly infotainment: {
        /**
         * The data.
         */
        data?: Buffer;
        /**
         * The MIME type.
         */
        mime?: string;
    };
    /**
     * The (display) name of the vehicle.
     */
    readonly name: string;
    /**
     * Signal manager.
     */
    readonly signals: VehicleSignalManager;
    /**
     * State value.
     */
    readonly state: any;
    /**
     * The status.
     */
    readonly status: string;
}

/**
 * A vehicle booking.
 */
export interface VehicleBooking {
    /**
     * The event (type).
     */
    readonly event: string;
    /**
     * The ID of the vehicle.
     */
    readonly id: string;
    /**
     * The status.
     */
    readonly status: string;
    /**
     * The timestamp.
     */
    readonly time: moment.Moment;
    /**
     * The underlying vehicle.
     */
    readonly vehicle: Vehicle;
}

/**
 * The (storage) key for storing all (vehicle) signals.
 */
export const KEY_SIGNALS = 'signals';

/**
 * A symbol, which indicates if something has not been found.
 */
export const NOT_FOUND = Symbol('NOT_FOUND');
