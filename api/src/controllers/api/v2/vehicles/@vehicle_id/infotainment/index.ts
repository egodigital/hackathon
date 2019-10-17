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
import * as fs from 'fs-extra';
import jimp from 'jimp';
import { DELETE, GET, POST, PUT, Swagger } from '@egodigital/express-controllers';
import { Readable } from 'stream';
import { APIv2VehicleControllerBase, ApiV2VehicleRequest, ApiV2VehicleResponse } from '../_share';
import { Vehicle } from '../../../../../../contracts';
import { getResourcePath } from '../../../../../../utils';
import { HttpResult } from '../../../../../_share';


interface ScreenData {
    contentType: string;
    screen: Buffer;
}


const DEFAULT_SCREEN_MIME = 'image/png';
const DEFAULT_SCREEN_SIZE = {
    height: 726,
    width: 1439,
};


/**
 * Controller for /api/v2/vehicles/:vehicle_id/infotainment endpoints.
 */
export class Controller extends APIv2VehicleControllerBase {
    @GET('/')
    @Swagger({
        "summary": "Gets the current infotainment screen.",
        "produces": [
            "image/png"
        ],
        "parameters": [
            {
                "in": "query",
                "name": "cache",
                "required": false,
                "type": "number",
                "enum": [
                    0,
                    1
                ],
                "default": 0,
                "description": "Use cache or not."
            }
        ],
        "responses": {
            "200": {},
            "304": {
                "description": "Data has not been modified."
            },
        }
    })
    public async get_vehicle_infotainment(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        // TODO: implement
        // @ts-ignore
        const USE_CACHE = '1' === egoose.toStringSafe(req.query.cache)
            .trim();

        const IS_INFOTAINMENT_OFF = 'on' !== egoose.normalizeString(
            await this._getVehicleSignal(req, 'infotainment')
        );
        if (IS_INFOTAINMENT_OFF) {
            return res.header('Content-type', DEFAULT_SCREEN_MIME).send(
                await this._loadResource('infotainment_off.png')
            );
        }

        return (await this._getImageScreen(req.vehicle))
            .screen;
    }

    @DELETE('/')
    @Swagger({
        "summary": "Resets the infotainment screen.",
        "produces": [
            "image/png"
        ],
        "responses": {
            "200": {},
        }
    })
    public async reset_vehicle_infotainment(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        const INFOTAINMENT = await this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, {
                '$unset': {
                    'infotainment': "",
                    'infotainment_mime': "",
                },
            }).exec();

            const NEW_DOC = await db.Vehicles
                .findById(req.vehicle.id)
                .exec();

