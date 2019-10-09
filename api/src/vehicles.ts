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

import * as _ from 'lodash';
import * as database from './database';
import * as egoose from '@egodigital/egoose';
import { DecoratorFunction } from './contracts';


interface SignalValueHandler {
    get: (name: string) => any;
    set?: (name: string, newValue: string) => any;
}

/**
 * A vehicle signal access method.
 *
 * @param {VehicleSignalMethodExecutionContext} context The execution context,
 */
export type VehicleSignalMethod = (context: VehicleSignalMethodExecutionContext) => any;

/**
 * The execution context of a 'VehicleSignalMethod' function.
 */
export interface VehicleSignalMethodExecutionContext {
    /**
     * The access direction.
     */
    direction: VehicleSignalAccessDirection;
    /**
     * The document in the database, if available.
     */
    doc: database.VehicleSignalsDocument;
    /**
     * The old document in the database, if available.
     */
    oldDoc?: database.VehicleSignalsDocument;
    /**
     * The value that will be returned or has been written.
     */
    value: any;
}

/**
 * Options for 'VehicleSignal' decorator.
 */
export interface VehicleSignalOptions {
    /**
     * Indicates if signal can be set or not.
     */
    canWrite?: boolean;
    /**
     * The default value.
     */
    default: any;
    /**
     * The value transformer.
     */
    transformer?: VehicleSignalValueTransformer;
    /**
     * Validates a value.
     */
    validator?: VehicleSignalValueValidator;
}

/**
 * Transforms a value, before it is saved.
 *
 * @param {any} value The value to transform.
 * @param {string} name The name of the signal.
 *
 * @return {any} The transformed value.
 */
export type VehicleSignalValueTransformer = (value: any, name: string) => any;

/**
 * A function, that validates a vehicle signal value.
 *
 * @param {any} value The value to check.
 * @param {string} name The name of the signal.
 *
 * @return {VehicleSignalValueValidatorResult|PromiseLike<VehicleSignalValueValidatorResult>} If defined, this is the error message to thrown, if validation failed.
 */
export type VehicleSignalValueValidator = (value: any, name: string) =>
    VehicleSignalValueValidatorResult | PromiseLike<VehicleSignalValueValidatorResult>;

export type VehicleSignalValueValidatorResult = string | undefined | null | void;

/**
 * List of vehicle signal values.
 */
export type VehicleSignalValueList = { [name: string]: any };

/**
 * Direction of a vehicle signal access.
 */
export enum VehicleSignalAccessDirection {
    /**
     * Reading
     */
    Read = 0,
    /**
     * Writing
     */
    Write = 1,
    /**
     * Writing (new)
     */
    New = 2,
    /**
     * Writing (update)
     */
    Update = 3,
}


const DEFAULT_PERCENTAGE = 100;
const DEFAULT_ON_OFF = 'off';
const DEFAULT_OPEN_CLOSED = 'closed';
const SIGNAL_NAME_REGEX = /^([a-z]|[0-9]|_){1,}$/;
const SIGNAL_VALUE_HANDLER = Symbol('SIGNAL_VALUE_HANDLER');
const VEHICLE_CACHE_STORAGE: {
    [vehicleId: string]: { [key: string]: any }
} = {};
const VEHICLE_CACHE_QUEUE = egoose.createQueue();

/**
 * Marks a method as vehicle signal.
 *
 * @param {VehicleSignalOptions} opts The options.
 *
 * @return {DecoratorFunction} The decorator function.
 */
