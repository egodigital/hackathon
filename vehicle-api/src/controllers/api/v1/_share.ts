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

import * as _ from 'lodash';
import * as database from '../../../database';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as jimp from 'jimp';
import * as vehicles from '../../../vehicles';
import { ControllerBase, Request } from '../../_share';


/**
 * An API request.
 */
export interface ApiRequest extends Request {
    /**
     * The vehicle.
     */
    readonly vehicle: Vehicle;
}

/**
 * Handles a vehicle.
 */
export interface Vehicle {
    /**
     * Cache.
     */
    readonly cache: egoose.Cache;
    /**
     * The document in the database.
     */
    readonly doc: database.VehiclesDocument;
    /**
     * Signal manager.
     */
    readonly signals: vehicles.VehicleSignalManager;
}


/**
 * The (storage) key for storing all (vehicle) signals.
 */
export const KEY_SIGNALS = 'signals';
/**
 * A symbol, which indicates if something has not been found.
 */
export const NOT_FOUND = Symbol('NOT_FOUND');
const VEHICLE_CACHE_STORAGE: {
    [vehicleId: string]: { [key: string]: any }
} = {};
const VEHICLE_CACHE_QUEUE = egoose.createQueue();


/**
 * A cache for a vehicle.
 */
export class VehicleCache extends egoose.CacheBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {database.VehiclesDocument} vehicle The document in the database.
     */
    public constructor(
        public readonly vehicle: database.VehiclesDocument,
    ) {
        super();
    }

    /** @inheritdoc */
    protected async getInner(key: string, defaultValue: any): Promise<any> {
        return await VEHICLE_CACHE_QUEUE.add(async () => {
            const VEHICLE_ID = egoose.normalizeString(this.vehicle._id);

            const ALL_VALUES = VEHICLE_CACHE_STORAGE[VEHICLE_ID];
            if (!_.isNil(ALL_VALUES)) {
                const VALUE = ALL_VALUES[key];

                if (!_.isUndefined(VALUE)) {
                    return VALUE;
                }
            }

            return defaultValue;
        });
    }

    /** @inheritdoc */
    protected async setInner(key: string, value: any, opts: egoose.SetCacheValueOptions) {
        return await VEHICLE_CACHE_QUEUE.add(async () => {
            const VEHICLE_ID = egoose.normalizeString(this.vehicle._id);

            let allValues = VEHICLE_CACHE_STORAGE[VEHICLE_ID];
            if (_.isNil(allValues)) {
                allValues = {};
                VEHICLE_CACHE_STORAGE[VEHICLE_ID] = allValues;
            }

            if (_.isUndefined(value)) {
                delete allValues[key];
            } else {
                allValues[key] = value;
            }
        });
    }
}


/**
 * A basic API controller.
 */
export abstract class ApiControllerBase extends ControllerBase {
    /**
     * Adds a vehicle event.
     *
     * @param {ApiRequest} req The underlying request context.
     * @param {string} name The name of the event.
     * @param {any} [data] The data to submit.
     *
     * @return {Promise<database.VehicleEventsDocument>} The promise with the new database entry.
     */
    public async _addVehicleEvent(
        req: ApiRequest,
        name: string, data?: any,
    ): Promise<database.VehicleEventsDocument> {
        return (await this._withDatabase(async (db) => {
            return await db.VehicleEvents.insertMany([{
                'data': data,
                'name': egoose.normalizeString(name),
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            }]);
        }))[0];
    }

    /**
     * Adds a vehicle signal.
     *
     * @param {ApiRequest} req The underlying request context.
     * @param {string} name The name of the signal.
     * @param {any} [data] The data to submit.
     *
     * @return {Promise<database.VehicleSignalsDocument>} The promise with the new database entry.
     */
    public async _addVehicleSignal(
        req: ApiRequest,
        name: string, data?: any,
    ): Promise<database.VehicleSignalsDocument> {
        return (await this._withDatabase(async (db) => {
            return await db.VehicleSignals.insertMany([{
                'data': data,
                'name': egoose.normalizeString(name),
                'vehicle_id': egoose.normalizeString(req.vehicle.doc._id),
            }]);
        }))[0];
    }

    /**
     * Returns the infotainment screen as image.
     *
     * @param {database.VehiclesDocument} vehicle The vehicle document.
     *
     * @return {Promise<jimp>} The promise with the image.
     */
    public async _getInfotainmentScreen(vehicle: database.VehiclesDocument): Promise<jimp> {
        let image = vehicle.infotainment;

        if (_.isNil(image) || !image.length) {
            image = await this._loadResource('infotainment.png');
        }

        return await jimp.read(
            image
        );
    }

    /**
     * Returns a vehicle signal.
     *
     * @param {ApiRequest} req The API request.
     * @param {string} name The name of the signal.
     *
     * @return {Promise<TValue>} The promise with the value.
     */
    public async _getVehicleSignal<TValue = any>(req: ApiRequest, name: string): Promise<TValue> {
        name = egoose.normalizeString(name);

        const ALL_SIGNALS: any = await req.vehicle
            .cache.get(KEY_SIGNALS, NOT_FOUND);
        if (_.isSymbol(ALL_SIGNALS)) {
            // not in cache

            return await req.vehicle
                .signals._get(name);
        }

        return ALL_SIGNALS[name];
    }

    /** @inheritdoc */
    public get __use() {
        return [
            // auth request
            async (req: Request, res: express.Response, next: express.NextFunction) => {
                try {
                    const X_API_KEY = egoose.normalizeString(
                        req.headers['x-api-key']
                    );
                    if ('' !== X_API_KEY) {
                        const VEHICLE_DOC = await this._withDatabase(async (db) => {
                            return await db.Vehicles
                                .findOne({
                                    'uuid': X_API_KEY,
                                }).exec();
                        });

                        if (!_.isNil(VEHICLE_DOC)) {
                            const VEHICLE: Vehicle = {
                                cache: new VehicleCache(VEHICLE_DOC),
                                doc: VEHICLE_DOC,
                                signals: new vehicles.VehicleSignalManager(VEHICLE_DOC),
                            };

                            req['vehicle'] = VEHICLE;

                            return next();
                        }
                    }
                } catch (e) {
                    this._logger
                        .err(e, 'ApiControllerBase(1)');
                }

                // incorrect API key
                return res.status(401)
                    .send() as any;
            },

            // log request
            async (req: ApiRequest, res: express.Response, next: express.NextFunction) => {
                if (<any>true) {
                    return next();  // TODO: temporarily deactivated
                }

                try {
                    const TAG = `request.ApiControllerBase(${req.vehicle.doc.uuid}::${req.path}::${req.method})'`;

                    const MSG = {
                        client: {
                            address: req.socket.remoteAddress,
                            port: req.socket.remotePort,
                        },
                        headers: req.headers,
                        params: req.params,
                        protocol: req.protocol,
                        query: req.query,
                    };

                    this._logger
                        .trace(MSG, TAG);
                } catch (e) {
                    console.error(e, 'ApiControllerBase(2)');
                }

                return next();
            },
        ];
    }
}
