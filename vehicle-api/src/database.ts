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
import * as egoose from '@egodigital/egoose';
import * as mongoose from 'mongoose';


/**
 * A document from 'logs' collections.
 */
export interface LogsDocument extends mongoose.Document {
    /**
     * The message.
     */
    message?: any;
    /**
     * The tag.
     */
    tag?: string;
    /**
     * The timestamp.
     */
    time: Date;
    /**
     * The type.
     */
    type: number;
}

/**
 * A document from 'logs' collections.
 */
export interface VehiclesDocument extends mongoose.Document {
    /**
     * The current image of the infotainment screen.
     */
    infotainment?: Buffer;
    /**
     * The mime type of the infotainment screen.
     */
    infotainment_mime?: string;
    /**
     * The last update time.
     */
    last_update?: Date;
    /**
     * A custom display name.
     */
    name?: string;
    /**
     * A state value.
     */
    state?: any;
    /**
     * The name of the team.
     */
    team?: string;
    /**
     * The UUID of the vehicle.
     */
    uuid: string;
}

/**
 * A document from 'vehicleevents' collections.
 */
export interface VehicleEventsDocument extends mongoose.Document {
    /**
     * The creation time.
     */
    creation_time: Date;
    /**
     * The data.
     */
    data?: any;
    /**
     * Is handled or not.
     */
    is_handled: boolean;
    /**
     * The last update time.
     */
    last_update?: Date;
    /**
     * The name.
     */
    name: string;
    /**
     * The ID of the vehicle.
     */
    vehicle_id: string;
}

/**
 * A document from 'vehiclesignallogs' collections.
 */
export interface VehicleSignalLogsDocument extends mongoose.Document {
    /**
     * The creation time.
     */
    creation_time: Date;
    /**
     * The name of signal.
     */
    name: string;
    /**
     * The new data.
     */
    new_data?: any;
    /**
     * The old data.
     */
    old_data?: any;
    /**
     * The ID of the signal.
     */
    signal_id: string;
    /**
     * The ID of the vehicle.
     */
    vehicle_id: string;
}

/**
 * A document from 'vehiclesignals' collections.
 */
export interface VehicleSignalsDocument extends mongoose.Document {
    /**
     * The creation time.
     */
    creation_time: Date;
    /**
     * The data.
     */
    data?: any;
    /**
     * The last update time.
     */
    last_update?: Date;
    /**
     * The name.
     */
    name: string;
    /**
     * The ID of the vehicle.
     */
    vehicle_id: string;
}

/**
 * Describes an action for a 'AppContext#withDatabase' method.
 *
 * @param {database.Database} db The current database (connection).
 * @param {mongoose.ClientSession} [session] The session, if an transaction has been opened.
 *
 * @return {TResult|Promise<TResult>} The result of that action.
 */
export type WithDatabaseAction<TResult = any> = (db: Database, session?: mongoose.ClientSession) => TResult | Promise<TResult>;


/**
 * A database connection.
 */
export class Database extends egoose.MongoDatabase {
    /** @inheritdoc */
    public static fromEnvironment(): Database {
        return new Database({
            database: process.env.MONGO_DB,
            host: process.env.MONGO_HOST,
            options: process.env.MONGO_OPTIONS,
            port: parseInt(process.env.MONGO_PORT),
            password: process.env.MONGO_PASSWORD,
            user: process.env.MONGO_USER,
        });
    }

    /**
     * Gets the 'logs' collection.
     */
    public get Logs(): mongoose.Model<LogsDocument> {
        return this.model('Logs');
    }

    /**
     * Gets the 'vehicleevents' collection.
     */
    public get VehicleEvents(): mongoose.Model<VehicleEventsDocument> {
        return this.model('VehicleEvents');
    }

    /**
     * Gets the 'vehicles' collection.
     */
    public get Vehicles(): mongoose.Model<VehiclesDocument> {
        return this.model('Vehicles');
    }

    /**
     * Gets the 'vehiclesignallogs' collection.
     */
    public get VehicleSignalLogs(): mongoose.Model<VehicleSignalLogsDocument> {
        return this.model('VehicleSignalLogs');
    }

