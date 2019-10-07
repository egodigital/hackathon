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

import { NextFunction, RequestHandler } from 'express';
import { ControllerBase, Request, Response } from '../../_share';


/**
 * An API v2 request context.
 */
export interface ApiV2Request extends Request {
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
    public get __use(): RequestHandler[] {
        return super.__use.concat([
            async (req: ApiV2Request, res: ApiV2Response, next: NextFunction) => {
                next();
            }
        ]);
    }
}
