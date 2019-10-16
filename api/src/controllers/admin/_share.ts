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
import { NextFunction, Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import { ControllerBase as ECControllerBase, RequestErrorHandlerContext, SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { serializeResponse } from '../_share';
import { AppContext } from '../../contracts';


/**
 * An extended request context (admin).
 */
export interface AdminRequest extends ExpressRequest {
}

/**
 * An extended response context (admin).
 */
export interface AdminResponse extends ExpressResponse {
}


/**
 * A basic Admincontroller.
 */
export abstract class AdminControllerBase extends ECControllerBase<AppContext> {
    // handle exceptions
    public async __error(context: RequestErrorHandlerContext) {
        return context.response
            .status(500)
            .send('SERVER ERROR: ' + context.error + '; Stack: ' + context.error.stack);
    }

    /**
     * {@inheritDoc}
     */
    public __serialize = serializeResponse();

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
            "name": "Token",
            "description": "The admin API key.",
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
            context.definition.tags = ['admin'];
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
        return [
            async (req: AdminRequest, res: AdminResponse, next: NextFunction) => {
                this.__app.log.trace({
                    'client': {
                        'ip': req.socket.remoteAddress,
                        'port': req.socket.remotePort,
                    },
                    'headers': req.headers,
                }, `request::${req.method}::${req.originalUrl}`);

                try {
                    const ADMIN_KEY = egoose.toStringSafe(process.env.ADMIN_KEY)
                        .trim();
                    const TOKEN = egoose.toStringSafe(req.headers['token'])
                        .trim();

                    if (ADMIN_KEY === TOKEN) {
                        return next();
                    }
                } catch (e) {
                    console.error(e);
                }

                return res.status(401)
                    .send();
            }
        ];
    }
}
