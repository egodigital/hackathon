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
import * as mongoose from 'mongoose';
import * as path from 'path';
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
 * A document from 'vehicles' collection.
 */
export interface VehiclesDocument extends mongoose.Document {
    /**
     * The country.
     */
    country?: string;
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
     * The ID of the underlying team.
     */
    team_id: string;
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
     * Gets the 'vehiclebookings' collection.
     */
    public get VehicleBookings(): mongoose.Model<VehicleBookingsDocument> {
        return this.model('VehicleBookings');
    }

    /**
     * Gets the 'vehicles' collection.
     */
    public get Vehicles(): mongoose.Model<VehiclesDocument> {
        return this.model('Vehicles');
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

    return {
        id: doc.id,
        name: egoose.toStringSafe(doc.name)
            .trim(),
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

    return {
        event: egoose.normalizeString(doc.event),
        id: doc.id,
        status: egoose.normalizeString(doc.status),
        time: moment.utc(doc.time)
            .toISOString(),
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

    return {
        country: egoose.isEmptyString(doc.country) ?
            'D' : egoose.toStringSafe(doc.country).toUpperCase().trim(),
        id: doc.id,
        license_plate: egoose.toStringSafe(doc.license_plate)
            .toUpperCase()
            .trim(),
        manufacturer: egoose.toStringSafe(doc.manufacturer)
            .trim(),
        model: egoose.toStringSafe(doc.model_name)
            .trim(),
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
