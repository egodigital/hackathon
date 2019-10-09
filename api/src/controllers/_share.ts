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

import { NextFunction, Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import { ControllerBase as ECControllerBase } from '@egodigital/express-controllers';
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
}


/**
 * A basic controller.
 */
export abstract class ControllerBase extends ECControllerBase<AppContext> {
    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return [
            async (req: Request, res: Response, next: NextFunction) => {
                this.__app.log.trace({
                    'client': {
                        'ip': req.socket.remoteAddress,
                        'port': req.socket.remotePort,
                    },
                    'headers': req.headers,
                }, `request::${req.method}::${req.originalUrl}`);

                next();
            }
        ];
    }
}
