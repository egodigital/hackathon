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
import * as egoose from '@egodigital/egoose';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { serializeForJSON } from '@egodigital/express-controllers';
import { Team } from './contracts';


/**
 * A document from 'environments' collection.
 */
export interface EnvironmentsDocument extends mongoose.Document {
    /**
     * The name of the environment.
     */
    name: string;
    /**
     * The ID of the underlying team.
     */
    team_id: string;
}

/**
 * A document from 'logs' collection.
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

interface MongooseSchemaModule {
    readonly SCHEMA: mongoose.SchemaDefinition;
    readonly setupSchema?: (schema: mongoose.Schema, name: string) => any;
}

/**
 * A document from 'teams' collection.
 */
export interface TeamsDocument extends mongoose.Document {
    /**
     * The API key for the team.
     */
    api_key: string;
    /**
     * The (display) name of the team.
     */
    name: string;
}

/**
 * A document from 'vehiclebookinglogs' collection.
 */
export interface VehicleBookingLogsDocument extends mongoose.Document {
    /**
     * The ID of the underlying booking.
     */
    booking_id: string;
    /**
     * The 'event' value, when the logging entry was created.
     */
    event: string;
    /**
     * The message data.
     */
    message?: any;
    /**
     * The 'status' value, when the logging entry was created.
     */
    status: string;
    /**
     * The ID of the underlying team.
     */
    team_id: string;
    /**
     * The timestamp (UTC).
     */
    time: Date;
}

/**
 * A document from 'vehiclebookings' collection.
 */
export interface VehicleBookingsDocument extends mongoose.Document {
    /**
     * The event (type).
     */
    event: string;
    /**
     * The start time (UTC).
     */
    from: Date;
    /**
     * The status.
     */
    status: string;
    /**
     * The timestamp (UTC).
     */
    time: Date;
    /**
     * The until time (UTC).
     */
    until: Date;
    /**
     * The ID of the underlying vehicle.
     */
    vehicle_id: string;
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
 * A document from 'vehicles' collection.
 */
export interface VehiclesDocument extends mongoose.Document {
    /**
     * The country.
     */
    country?: string;
    /**
     * The ID of the underlying environment.
     */
    environment_id?: string;
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
     * The license plate.
     */
    license_plate: string;
    /**
     * The manufacturer.
     */
    manufacturer: string;
    /**
     * The name of the model.
     */
    model_name: string;
    /**
     * A custom display name.
     */
    name?: string;
    /**
     * A state value.
     */
    state?: any;
    /**
     * The ID of the underlying team.
     */
    team_id: string;
    /**
     * The UUID of the vehicle.
     */
    uuid: string;
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
export type WithDatabaseAction<TResult extends any = any> = (db: Database, session?: mongoose.ClientSession) => TResult | Promise<TResult>;


/**
 * A database connection.
 */
export class Database extends egoose.MongoDatabase {
    /**
     * Gets the 'environments' collection.
     */
    public get Environments(): mongoose.Model<EnvironmentsDocument> {
        return this.model('Environments');
    }

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
     * Gets the 'teams' collection.
     */
    public get Teams(): mongoose.Model<TeamsDocument> {
        return this.model('Teams');
    }

    /**
     * Gets the 'vehiclebookinglogs' collection.
     */
    public get VehicleBookingLogs(): mongoose.Model<VehicleBookingLogsDocument> {
        return this.model('VehicleBookingLogs');
    }