    /**
     * Gets the 'vehiclesignals' collection.
     */
    public get VehicleSignals(): mongoose.Model<VehicleSignalsDocument> {
        return this.model('VehicleSignals');
    }
}


/**
 * Initializes the database schema.
 */
export function initSchema() {
    if (egoose.IS_LOCAL_DEV) {
        mongoose.set('debug', true);
    }

    mongoose.set('useCreateIndex', true);

    egoose.MONGO_SCHEMAS['Logs'] = new mongoose.Schema({
        message: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        tag: {
            lowercase: true,
            required: false,
            trim: true,
            type: String,
        },
        time: {
            type: Date,
        },
        type: {
            required: false,
            type: Number,
        },
    });
    egoose.MONGO_SCHEMAS['Logs']
        .index({ tag: 1 });
    egoose.MONGO_SCHEMAS['Logs']
        .index({ type: 1 });

    egoose.MONGO_SCHEMAS['Vehicles'] = new mongoose.Schema({
        infotainment: {
            required: false,
            type: Buffer,
        },
        infotainment_mime: {
            lowercase: true,
            required: false,
            trim: true,
            type: String,
        },
        last_update: {
            required: false,
            type: Date,
        },
        name: {
            required: false,
            trim: true,
            type: String,
        },
        state: {
            required: false,
            type: mongoose.Schema.Types.Mixed,
        },
        team: {
            required: false,
            type: String,
        },
        uuid: {
            default: egoose.uuid,
            type: String,
            unique: true,
        },
    });
    egoose.MONGO_SCHEMAS['Vehicles']
        .index({ team: 1 });

    egoose.MONGO_SCHEMAS['VehicleEvents'] = new mongoose.Schema({
        creation_time: {
            default: () => egoose.utc().toDate(),
            type: Date,
        },
        data: {
            required: false,
            type: mongoose.Schema.Types.Mixed,
        },
        is_handled: {
            default: false,
            type: Boolean,
        },
        last_update: {
            required: false,
            type: Date,
        },
        name: {
            lowercase: true,
            trim: true,
            type: String,
        },
        vehicle_id: {
            type: String,
        },
    });
    egoose.MONGO_SCHEMAS['VehicleEvents']
        .index({ is_handled: 1 });
    egoose.MONGO_SCHEMAS['VehicleEvents']
        .index({ name: 1 });
    egoose.MONGO_SCHEMAS['VehicleEvents']
        .index({ vehicle_id: 1 });

    egoose.MONGO_SCHEMAS['VehicleSignalLogs'] = new mongoose.Schema({
        creation_time: {
            default: () => egoose.utc().toDate(),
            type: Date,
        },
        name: {
            lowercase: true,
            trim: true,
            type: String,
        },
        new_data: {
            required: false,
            type: mongoose.Schema.Types.Mixed,
        },
        old_data: {
            required: false,
            type: mongoose.Schema.Types.Mixed,
        },
        signal_id: {
            type: String,
        },
        vehicle_id: {
            type: String,
        },
    });
    egoose.MONGO_SCHEMAS['VehicleSignalLogs']
        .index({ name: 1 });
    egoose.MONGO_SCHEMAS['VehicleSignalLogs']
        .index({ signal_id: 1 });
    egoose.MONGO_SCHEMAS['VehicleSignalLogs']
        .index({ vehicle_id: 1 });

    egoose.MONGO_SCHEMAS['VehicleSignals'] = new mongoose.Schema({
        creation_time: {
            default: () => egoose.utc().toDate(),
            type: Date,
        },
        data: {
            required: false,
            type: mongoose.Schema.Types.Mixed,
        },
        last_update: {
            required: false,
            type: Date,
        },
        name: {
            lowercase: true,
            trim: true,
            type: String,
        },
        vehicle_id: {
            type: String,
        },
    });
    egoose.MONGO_SCHEMAS['VehicleSignals']
        .index({ name: 1 });
    egoose.MONGO_SCHEMAS['VehicleSignals']
        .index({ vehicle_id: 1 });
    egoose.MONGO_SCHEMAS['VehicleSignals']
        .index({ name: 1, vehicle_id: 1 }, { unique: true });
}