export function VehicleSignal(opts: VehicleSignalOptions): DecoratorFunction {
    return function (controllerConstructor: any, name: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = true;

        const METHOD: VehicleSignalMethod = descriptor.value;

        const HANDLER: SignalValueHandler = {
            get: async function (name: string) {
                const MANAGER: VehicleSignalManager = this;
                name = egoose.normalizeString(name);

                let doc: database.VehicleSignalsDocument;
                const VALUE = await MANAGER._withDatabase(async (db) => {
                    doc = await db.VehicleSignals.findOne({
                        'name': name,
                        'vehicle_id': egoose.normalizeString(MANAGER.vehicle._id),
                    }).exec();

                    if (!_.isNil(doc)) {
                        return doc.data;
                    }

                    return opts.default;
                }, true);

                const CTX: VehicleSignalMethodExecutionContext = {
                    direction: VehicleSignalAccessDirection.Read,
                    doc,
                    value: VALUE,
                };

                await Promise.resolve(
                    METHOD.apply(
                        MANAGER, [CTX]
                    )
                );

                return 'NaN' === egoose.toStringSafe(VALUE) ?
                    'NaN' : VALUE;
            }
        };

        HANDLER.set = async function (name: string, newValue: any) {
            if (!egoose.toBooleanSafe(opts.canWrite, true)) {
                throw new Error('Signal is read-only');
            }

            const MANAGER: VehicleSignalManager = this;
            name = egoose.normalizeString(name);

            if (opts.validator) {
                const ERROR_MSG = await Promise.resolve(
                    opts.validator.apply(
                        MANAGER, [
                        newValue, name
                    ]
                    )
                );

                if (!egoose.isEmptyString(ERROR_MSG)) {
                    throw new Error(ERROR_MSG);
                }
            }

            if (opts.transformer) {
                newValue = await Promise.resolve(
                    opts.transformer.apply(
                        MANAGER, [
                        newValue, name
                    ]
                    )
                );
            }

            let direction = VehicleSignalAccessDirection.Write;
            let doc: database.VehicleSignalsDocument;
            let oldDoc: database.VehicleSignalsDocument;
            await MANAGER._withDatabase(async (db) => {
                oldDoc = await db.VehicleSignals.findOne({
                    'name': name,
                    'vehicle_id': egoose.normalizeString(MANAGER.vehicle._id),
                }).exec();

                if (_.isNil(oldDoc)) {
                    // new

                    direction = VehicleSignalAccessDirection.New;
                    doc = (await db.VehicleSignals.insertMany([
                        {
                            'name': name,
                            'vehicle_id': egoose.normalizeString(MANAGER.vehicle._id),
                            'data': newValue,
                        }
                    ]))[0];
                } else {
                    // update

                    direction = VehicleSignalAccessDirection.Update;
                    await db.VehicleSignals.updateOne({
                        '_id': oldDoc._id,
                    }, {
                        'data': newValue,
                        'last_update': egoose.utc().toDate(),
                    }).exec();

                    // get up-to-date document
                    doc = await db.VehicleSignals
                        .findById(oldDoc._id)
                        .exec();
                }

                let old_data: any;
                if (!_.isNil(oldDoc)) {
                    old_data = oldDoc.data;
                }

                let new_data: any;
                if (!_.isNil(doc)) {
                    new_data = doc.data;
                }

                // log
                try {
                    await db.VehicleSignalLogs.insertMany([{
                        old_data,
                        name,
                        new_data,
                        signal_id: egoose.normalizeString(doc._id),
                        vehicle_id: egoose.normalizeString(MANAGER.vehicle._id),
                    }]);
                } catch (e) {
                    console.error(e);
                }

                // event
                try {
                    if (old_data !== new_data) {
                        await db.VehicleEvents.insertMany([{
                            data: {
                                old_data,
                                new_data,
                            },
                            name: 'signal_change::' + name,
                            is_handled: false,
                            vehicle_id: egoose.normalizeString(MANAGER.vehicle._id),
                        }]);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, true);

            const CTX: VehicleSignalMethodExecutionContext = {
                direction,
                doc,
                oldDoc,
                value: newValue,
            };

            await Promise.resolve(
                METHOD.apply(
                    MANAGER, [CTX]
                )
            );
        };

        METHOD[SIGNAL_VALUE_HANDLER] = HANDLER;
    };
}


function transformToInt(): VehicleSignalValueTransformer {
    return (value, name) => {
        value = parseInt(
            egoose.toStringSafe(value)
                .trim()
        );

        return isNaN(value) ?
            null : value;
    };
}

function transformToNumber(): VehicleSignalValueTransformer {
    return (value, name) => {
        value = parseFloat(
            egoose.toStringSafe(value)
                .trim()
        );

        return isNaN(value) ?
            Number.NaN : value;
    };
}

function validateArray(...valueList: any[]): VehicleSignalValueValidator {
    return (value, name) => {
        if (valueList.indexOf(value) < 0) {
            return `You can only use the following value(s) for '${name}': ${valueList.join(", ")}`;
        }
    };
}

function validateGeoCoordinates(): VehicleSignalValueValidator {
    return (value, name) => {
        try {
            const VALUE = egoose.toStringSafe(value)
                .trim();

            const SEP = VALUE.indexOf(',');
            if (SEP < 0) {
                return 'Value must be in following format: LATITUDE,LONGITUDE';
            }

            const PARTS = VALUE.split(',');
            if (2 !== PARTS.length) {
                return 'Value must be in following format: LATITUDE,LONGITUDE';
            }

            const LAT = parseFloat(PARTS[0].trim());
            if (isNaN(LAT)) {
                return 'Latitude value must be a valid float value in english number format';
            }

            if (LAT < -90 || LAT > 90) {
                return 'Latitude value must be between -90 and 90';
            }

            const LNG = parseFloat(PARTS[1].trim());
            if (isNaN(LNG)) {
                return 'Longitude value must be a valid float value in english number format';
            }

            if (LNG < -180 || LNG > 180) {
                return 'Longitude value must be between -180 and 180';
            }
        } catch (e) {
            return 'Could not parse value: ' + egoose.toStringSafe(e);
        }
    };
}

function validateNumber(allowNaN: boolean, min?: number, max?: number): VehicleSignalValueValidator {
    return (value, name) => {
        let num = parseFloat(
            egoose.toStringSafe(value).trim()
        );
        if (isNaN(num)) {
            num = Number.NaN;
        }

        if (allowNaN) {
            if (isNaN(num)) {
                return;
            }
        } else {
            if (isNaN(num)) {
                return `'${name}' is not a number`;
            }
        }

        if (!isNaN(min)) {
            if (min > num) {
                return `The minimum value of '${name}' must be ${min}`;
            }
        }

        if (!isNaN(max)) {
            if (max < num) {
                return `The maximum value of '${name}' must be ${max}`;
            }
        }
    };
}

function validateOnOff(): VehicleSignalValueValidator {
    return validateArray('on', 'off');
}

function validateOpenClosed(): VehicleSignalValueValidator {
    return validateArray('open', 'closed');
}

function validatePercentage(): VehicleSignalValueValidator {
    return validateNumber(false, 0, 100);
}


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
 * Manages signals of a vehicle.
 */
export class VehicleSignalManager {
    /**
     * Initializes a new instance of that class.
     *
     * @param {database.VehiclesDocument} vehicle The document in the database.
     */
    public constructor(
        public readonly vehicle: database.VehiclesDocument,
    ) { }

    /**
     * Gets a value.
     *
     * @param {string} name The name of the value.
     *
     * @return {Promise<false|string|null|undefined>} The promise with the value or (false) if name is invalid.
     */
    public async _get(name: string): Promise<any> {
        const HANDLER = this._getValueHandler(name);
        if (false !== HANDLER) {
            return await Promise.resolve(
                HANDLER.get.apply(this, [
                    name
                ])
            );
        }

        return false;
    }

    /**
     * Returns a list of all signals.
     *
     * @return {Promise<VehicleSignalValueList>} The promise with the signals and their values,
     */
    public async _getAll(): Promise<VehicleSignalValueList> {
        const VALUES: VehicleSignalValueList = {};

        for (const PROP of Object.keys(VehicleSignalManager.prototype)) {
            if (PROP.startsWith('_')) {
                continue;
            }

            const HANDLER = this._getValueHandler(PROP);
            if (false !== HANDLER) {
                VALUES[PROP] = await Promise.resolve(
                    HANDLER.get.apply(this, [
                        PROP
                    ])
                );
            }
        }

        return VALUES;
    }

    private _getValueHandler(name: string): SignalValueHandler | false {
        name = egoose.normalizeString(name);
        if (SIGNAL_NAME_REGEX.test(name)) {
            const FUNC: Function = this[name];
            if (_.isFunction(FUNC)) {
                const HANDLER: SignalValueHandler = FUNC[SIGNAL_VALUE_HANDLER];
                if (!_.isNil(HANDLER)) {
                    return HANDLER;
                }
            }
        }

        return false;
    }

    /**
     * Sets a value.
     *
     * @param {string} name The name of the value.
     * @param {string} newValue The new value.
     *
     * @return {Promise<boolean>} The promise that indicates if operation was successful or not.
     */
    public async _set(name: string, newValue: string): Promise<boolean> {
        const HANDLER = this._getValueHandler(name);
        if (false !== HANDLER) {
            const SETTER = HANDLER.set;
            if (!_.isNil(SETTER)) {
                await Promise.resolve(
                    SETTER.apply(this, [
                        name, newValue
                    ])
                );

                return true;
            }
        }

        return false;
    }

    /** @inheritdoc */
    public readonly _withDatabase = database.withDatabase;


    @VehicleSignal({
        validator: validateArray('yes', 'no'),
        default: 'no',
    })
    public battery_charging() { /* battery charging */ }

    @VehicleSignal({
        validator: validateNumber(false, 0),
        transformer: transformToNumber(),
        default: 16,
    })
    public battery_charging_current() { /* battery charging current */ }

    @VehicleSignal({
        validator: validatePercentage(),
        transformer: transformToNumber(),
        default: DEFAULT_PERCENTAGE,
    })
    public battery_health() { /* battery health */ }

    @VehicleSignal({
        validator: validateNumber(false, 0),
        transformer: transformToNumber(),
        default: 11,
    })
    public battery_loading_capacity() { /* battery loading capacity */ }

    @VehicleSignal({
        validator: validatePercentage(),
        transformer: transformToNumber(),
        default: DEFAULT_PERCENTAGE,
    })
    public battery_state_of_charge() { /* battery state of charge */ }

    @VehicleSignal({
        validator: validateNumber(false, 14, 24),
        transformer: transformToNumber(),
        default: 17.5,
    })
    public battery_total_kwh_capacity() { /* capacity of the car's battery in kWh */ }

    @VehicleSignal({
        validator: validatePercentage(),
        transformer: transformToNumber(),
        default: DEFAULT_PERCENTAGE,
    })
    public brake_fluid_level() { /* brake fluid level */ }

    @VehicleSignal({
        validator: validateNumber(false, 0),
        transformer: transformToNumber(),
        default: 150,
    })
    public calculated_remaining_distance() { /* calculated remaining distance */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public central_locking_system() { /* central locking system */ }

    @VehicleSignal({
        validator: validateNumber(true, 0),
        transformer: transformToNumber(),
        default: Number.NaN,
    })
    public distance_to_object_back() { /* distance to back object */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 30),
        transformer: transformToNumber(),
        default: 20,
    })
    public distance_to_object_bottom() { /* distance to buttom object */ }

    @VehicleSignal({
        validator: validateNumber(true, 0),
        transformer: transformToNumber(),
        default: Number.NaN,
    })
    public distance_to_object_front() { /* distance to front object */ }

    @VehicleSignal({
        validator: validateNumber(true, 0),
        transformer: transformToNumber(),
        default: Number.NaN,
    })
    public distance_to_object_left() { /* distance to left object */ }

    @VehicleSignal({
        validator: validateNumber(true, 0),
        transformer: transformToNumber(),
        default: Number.NaN,
    })
    public distance_to_object_right() { /* distance to right object */ }

    @VehicleSignal({
        validator: validateNumber(false, 0),
        transformer: transformToNumber(),
        default: 0,
    })
    public distance_trip() { /* distance current trip */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public door_disc_front_left() { /* door disc front left */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public door_disc_front_right() { /* door disc front right */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public door_front_left() { /* door (front left) */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public door_front_right() { /* door (front right) */ }

    @VehicleSignal({
        validator: validateArray('comfort', 'eco', 'sport'),
        default: 'eco',
    })
    public drive_mode() { /* drive mode */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public flash() { /* flash */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public heated_seats() { /* heated seats */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public high_beam() { /* high beam */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public infotainment() { /* infotainment */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 10),
        transformer: transformToInt(),
        default: 5,
    })
    public infotainment_volume() { /* volume of infotainment system */ }

    @VehicleSignal({
        validator: validateGeoCoordinates(),
        default: '50.782117,6.047171',
    })
    public location() { /* geo location */ }

    @VehicleSignal({
        validator: validateNumber(false, 0),
        transformer: transformToInt(),
        default: 0,
    })
    public mileage() { /* mileage */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public motor_control_lamp() { /* motor control lamp */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 4),
        transformer: transformToInt(),
        default: 0,
    })
    public person_count() { /* number of persons in car */ }

    @VehicleSignal({
        validator: validateNumber(true, 0, 300),
        transformer: transformToNumber(),
        default: Number.NaN,
    })
    public pulse_sensor_steering_wheel() { /* pulse sensor steering wheel */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 40),
        transformer: transformToNumber(),
        default: 0,
    })
    public power_consumption() { /* power consumption */ }

    @VehicleSignal({
        validator: validateArray('no_rain', 'rain'),
        default: 'no_rain',
    })
    public rain_sensor() { /* rain sensor */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public rear_running_lights() { /* rear running lights */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public side_lights() { /* sidelights */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 200),
        transformer: transformToInt(),
        default: 0,
    })
    public speed() { /* speed */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public stop_lights() { /* stop lights */ }

    @VehicleSignal({
        validator: validateNumber(false, -100, 100),
        transformer: transformToInt(),
        default: 20,
    })
    public temperature_inside() { /* temperature inside */ }

    @VehicleSignal({
        validator: validateNumber(false, -100, 100),
        transformer: transformToInt(),
        default: 10,
    })
    public temperature_outside() { /* temperature outside */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 5),
        transformer: transformToNumber(),
        default: 3,
    })
    public tire_pressure_back_left() { /* tire pressure (back left) */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 5),
        transformer: transformToNumber(),
        default: 3,
    })
    public tire_pressure_back_right() { /* tire pressure (back right) */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 5),
        transformer: transformToNumber(),
        default: 3,
    })
    public tire_pressure_front_left() { /* tire pressure (front left) */ }

    @VehicleSignal({
        validator: validateNumber(false, 0, 5),
        transformer: transformToNumber(),
        default: 3,
    })
    public tire_pressure_front_right() { /* tire pressure (front right) */ }

    @VehicleSignal({
        validator: validateOpenClosed(),
        default: DEFAULT_OPEN_CLOSED,
    })
    public trunk() { /* trunk */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public turn_signal_left() { /* turn signal (left) */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public turn_signal_right() { /* turn signal (right) */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public warning_blinker() { /* warning blinker */ }

    @VehicleSignal({
        validator: validateNumber(false, 1200, 3500),
        transformer: transformToInt(),
        default: 1200,
    })
    public weight() { /* total weight */ }

    @VehicleSignal({
        validator: validateOnOff(),
        default: DEFAULT_ON_OFF,
    })
    public windshield_wipers() { /* windshield wipers */ }

    @VehicleSignal({
        validator: validatePercentage(),
        default: DEFAULT_PERCENTAGE,
    })
    public wiping_water_level() { /* wiping water level */ }
}
