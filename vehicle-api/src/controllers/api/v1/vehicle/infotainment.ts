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
import * as database from '../../../../database';
import * as egoose from '@egodigital/egoose';
import * as jimp from 'jimp';
import { Response } from 'express';
import { DELETE, GET, POST, PUT } from '@egodigital/express-controllers';
import { ApiControllerBase, ApiRequest } from '../_share';


interface ScreenData {
    contentType: string;
    screen: Buffer;
}


const DEFAULT_SCREEN_MIME = 'image/png';


/**
 * /controllers/api/v1/vehicle/infotainment.ts
 *
 * Base path: '/api/v1/vehicle/infotainment'
 */
export class Controller extends ApiControllerBase {
    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/infotainment:
     *   get:
     *     summary: Gets the current infotainment screen.
     *     tags:
     *       - v1
     *     produces:
     *       - image/png
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: query
     *         name: cache
     *         required: false
     *         type: number
     *         enum:
     *           - 0
     *           - 1
     *         default: 0
     *         description: Use cache or not.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '304':
     *         description: Data has not been modified.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @GET('/')
    public async get_vehicle_infotainment(req: ApiRequest, res: Response) {
        // TODO: implement
        // @ts-ignore
        const USE_CACHE = '1' === egoose.toStringSafe(req.query.cache)
            .trim();

        const { contentType, screen } = await this._getImageScreen(req.vehicle.doc);

        return res.header('Content-type', contentType).send(
            screen
        );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/infotainment:
     *   delete:
     *     summary: Resets the infotainment screen.
     *     tags:
     *       - v1
     *     produces:
     *       - image/png
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @DELETE('/')
    public async reset_vehicle_infotainment(req: ApiRequest, res: Response) {
        const NEW_DOC = await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': egoose.normalizeString(req.vehicle.doc._id),
            }, {
                    '$unset': {
                        'infotainment': "",
                        'infotainment_mime': "",
                    },
                }).exec();