/**
 * Converts a time value to an ISO string.
 *
 * @param {any} val The input value.
 *
 * @return {string} The ISO string.
 */
export function toISOString(val: any): string {
    const TIME = egoose.asUTC(val);
    if (_.isNil(TIME)) {
        return val as any;
    }

    return TIME.toISOString();
}

/**
 * Converts a vehicle document to a JSON object.
 *
 * @param {VehiclesDocument} vehicle The document from the database.
 *
 * @return {any} The JSON object.
 */
export function toJSONVehicle(vehicle: VehiclesDocument): any {
    if (_.isNil(vehicle)) {
        return vehicle;
    }

    return {
        'id': egoose.normalizeString(vehicle.uuid),
        'last_update': toISOString(vehicle.last_update),
        'name': egoose.isEmptyString(vehicle.name) ? undefined
            : egoose.toStringSafe(vehicle.name).trim(),
        'state': vehicle.state,
        'team': egoose.isEmptyString(vehicle.team) ? undefined
            : egoose.toStringSafe(vehicle.team).trim(),
    };
}

/**
 * Converts a vehicle event document to a JSON object.
 *
 * @param {VehicleEventsDocument} e The document from the database.
 *
 * @return {any} The JSON object.
 */
export function toJSONVehicleEvent(e: VehicleEventsDocument): any {
    if (_.isNil(e)) {
        return e;
    }

    return {
        'creation_time': toISOString(e.creation_time),
        'id': egoose.normalizeString(e.id),
        'is_handled': egoose.toBooleanSafe(e.is_handled),
        'last_update': toISOString(e.last_update),
        'data': e.data,
        'name': egoose.normalizeString(e.name),
    };
}

/**
 * Converts a vehicle signal document to a JSON object.
 *
 * @param {VehicleSignalsDocument} signal The document from the database.
 *
 * @return {any} The JSON object.
 */
export function toJSONVehicleSignal(signal: VehicleSignalsDocument): any {
    if (_.isNil(signal)) {
        return signal;
    }

    return {
        'creation_time': toISOString(signal.creation_time),
        'id': egoose.normalizeString(signal.id),
        'last_update': toISOString(signal.last_update),
        'name': egoose.normalizeString(signal.name),
        'data': signal.data,
    };
}

/**
 * Converts a vehicle signal log document to a JSON object.
 *
 * @param {VehicleSignalLogsDocument} log The document from the database.
 *
 * @return {any} The JSON object.
 */
export function toJSONVehicleSignalLog(log: VehicleSignalLogsDocument): any {
    if (_.isNil(log)) {
        return log;
    }

    return {
        'creation_time': toISOString(log.creation_time),
        'id': egoose.normalizeString(log.id),
        'name': egoose.normalizeString(log.name),
        'old_data': log.old_data,
        'new_data': log.new_data,
    };
}

/**
 * Invokes an action for an open database connection.
 *
 * @param {WithDatabaseAction<TResult>} action The action to invoke.
 * @param {boolean} [inTransaction] Execute action inside a transaction or not. Default: (false)
 *
 * @return {Promise<TResult>} The promise with the result of {action}.
 */
export async function withDatabase<TResult = any>(action: WithDatabaseAction<TResult>, inTransaction?: boolean): Promise<TResult> {
    inTransaction = egoose.toBooleanSafe(inTransaction);

    const DB = Database.fromEnvironment();

    await DB.connect();

    let session: mongoose.ClientSession;
    if (inTransaction) {
        session = await DB.mongo.startSession();
        session.startTransaction();
    }

    try {
        const RESULT = await Promise.resolve(
            action(DB, session)
        );

        if (session) {
            await session.commitTransaction();
        }

        return RESULT;
    } catch (e) {
        if (session) {
            await session.abortTransaction();
        }

        throw e;
    } finally {
        await DB.disconnect();
    }
}
