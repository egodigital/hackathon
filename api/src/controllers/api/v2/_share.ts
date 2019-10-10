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
import * as pluralize from 'pluralize';
import { ResponseSerializerContext, serializeForJSON, SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { NextFunction, RequestHandler } from 'express';
import { ControllerBase, HttpResult, Request, Response } from '../../_share';
import { Team, VehicleBooking } from '../../../contracts';


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
 * A basic API v2 controller.
 */
export abstract class APIv2ControllerBase extends ControllerBase {
    /**
     * {@inheritDoc}
     */
    public async __serialize(ctx: ResponseSerializerContext) {
        if (ctx.result instanceof HttpResult) {
            if (!isNaN(ctx.result.code)) {
                ctx.response
                    .status(ctx.result.code);
            }

            if (_.isNil(ctx.result.data)) {
                return ctx.response
                    .send();
            }

            if (isStream.readable(ctx.result.data)) {
                return ctx.result
                    .data
                    .pipe(ctx.response);
            }

            if ('function' === typeof ctx.result.data) {
                return Promise.resolve(
                    ctx.result.data(
                        ctx.request, ctx.response
                    )
                );
            }

            return ctx.response
                .send(ctx.result.data);
        }

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

    /** @inheritdoc */
    public async __updateSwaggerPath(context: SwaggerPathDefinitionUpdaterContext) {
        if (!context.definition.responses) {
            context.definition.responses = {};
        }

        for (const HTTP_CODE of [200, 204]) {
            const KEY = HTTP_CODE.toString();

            if (context.definition.responses[KEY]) {
                if (egoose.isEmptyString(context.definition.responses[KEY]['description'])) {
                    context.definition.responses[KEY]['description'] = 'Operation was successful.';
                }
            }
        }

        if (!context.definition.parameters) {
            context.definition.parameters = [];
        }
        context.definition.parameters.push({
            "in": "header",
            "name": "X-Api-Key",
            "description": "The API key.",
            "required": true,
            "example": "19790905-0000-0000-0000-000019790923",
            "type": "string"
        });

        if (!context.definition.produces) {
            context.definition.produces = [
                "application/json",
            ];
        }

        // tags
        if (!context.definition.tags) {
            context.definition.tags = [];
        }
        if (context.definition.tags.length < 1) {
            const PARTS = context.path
                .split('/');

            let tagName = egoose.normalizeString(
                PARTS[3]
            );
            if ('' === tagName) {
                tagName = 'default';
            }

            if (pluralize.isSingular(tagName)) {
                tagName = pluralize.plural(tagName);
            }

            context.definition.tags.push(
                tagName
            );
        }

        if ('GET' !== context.method) {
            if (context.doesValidate) {
                if (!context.definition.responses['400']) {
                    context.definition.responses['400'] = {
                        "schema": {
                            "$ref": "#/definitions/ErrorResponse"
                        }
                    };
                }
            }
        }

        if (context.definition.responses['400']) {
            if (egoose.isEmptyString(context.definition.responses['400'].description)) {
                context.definition.responses['400'].description = 'Bad request.';
            }

            if (!context.definition.responses['400'].schema) {
                context.definition.responses['400'].schema = {
                    "$ref": "#/definitions/ErrorResponse"
                };
            }
        }

        context.definition.responses['401'] = {
            "description": "Wrong API key.",
        };

        context.definition.responses['500'] = {
            "description": "Server error.",
        };
    }

    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return super.__use.concat([
            async (req: Request, res: Response, next: NextFunction) => {
                if (req['team']) {
                    return next();
                }

                const X_API_KEY = egoose.toStringSafe(req.headers['x-api-key'])
                    .trim();

                try {
                    await this.__app.withDatabase(async db => {
                        const TEAM_DOC = await db.Teams
                            .findOne({
                                'api_key': X_API_KEY,
                            });

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


/**
 * Logs a vehicle booking.
 *
 * @param {database.Database} db The database connection.
 * @param {ApiV2Request} req The underlying request context.
 * @param {VehicleBooking} id The booking document.
 * @param {any} message Custom message data.
 */
export async function logBooking(
    db: database.Database, req: ApiV2Request,
    booking: VehicleBooking, message?: any,
) {
    const NEW_DATA: any = {
        'booking_id': booking.id,
        'event': booking.event,
        'status': booking.status,
        'team_id': req.team.id,
    };

    if (!_.isNil(message)) {
        NEW_DATA['message'] = message;
    }

    await db.VehicleBookings.insertMany([
        NEW_DATA,
    ]);
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
