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
import { SwaggerPathDefinitionUpdaterContext } from '@egodigital/express-controllers';
import { NextFunction, RequestHandler } from 'express';
import { APIv2ControllerBase, ApiV2Request, ApiV2Response } from '../../_share';
import { Environment } from '../../../../../contracts';


/**
 * An API v2 (environment) request context.
 */
export interface ApiV2EnvironmentRequest extends ApiV2Request {
    /**
     * The environment.
     */
    environment: Environment;
}

/**
 * An API v2 (environment) response context.
 */
export interface ApiV2EnvironmentResponse extends ApiV2Response {
}


/**
 * A basic API v2 controller (environment).
 */
export abstract class APIv2EnvironmentControllerBase extends APIv2ControllerBase {
    /** @inheritdoc */
    public async __updateSwaggerPath(context: SwaggerPathDefinitionUpdaterContext) {
        super.__updateSwaggerPath(context);

        context.definition.parameters.push({
            "in": "path",
            "name": "environment_id",
            "description": "The ID of the environment.",
            "required": true,
            "example": "5d9c6192b00f0a01ace7cd91",
            "type": "string"
        });

        context.definition.responses['404'] = {
            "description": "Environment not found.",
            "schema": {
                "$ref": "#/definitions/ErrorResponse"
            }
        };
    }

    /**
     * {@inheritDoc}
     */
    public get __use(): RequestHandler[] {
        return super.__use.concat([
            async (req: ApiV2EnvironmentRequest, res: ApiV2EnvironmentResponse, next: NextFunction) => {
                if (req['environment']) {
                    return next();
                }

                const ENVIRONMENT_ID = egoose.normalizeString(req.params['environment_id']);
                if ('' !== ENVIRONMENT_ID) {
                    const ENVIRONMENT_DOC = await this.__app.withDatabase(db => {
                        return db.Environments.findOne({
                            '_id': ENVIRONMENT_ID,
                            'team_id': req.team.id,
                        }).exec();
                    });

                    if (ENVIRONMENT_DOC) {
                        req['environment'] = {
                            id: ENVIRONMENT_DOC.id,
                        };

                        return next();
                    }
                }

                return res.status(404).json({
                    success: false,
                    data: `Environment '${ENVIRONMENT_ID}' not found!`,
                });
            }
        ]);
    }
}
