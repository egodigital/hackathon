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

import * as diagnostics from '../diagnostics';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { withDatabase } from '../database';
import { ControllerBase as ControllerBase_ExpressControllers, RequestErrorHandlerContext } from '@egodigital/express-controllers';


/**
 * A request.
 */
export interface Request extends express.Request {
}


/**
 * A basic controller.
 */
export abstract class ControllerBase extends ControllerBase_ExpressControllers {
    /**
     * Loads a file from '/res' folder.
     *
     * @param {string} p The relative path.
     *
     * @return {Promise<Buffer>} The promise with the loaded data.
     */
    public async _loadResource(p: string): Promise<Buffer> {
        return await fsExtra.readFile(
            path.resolve(
                path.join(
                    __dirname, '../res', egoose.toStringSafe(p)
                )
            )
        );
    }

    /**
     * Gets the logger of that controller.
     */
    public get _logger(): egoose.Logger {
        return diagnostics.getLogger();
    }

    /** @inheritdoc */
    public __error(ctx: RequestErrorHandlerContext) {
        return ctx.response
            .status(500)
            .send('ERROR: ' + ctx.error);
    }

    /** @inheritdoc */
    public readonly _withDatabase = withDatabase;
}
