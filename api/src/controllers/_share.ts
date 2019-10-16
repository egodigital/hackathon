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
import * as fileType from 'file-type';
import * as isStream from 'is-stream';
import { NextFunction, Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import { ControllerBase as ECControllerBase, RequestErrorHandlerContext, ResponseSerializer, ResponseSerializerContext, serializeForJSON } from '@egodigital/express-controllers';
import { AppContext } from '../contracts';


/**
 * An extended request context.
 */
export interface Request extends ExpressRequest {
}

/**
 * An extended response context.
 */
export interface Response extends ExpressResponse {
}


/**
 * Stores data for a HTTP result.
 */
export class HttpResult {
    /**
     * Initializes a new instance of that class.
     *
     * @param {number} code The status code.
     * @param {any} [data] The optional.
     */
    public constructor(
        public readonly code: number,
        public readonly data?: any,
    ) { }

    /**
     * Creates an instance for '400 Bad Request' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static BadRequest(func: RequestHandler): HttpResult;
    public static BadRequest(dataOrFunc?: any): HttpResult {
        return new HttpResult(400, dataOrFunc);
    }

    /**
     * Creates an instance for '404 Conflict' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static Conflict(func: RequestHandler): HttpResult;
    public static Conflict(dataOrFunc?: any): HttpResult {
        return new HttpResult(409, dataOrFunc);
    }

    /**
     * Creates an instance for '204 No Content' result.
     * 
     * @return {HttpResult} The new instance.
     */
    public static NoContent(): HttpResult {
        return new HttpResult(204);
    }

    /**
     * Creates an instance for '406 Not Acceptable' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static NotAcceptable(func: RequestHandler): HttpResult;
    public static NotAcceptable(dataOrFunc?: any): HttpResult {
        return new HttpResult(406, dataOrFunc);
    }

    /**
     * Creates an instance for '404 Not Found' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static NotFound(func: RequestHandler): HttpResult;
    public static NotFound(dataOrFunc?: any): HttpResult {
        return new HttpResult(404, dataOrFunc);
    }

    /**
     * Creates an instance for '200 OK' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static OK(func: RequestHandler): HttpResult;
    public static OK(dataOrFunc?: any): HttpResult {
        return new HttpResult(200, dataOrFunc);
    }

    /**
     * Creates an instance for '412 Precondition Failed' result.
     * 
     * @param {any} [dataOrFunc] Optional data to send or a function to invoke.
     * 
     * @return {HttpResult} The new instance.
     */
    public static PreconditionFailed(func: RequestHandler): HttpResult;
    public static PreconditionFailed(dataOrFunc?: any): HttpResult {
        return new HttpResult(412, dataOrFunc);
    }
}


/**
 * A basic controller.
 */
export abstract class ControllerBase extends ECControllerBase<AppContext> {
    // handle exceptions
    public async __error(context: RequestErrorHandlerContext) {
        return context.response
            .status(500)
            .send('SERVER ERROR: ' + context.error + '; Stack: ' + context.error.stack);
    }

    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return [
            async (req: Request, res: Response, next: NextFunction) => {
                if (egoose.IS_LOCAL_DEV) {
                    this.__app.log.trace({
                        'client': {
                            'ip': req.socket.remoteAddress,
                            'port': req.socket.remotePort,
                        },
                        'headers': req.headers,
                    }, `request::${req.method}::${req.originalUrl}`);
                }

                next();
            }
        ];
    }
}

/**
 * Creates a function that serializes controller responses.
 * 
 * @return {ResponseSerializer} The new serializer.
 */
export function serializeResponse(): ResponseSerializer {
    return async (ctx: ResponseSerializerContext) => {
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
    };
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
