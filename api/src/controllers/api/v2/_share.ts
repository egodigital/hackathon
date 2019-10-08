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
import * as database from '../../../database';
import * as egoose from '@egodigital/egoose';
import * as fileType from 'file-type';
import * as isStream from 'is-stream';
import { ResponseSerializerContext, serializeForJSON } from '@egodigital/express-controllers';
import { NextFunction, RequestHandler } from 'express';
import { ControllerBase, Request, Response } from '../../_share';
import { Team } from '../../../contracts';


/**
 * An API v2 request context.
 */
export interface ApiV2Request extends Request {
    /**
     * The underlying team.
     */
    readonly team: Team;
}

/**
 * An API v2 response context.
 */
export interface ApiV2Response extends Response {
}


/**
 * A basic controller.
 */
export abstract class APIv2ControllerBase extends ControllerBase {
    /**
     * {@inheritDoc}
     */
    public async __serialize(ctx: ResponseSerializerContext) {
        // buffer?
        if (Buffer.isBuffer(ctx.result)) {
            return ctx.response
                .header('Content-type', mimeFromFileType(() => fileType(ctx.result)))
                .send(ctx.result);
        }

        // stream?
        if (isStream.readable(ctx.result)) {
            const WRAPPED_STREAM = await fileType.stream(ctx.result);

            ctx.response
                .header('Content-type', mimeFromFileType(() => WRAPPED_STREAM.fileType));

            return WRAPPED_STREAM.pipe(ctx.response);
        }

        return ctx.response
            .json({
                success: true,
                data: await serializeForJSON(ctx.result),
            });
    }

    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return super.__use.concat([
            async (req: Request, res: Response, next: NextFunction) => {
                const X_API_KEY = egoose.toStringSafe(req.headers['x-api-key'])
                    .trim();

                try {
                    await this.__app.withDatabase(async db => {
                        const TEAM_DOC = await db.Teams
                            .findOne(X_API_KEY);

                        if (TEAM_DOC) {
                            req['team'] = await database.createTeam(TEAM_DOC, db);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }

                if (req['team']) {
                    return next();
                }

                return res.status(401)
                    .send();
            }
        ]);
    }
}


function mimeFromFileType(
    provider: () => fileType.FileTypeResult,
): string {
    let mimeType: string;

    try {
        const TYPE = provider();
        if (!_.isNil(TYPE)) {
            mimeType = TYPE.mime;
        }
    } catch (e) {
        console.error(e);
    }

    mimeType = egoose.normalizeString(mimeType);
    if ('' === mimeType) {
        mimeType = 'application/octet-stream';
    }

    return mimeType;
}
