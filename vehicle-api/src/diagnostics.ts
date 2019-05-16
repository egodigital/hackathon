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
import * as database from './database';
import * as egoose from '@egodigital/egoose';
import * as util from 'util';


const LOGGER = new egoose.Logger();
initLogger(LOGGER);


/**
 * Gets the global logger.
 *
 * @return {egoose.Logger} The global logger.
 */

export function getLogger(): egoose.Logger {
    return LOGGER;
}


function initLogger(logger: egoose.Logger) {
    // console
    logger.addAction((ctx) => {
        if (ctx.type > egoose.LogType.Debug) {
            if (!egoose.IS_LOCAL_DEV) {
                return;
            }
        }

        let icon: string;
        let log = console.log;

        if (egoose.LogType.Emerg === ctx.type) {
            icon = `☢️`;
            log = console.error;
        } else if (egoose.LogType.Alert === ctx.type) {
            icon = `🚨`;
            log = console.error;
        } else if (egoose.LogType.Crit === ctx.type) {
            icon = `🧨`;
            log = console.error;
        } else if (egoose.LogType.Err === ctx.type) {
            icon = `❗️`;
            log = console.error;
        } else if (egoose.LogType.Warn === ctx.type) {
            icon = `⚠️`;
            log = console.warn;
        } else if (egoose.LogType.Notice === ctx.type) {
            icon = `📢`;
            log = console.info;
        } else if (egoose.LogType.Info === ctx.type) {
            icon = `ℹ️`;
            log = console.info;
        } else if (egoose.LogType.Debug === ctx.type) {
            icon = `🔬`;
            log = console.debug;
        } else if (egoose.LogType.Trace === ctx.type) {
            icon = `📚`;
            log = console.trace;
        }

        log.bind(console)(
            `${icon ? (icon + ' ') : ''} ${ctx.time.format('YYYY-MM-DD HH:mm:ss')} => [${ctx.tag}] ${
            util.inspect(ctx.message)
            }`
        );
    });

    // database
    logger.addAction((ctx) => {
        (async () => {
            await database.withDatabase(async (db) => {
                let tag = egoose.normalizeString(ctx.tag);
                if ('' === tag) {
                    tag = undefined;
                }

                await db.Logs.insertMany([{
                    message: ctx.message,
                    tag: tag,
                    time: ctx.time.toDate(),
                    type: ctx.type,
                }]);
            });
        })();
    });
}