            return NEW_DOC.infotainment;
        }, true);

        const IMAGE = await this._getInfotainmentScreen(INFOTAINMENT);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'reset_screen'
        );

        return await IMAGE.getBufferAsync(DEFAULT_SCREEN_MIME);
    }

    @POST('/')
    @Swagger({
        "summary": "Sets the data of the screen as image or video.",
        "consumes": [
            "image/bmp",
            "image/gif",
            "image/jpeg",
            "image/png",
            "image/tiff",
            "text/plain",
            "video/mp4",
            "video/mpeg",
            "video/ogg"
        ],
        "produces": [
            "application/octet-stream"
        ],
        "parameters": [
            {
                "in": "header",
                "name": "X-Api-Key",
                "required": true,
                "type": "string",
                "description": "The API key."
            },
            {
                "in": "body",
                "required": true,
                "description": "The image to write / insert.",
                "type": "string",
                "format": "byte"
            }
        ],
        "responses": {
            "200": {},
            "400": {
                "description": "Data type must be image or video or a HTTP URL."
            },
        }
    })
    public async set_vehicle_infotainment(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        let screenMime = egoose.normalizeString(
            req.headers['content-type']
        );
        if ('' === screenMime) {
            screenMime = DEFAULT_SCREEN_MIME;
        }

        let newScreen = await this._readMax(req, this._maxFileSize);

        if ('text/plain' === screenMime) {
            const URL = newScreen.toString('utf8')
                .trim();
            if (URL.startsWith('https://')) {
                const RESPONSE = await egoose.GET(
                    URL,
                    {
                        timeout: 5000,
                    }
                );

                if (200 !== RESPONSE.code) {
                    throw new Error(`Download returned unexpected response: [${RESPONSE.code}] '${RESPONSE.status}'`);
                }

                screenMime = egoose.normalizeString(
                    RESPONSE.headers['content-type']
                );
                newScreen = await this._readMax(
                    RESPONSE.response, this._maxFileSize
                );
            } else {
                // invalid URL

                return HttpResult.BadRequest((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                    return res.json({
                        success: false,
                        data: `Invalid URL!`,
                    });
                });
            }
        }

        if (!newScreen.length) {
            newScreen = null;
        }

        if (
            !screenMime.startsWith('image/') &&
            !screenMime.startsWith('video/')
        ) {
            // no valid data type

            return HttpResult.BadRequest((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `No valid data type!`,
                });
            });
        }

        const SCREEN = await this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': req.vehicle.id,
            }, {
                'infotainment': newScreen,
                'infotainment_mime': screenMime,
                'last_update': egoose.utc()
                    .toDate(),
            }).exec();

            return (await this._getImageScreen(
                req.vehicle
            )).screen;
        }, true);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'set_screen'
        );

        return SCREEN;
    }

    @PUT('/')
    @Swagger({
        "summary": "Writes an image to the infotainment screen.",
        "consumes": [
            "application/octet-stream"
        ],
        "produces": [
            "image/png"
        ],
        "parameters": [
            {
                "in": "body",
                "required": true,
                "description": "The image to write / insert.",
                "type": "string",
                "format": "byte"
            },
            {
                "in": "query",
                "required": false,
                "description": "The x coorinate where to place the image.",
                "type": "number",
                "name": "x",
                "default": 0,
                "example": 10
            },
            {
                "in": "query",
                "required": false,
                "description": "The y coorinate where to place the image.",
                "type": "number",
                "name": "y",
                "default": 0,
                "example": 20
            }
        ],
        "responses": {
            "200": {},
            "400": {
                "description": "Current infotainment data represent no image."
            },
        }
    })
    public async write_vehicle_infotainment_image(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        if (!this._isImageScreen(req.vehicle)) {
            // no image

            return HttpResult.BadRequest((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `Infotainment data represent no valid image!`,
                });
            });
        }

        const BODY = await this._readMax(req, this._maxFileSize);

        const SCREEN = await this._getInfotainmentScreen(
            req.vehicle.infotainment.data
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
        SCREEN.resize(DEFAULT_SCREEN_SIZE.width, DEFAULT_SCREEN_SIZE.height)
            .composite(IMAGE, x, y);

        const IMAGE_DATA = await this._updateScreenImage(SCREEN, req.vehicle);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'insert_image'
        );

        return IMAGE_DATA;
    }

    @PUT('/text')
    @Swagger({
        "summary": "Writes text to the infotainment system.",
        "consumes": [
            "text/plain"
        ],
        "produces": [
            "image/png"
        ],
        "parameters": [
            {
                "in": "body",
                "name": "text",
                "required": true,
                "description": "The text to write / insert.",
                "type": "string"
            },
            {
                "in": "query",
                "name": "black",
                "required": false,
                "description": "Indicates if to use black font color or not.",
                "type": "number",
                "default": 0,
                "enum": [
                    0,
                    1
                ],
                "example": 1
            },
            {
                "in": "query",
                "name": "size",
                "required": false,
                "description": "The font size.",
                "type": "number",
                "default": 32,
                "enum": [
                    8,
                    16,
                    32,
                    64,
                    128
                ],
                "example": 64
            },
            {
                "in": "query",
                "required": false,
                "description": "The x coorinate where to place the text.",
                "type": "number",
                "name": "x",
                "example": 10,
                "default": 0
            },
            {
                "in": "query",
                "required": false,
                "description": "The y coorinate where to place the text.",
                "type": "number",
                "name": "y",
                "example": 20,
                "default": 0
            }
        ],
        "responses": {
            "200": {},
            "400": {
                "description": "Current infotainment data represent no image."
            },
        }
    })
    public async write_text(req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) {
        if (!this._isImageScreen(req.vehicle)) {
            // no image

            return HttpResult.BadRequest((req: ApiV2VehicleRequest, res: ApiV2VehicleResponse) => {
                return res.json({
                    success: false,
                    data: `Infotainment data represent no valid image!`,
                });
            });
        }

        const TEXT = (await this._readMax(req, this._maxFileSize))
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
            req.vehicle.infotainment.data
        );

        const FONT = await jimp.loadFont(fontName);
        SCREEN.print(FONT, x, y, TEXT);

        const IMAGE_DATA = await this._updateScreenImage(SCREEN, req.vehicle);

        // event
        await this._raiseInfotainmentUpdate(
            req, 'write_text'
        );

        return IMAGE_DATA;
    }


    private async _getImageScreen(vehicle: Vehicle): Promise<ScreenData> {
        let screen = vehicle.infotainment.data;
        let screenMime = egoose.normalizeString(vehicle.infotainment.mime);

        let contentType: string;
        if (!Buffer.isBuffer(screen) || !screen.length) {
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

    private async _getInfotainmentScreen(image: Buffer): Promise<jimp> {
        if (!Buffer.isBuffer(image) || !image.length) {
            image = await this._loadResource('infotainment.png');
        }

        return await jimp.read(
            image
        );
    }

    private _isImageScreen(vehicle: Vehicle): boolean {
        const MIME = egoose.normalizeString(vehicle.infotainment.mime);
        if ('' !== MIME) {
            return MIME.startsWith('image/');
        }

        return true;
    }

    private _loadResource(path: string): Promise<Buffer> {
        return fs.readFile(
            getResourcePath(path)
        );
    }

    private get _maxFileSize(): number {
        const MAX_INFOTAINMENT_FILESIZE = parseInt(
            egoose.toStringSafe(
                process.env.MAX_INFOTAINMENT_FILESIZE
            ).trim()
        );

        return isNaN(MAX_INFOTAINMENT_FILESIZE) ?
            16777216 : MAX_INFOTAINMENT_FILESIZE;
    }

    private async _raiseInfotainmentUpdate(
        req: ApiV2VehicleRequest, type: string
    ) {
        type = egoose.normalizeString(type);

        try {
            await this.__app.withDatabase(async (db) => {
                await db.VehicleEvents.insertMany([{
                    data: {
                        type,
                    },
                    name: 'infotainment_update',
                    is_handled: false,
                    vehicle_id: req.vehicle.id,
                }]);
            });

            return true;
        } catch (e) {
            this.__app
                .log
                .err(e, '_raiseInfotainmentUpdate(1)');
        }

        return false;
    }

    private _readMax(stream: Readable, maxSize: number): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let buff: Buffer;

            let dataListener: (chunk: Buffer | string) => void;
            let endListener: () => void;
            let errorListener: (err: any) => void;

            let completedInvoked = false;
            const COMPLETED = (err: any) => {
                if (completedInvoked) {
                    return;
                }
                completedInvoked = true;

                egoose.tryRemoveListener(stream, 'data', dataListener);
                egoose.tryRemoveListener(stream, 'end', endListener);
                egoose.tryRemoveListener(stream, 'error', errorListener);

                if (err) {
                    reject(err);
                } else {
                    resolve(buff);
                }
            };

            try {
                errorListener = (err: any) => {
                    if (err) {
                        COMPLETED(err);
                    }
                };

                dataListener = (chunk: Buffer | string) => {
                    try {
                        if (_.isNil(chunk) || !chunk.length) {
                            return;
                        }

                        if (!Buffer.isBuffer(chunk)) {
                            chunk = Buffer.from(
                                egoose.toStringSafe(chunk), 'utf8'
                            );
                        }

                        if (buff.length + chunk.length > maxSize) {
                            throw new Error(`Maximum size of ${maxSize} reached!`);
                        }

                        buff = Buffer.concat([buff, chunk]);
                    } catch (e) {
                        COMPLETED(e);
                    }
                };

                endListener = () => {
                    COMPLETED(null);
                };

                try {
                    stream.once('error', errorListener);

                    buff = Buffer.alloc(0);

                    stream.once('end', endListener);
                    stream.on('data', dataListener);
                } catch (e) {
                    COMPLETED(e);
                }
            } catch (e) {
                COMPLETED(e);
            }
        });
    }

    private async _updateScreenImage(screen: jimp, vehicle: Vehicle): Promise<Buffer> {
        if (
            DEFAULT_SCREEN_SIZE.width !== screen.getWidth() ||
            DEFAULT_SCREEN_SIZE.height !== screen.getHeight()
        ) {
            screen.resize(
                DEFAULT_SCREEN_SIZE.width,
                DEFAULT_SCREEN_SIZE.height,
            );
        }

        const IMAGE_DATA = await screen.getBufferAsync(DEFAULT_SCREEN_MIME);

        await this.__app.withDatabase(async (db) => {
            await db.Vehicles.updateOne({
                '_id': egoose.normalizeString(vehicle.id),
            }, {
                'infotainment': IMAGE_DATA,
                'last_update': egoose.utc()
                    .toDate(),
            }).exec();
        });

        return IMAGE_DATA;
    }
}
