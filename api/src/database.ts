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
}


/**
 * Initializes the database schema.
 */
export async function initDatabaseSchema() {
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