    /**
     * Gets the 'vehiclebookings' collection.
     */
    public get VehicleBookings(): mongoose.Model<VehicleBookingsDocument> {
        return this.model('VehicleBookings');
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
     * Gets the 'vehicles' collection.
     */
    public get VehicleSignals(): mongoose.Model<VehicleSignalsDocument> {
        return this.model('VehicleSignals');
    }
}


/**
 * Creates a new team object from a database document.
 *
 * @param {TeamsDocument} doc The document.
 * @param {Database} db The database connection.
 * 
 * @return {Promise<Team>} The promise with the new object.
 */
export async function createTeam(doc: TeamsDocument, db: Database): Promise<Team> {
    if (!doc) {
        return doc as any;
    }

    return {
        id: doc.id,
        name: egoose.toStringSafe(doc.name)
            .trim(),
    };
}

/**
 * Converts an environment document to a JSON object.
 *
 * @param {EnvironmentsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function environmentToJSON(
    doc: EnvironmentsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let teamDoc: TeamsDocument;

    const TEAM_ID = egoose.normalizeString(doc.team_id);
    if ('' !== TEAM_ID) {
        teamDoc = await db.Teams
            .findById(TEAM_ID)
            .exec();
    }

    return {
        id: doc.id,
        name: egoose.toStringSafe(doc.name)
            .trim(),
        team: await teamToJSON(teamDoc, db),
    };
}

/**
 * Initializes the database schema.
 */
export async function initDatabaseSchema() {
    if (egoose.IS_LOCAL_DEV) {
        mongoose.set('debug', true);
    }

    mongoose.set('useCreateIndex', true);

    // load from database/schemas
    {
        const SCHEMA_MODULE_FILES = egoose.from(
            await egoose.glob(
                '*' + path.extname(__filename),
                {
                    absolute: true,
                    cwd: path.resolve(
                        path.join(__dirname, './database/schemas')
                    ),
                    onlyFiles: true,
                    nocase: true,
                    unique: true,
                }
            ) as string[]
        ).orderBy(f => egoose.normalizeString(path.dirname(f)))
            .thenBy(f => egoose.normalizeString(path.basename(f)));

        for (const SF of SCHEMA_MODULE_FILES) {
            const SCHEMA_NAME = path.basename(
                SF, path.extname(SF)
            ).trim();

            if (SCHEMA_NAME.startsWith('_')) {
                continue;
            }

            const SCHEMA_MODULE: MongooseSchemaModule = require(
                './database/schemas/' + SCHEMA_NAME
            );

            const NEW_SCHEMA = new mongoose.Schema(SCHEMA_MODULE.SCHEMA);
            if (SCHEMA_MODULE.setupSchema) {
                await Promise.resolve(
                    SCHEMA_MODULE.setupSchema(NEW_SCHEMA, SCHEMA_NAME)
                );
            }

            egoose.MONGO_SCHEMAS[SCHEMA_NAME] = NEW_SCHEMA;

            if (egoose.IS_LOCAL_DEV) {
                console.log(`🦆🦆🦆  Loaded Mongoose schema '${SCHEMA_NAME}' from '${
                    SF
                    }'  🦆🦆🦆`);
            }
        }
    }
}

/**
 * Resets the data of a team.
 *
 * @param {string} id The ID of the team.
 * @param {Database} db The underlying database connection.
 */
export async function resetTeam(id: string, db: Database) {
    const TEAM_DOC = await db.Teams
        .findById(id)
        .exec();
    if (!TEAM_DOC) {
        return;
    }

    // old environments
    const OLD_ENVIRONMENTS = await db.Environments
        .find({ 'team_id': TEAM_DOC.id })
        .exec();
    for (const E of OLD_ENVIRONMENTS) {
        await db.Environments.remove({
            '_id': E._id,
        });
    }

    // old vehicles
    const OLD_VEHICLES = await db.Vehicles
        .find({ 'team_id': TEAM_DOC.id })
        .exec();
    for (const V of OLD_VEHICLES) {
        await db.Vehicles.remove({
            '_id': V._id,
        });

        // bookings
        const OLD_BOOKINGS = await db.VehicleBookings
            .find({ 'vehicle_id': V.id })
            .exec();
        for (const B of OLD_BOOKINGS) {
            await db.VehicleBookings.remove({
                '_id': B._id,
            });
        }
    }

    // new environment
    const NEW_ENVIRONMENT = (await db.Environments.insertMany([{
        'name': 'e.GO Campus-Boulevard 30, Aachen, Germany',
        'team_id': TEAM_DOC.id,
    }]))[0];

    // new vehicles
    await db.Vehicles.insertMany([{
        'country': 'D',
        'environment_id': NEW_ENVIRONMENT.id,
        'license_plate': 'AC-EGO 123',
        'manufacturer': 'e.GO',
        'model_name': 'Life 20',
        'team_id': TEAM_DOC.id,
    }, {
        'country': 'D',
        'environment_id': NEW_ENVIRONMENT.id,
        'license_plate': 'AC-EGO 456',
        'manufacturer': 'e.GO',
        'model_name': 'Life 40',
        'team_id': TEAM_DOC.id,
    }, {
        'country': 'D',
        'environment_id': NEW_ENVIRONMENT.id,
        'license_plate': 'AC-EGO 789',
        'manufacturer': 'e.GO',
        'model_name': 'Life 60',
        'team_id': TEAM_DOC.id,
    }, {
        'country': 'D',
        'environment_id': NEW_ENVIRONMENT.id,
        'license_plate': 'AC-EGO 1011',
        'manufacturer': 'e.GO',
        'model_name': 'Life CS',
        'team_id': TEAM_DOC.id,
    }, {
        'country': 'D',
        'environment_id': NEW_ENVIRONMENT.id,
        'license_plate': 'AC-EGO 1213',
        'manufacturer': 'e.GO',
        'model_name': 'Life CS',
        'team_id': TEAM_DOC.id,
    }]);
}

/**
 * Converts a team to a JSON object.
 *
 * @param {TeamsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function teamToJSON(
    doc: TeamsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    return {
        id: doc.id,
        name: egoose.toStringSafe(doc.name)
            .trim(),
    };
}

/**
 * Converts a vehicle booking document to a JSON object.
 *
 * @param {VehicleBookingsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function vehicleBookingToJSON(
    doc: VehicleBookingsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let vehicleDoc: VehiclesDocument;

    const VEHICLE_ID = egoose.normalizeString(doc.vehicle_id);
    if ('' !== VEHICLE_ID) {
        vehicleDoc = await db.Vehicles
            .findById(VEHICLE_ID)
            .exec();
    }

    return {
        event: egoose.normalizeString(doc.event),
        id: doc.id,
        status: egoose.normalizeString(doc.status),
        time: moment.utc(doc.time)
            .toISOString(),
        vehicle: await vehicleToJSON(vehicleDoc, db),
    };
}

/**
 * Converts a vehicle event document to a JSON object.
 *
 * @param {VehicleEventsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function vehicleEventToJSON(
    doc: VehicleEventsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let vehicleDoc: VehiclesDocument;

    const VEHICLE_ID = egoose.normalizeString(doc.vehicle_id);
    if ('' !== VEHICLE_ID) {
        vehicleDoc = await db.Vehicles
            .findById(VEHICLE_ID)
            .exec();
    }

    return {
        creationTime: moment.utc(doc.creation_time)
            .toISOString(),
        data: await serializeForJSON(doc.data),
        id: doc.id,
        isHandled: !!doc.is_handled,
        lastUpdate: _.isDate(doc.last_update) ?
            moment.utc(doc.last_update).toISOString() : undefined,
        name: egoose.normalizeString(doc.name),
        vehicle: await vehicleToJSON(vehicleDoc, db),
    };
}

/**
 * Converts a vehicle signal log document to a JSON object.
 *
 * @param {VehicleSignalLogsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function vehicleSignalLogToJSON(
    doc: VehicleSignalLogsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let vehicleDoc: VehiclesDocument;
    let signalDoc: VehicleSignalsDocument;

    const VEHICLE_ID = egoose.normalizeString(doc.vehicle_id);
    if ('' !== VEHICLE_ID) {
        vehicleDoc = await db.Vehicles
            .findById(VEHICLE_ID)
            .exec();
    }

    const SIGNAL_ID = egoose.normalizeString(doc.signal_id);
    if ('' !== SIGNAL_ID) {
        signalDoc = await db.VehicleSignals
            .findById(SIGNAL_ID)
            .exec();
    }

    return {
        creationTime: moment.utc(doc.creation_time)
            .toISOString(),
        name: egoose.normalizeString(doc.name),
        newData: await serializeForJSON(doc.new_data),
        oldData: await serializeForJSON(doc.old_data),
        signal: await vehicleSignalToJSON(signalDoc, db),
        vehicle: await vehicleToJSON(vehicleDoc, db),
    };
}

/**
 * Converts a vehicle signal document to a JSON object.
 *
 * @param {VehicleSignalsDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function vehicleSignalToJSON(
    doc: VehicleSignalsDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let vehicleDoc: VehiclesDocument;

    const VEHICLE_ID = egoose.normalizeString(doc.vehicle_id);
    if ('' !== VEHICLE_ID) {
        vehicleDoc = await db.Vehicles
            .findById(VEHICLE_ID)
            .exec();
    }

    return {
        creationTime: moment.utc(doc.creation_time)
            .toISOString(),
        data: await serializeForJSON(doc.data),
        lastUpdate: _.isDate(doc.last_update) ?
            moment.utc(doc.last_update).toISOString() : undefined,
        name: egoose.normalizeString(doc.name),
        vehicle: await vehicleToJSON(vehicleDoc, db),
    };
}

/**
 * Converts a vehicle document to a JSON object.
 *
 * @param {VehiclesDocument} doc The document.
 * @param {Database} db The underlying database connection.
 * 
 * @return {Promise<any>} The promise with the JSON object.
 */
export async function vehicleToJSON(
    doc: VehiclesDocument, db: Database
): Promise<any> {
    if (!doc) {
        return doc as any;
    }

    let environmentDoc: EnvironmentsDocument;
    let teamDoc: TeamsDocument;

    const ENVIRONMENT_ID = egoose.normalizeString(doc.environment_id);
    if ('' !== ENVIRONMENT_ID) {
        environmentDoc = await db.Environments
            .findById(ENVIRONMENT_ID)
            .exec();
    }

    const TEAM_ID = egoose.normalizeString(doc.team_id);
    if ('' !== TEAM_ID) {
        teamDoc = await db.Teams
            .findById(TEAM_ID)
            .exec();
    }

    return {
        country: egoose.isEmptyString(doc.country) ?
            'D' : egoose.toStringSafe(doc.country).toUpperCase().trim(),
        environment: await environmentToJSON(environmentDoc, db),
        id: doc.id,
        licensePlate: egoose.toStringSafe(doc.license_plate)
            .toUpperCase()
            .trim(),
        manufacturer: egoose.toStringSafe(doc.manufacturer)
            .trim(),
        model: egoose.toStringSafe(doc.model_name)
            .trim(),
        team: await teamToJSON(teamDoc, db),
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
export async function withDatabase<TResult extends any = any>(action: WithDatabaseAction<TResult>, inTransaction?: boolean): Promise<TResult> {
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
