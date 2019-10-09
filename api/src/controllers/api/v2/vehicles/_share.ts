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
import * as database from '../../../../database';
import { ApiV2Request } from '../_share';
import { VehicleBooking } from '../../../../contracts';


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