            return await db.Vehicles
                .findById(req.vehicle.doc._id)
                .exec();
        }, true);

        const IMAGE = await this._getInfotainmentScreen(NEW_DOC);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'reset_screen'
        );

        return res.status(200)
            .header('Content-type', DEFAULT_SCREEN_MIME)
            .send(
                await IMAGE.getBufferAsync(DEFAULT_SCREEN_MIME)
            );
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/infotainment:
     *   post:
     *     summary: Sets the data of the screen as image or video.
     *     tags:
     *       - v1
     *     consumes:
     *       - image/bmp
     *       - image/gif
     *       - image/jpeg
     *       - image/png
     *       - image/tiff
     *       - video/mp4
     *       - video/mpeg
     *       - video/ogg
     *     produces:
     *       - application/octet-stream
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         required: true
     *         description: The image to write / insert.
     *         type: string
     *         format: byte
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '400':
     *         description: Data type must be image or video.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @POST('/')
    public async set_vehicle_infotainment(req: ApiRequest, res: Response) {
        let newScreen = await egoose.readAll(req);
        if (!newScreen.length) {
            newScreen = null;
        }

        let screenMime = egoose.normalizeString(
            req.headers['content-type']
        );
        if ('' === screenMime) {
            screenMime = DEFAULT_SCREEN_MIME;
        }

        if (
            !screenMime.startsWith('image/') &&
            !screenMime.startsWith('video/')
        ) {
            // no valid data type

            return res.status(400)
                .send();
        }

        const RESULT = await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.doc._id,
            }, {
                    'infotainment': newScreen,
                    'infotainment_mime': screenMime,
                    'last_update': egoose.utc()
                        .toDate(),
                }).exec();

            const { contentType, screen } = await this._getImageScreen(
                await db.Vehicles
                    .findById(req.vehicle.doc._id)
                    .exec()
            );

            return res.header('Content-type', contentType).send(
                screen
            );
        }, true);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'set_screen'
        );

        return RESULT;
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/infotainment:
     *   put:
     *     summary: Writes an image to the infotainment screen.
     *     tags:
     *       - v1
     *     consumes:
     *       - application/octet-stream
     *     produces:
     *       - image/png
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         required: true
     *         description: The image to write / insert.
     *         type: string
     *         format: byte
     *       - in: query
     *         required: false
     *         description: The x coorinate where to place the image.
     *         type: number
     *         name: x
     *         default: 0
     *         example: 10
     *       - in: query
     *         required: false
     *         description: The y coorinate where to place the image.
     *         type: number
     *         name: y
     *         default: 0
     *         example: 20
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '400':
     *         description: Current screen is no image.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @PUT('/')
    public async write_vehicle_infotainment_image(req: ApiRequest, res: Response) {
        if (!this._isImageScreen(req.vehicle.doc)) {
            // no image

            return res.status(400)
                .send();
        }

        const BODY = await egoose.readAll(req);

        const SCREEN = await this._getInfotainmentScreen(
            req.vehicle.doc
        );

        let x = parseInt(
            egoose.toStringSafe(req.query.x)
                .trim()
        );
        if (isNaN(x)) {
            x = 0;
        }

        let y = parseInt(
            egoose.toStringSafe(req.query.y)
                .trim()
        );
        if (isNaN(y)) {
            y = 0;
        }

        const IMAGE = await jimp.read(BODY);
        SCREEN.resize(800, 400)
            .composite(IMAGE, x, y);

        const IMAGE_DATA = await this._updateScreenImage(SCREEN, req.vehicle.doc);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'insert_image'
        );

        return res.status(200)
            .header('Content-type', DEFAULT_SCREEN_MIME)
            .send(IMAGE_DATA);
    }

    /**
     * @swaggerPath
     *
     * /api/v1/vehicle/infotainment/text:
     *   put:
     *     summary: Writes text to the infotainment system.
     *     tags:
     *       - v1
     *     consumes:
     *       - text/plain
     *     produces:
     *       - image/png
     *     parameters:
     *       - in: header
     *         name: X-Api-Key
     *         required: true
     *         type: string
     *         description: The API key.
     *       - in: body
     *         required: true
     *         description: The text to write / insert.
     *         type: string
     *         format: byte
     *       - in: query
     *         name: black
     *         required: false
     *         description: Indicates if to use black font color or not.
     *         type: number
     *         default: 0
     *         enum:
     *           - 0
     *           - 1
     *         example: 1
     *       - in: query
     *         name: size
     *         required: false
     *         description: The font size.
     *         type: number
     *         default: 32
     *         enum:
     *           - 8
     *           - 16
     *           - 32
     *           - 64
     *           - 128
     *         example: 64
     *       - in: query
     *         required: false
     *         description: The x coorinate where to place the text.
     *         type: number
     *         name: x
     *         example: 10
     *         default: 0
     *       - in: query
     *         required: false
     *         description: The y coorinate where to place the text.
     *         type: number
     *         name: y
     *         example: 20
     *         default: 0
     *     responses:
     *       '200':
     *         description: Operation was successful.
     *       '400':
     *         description: Current screen is no image.
     *       '401':
     *         description: Wrong API key
     *       '500':
     *         description: Server error
     */
    @PUT('/text')
    public async write_text(req: ApiRequest, res: Response) {
        if (!this._isImageScreen(req.vehicle.doc)) {
            // no image

            return res.status(400)
                .send();
        }

        const TEXT = (await egoose.readAll(req))
            .toString('utf8');

        let x = parseInt(
            egoose.toStringSafe(req.query.x)
                .trim()
        );
        if (isNaN(x)) {
            x = 0;
        }

        let y = parseInt(
            egoose.toStringSafe(req.query.y)
                .trim()
        );
        if (isNaN(y)) {
            y = 0;
        }

        const COLOR = '1' === egoose.normalizeString(
            req.query.black
        ) ? 'BLACK' : 'WHITE';
        const SIZE = parseInt(
            egoose.toStringSafe(req.query.size)
                .trim()
        );
        let fontName: string;
        switch (SIZE) {
            case 8:
            case 16:
            case 64:
            case 128:
                fontName = jimp[`FONT_SANS_${SIZE}_${COLOR}`];
                break;

            default:
                fontName = jimp[`FONT_SANS_32_${COLOR}`];
                break;
        }

        const SCREEN = await this._getInfotainmentScreen(
            req.vehicle.doc
        );

        const FONT = await jimp.loadFont(fontName);
        SCREEN.print(FONT, x, y, TEXT);

        const IMAGE_DATA = await this._updateScreenImage(SCREEN, req.vehicle.doc);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'write_text'
        );

        return res.status(200)
            .header('Content-type', DEFAULT_SCREEN_MIME)
            .send(IMAGE_DATA);
    }


    private async _getImageScreen(vehicle: database.VehiclesDocument): Promise<ScreenData> {
        let screen = vehicle.infotainment;
        let screenMime = egoose.normalizeString(vehicle.infotainment_mime);

        let contentType: string;
        if (_.isNil(screen) || !screen.length) {
            screen = await this._loadResource('infotainment.png');
            contentType = DEFAULT_SCREEN_MIME;
        } else {
            contentType = screenMime;
            if ('' === contentType) {
                contentType = DEFAULT_SCREEN_MIME;
            }
        }

        return {
            contentType,
            screen,
        };
    }

    private _isImageScreen(vehicle: database.VehiclesDocument): boolean {
        const MIME = egoose.normalizeString(vehicle.infotainment_mime);
        if ('' !== MIME) {
            return MIME.startsWith('image/');
        }

        return true;
    }

    private async _raiseInfotainmentUpdate(
        req: ApiRequest, type: string
    ) {
        type = egoose.normalizeString(type);

        try {
            await this._withDatabase(async (db) => {
                await db.VehicleEvents.insertMany([{
                    data: {
                        type,
                    },
                    name: 'infotainment_update',
                    is_handled: false,
                    vehicle_id: egoose.normalizeString(req.vehicle.doc._id),
                }]);
            });

            return true;
        } catch (e) {
            this._logger
                .err(e, '_raiseInfotainmentUpdate(1)');
        }

        return false;
    }

    private async _updateScreenImage(screen: jimp, vehicle: database.VehiclesDocument): Promise<Buffer> {
        if (800 !== screen.getWidth() || 400 !== screen.getHeight()) {
            screen.resize(800, 400);
        }

        const IMAGE_DATA = await screen.getBufferAsync(DEFAULT_SCREEN_MIME);

        await this._withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': egoose.normalizeString(vehicle._id),
            }, {
                    'infotainment': IMAGE_DATA,
                    'last_update': egoose.utc()
                        .toDate(),
                }).exec();
        });

        return IMAGE_DATA;
    }
}
