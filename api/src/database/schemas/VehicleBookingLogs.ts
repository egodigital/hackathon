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
import * as mongoose from 'mongoose';


export const SCHEMA: mongoose.SchemaDefinition = {
    booking_id: {
        lowercase: true,
        trim: true,
        type: String,
    },
    event: {
        lowercase: true,
        trim: true,
        type: String,
    },
    message: {
        required: false,
        type: mongoose.SchemaTypes.Mixed,
    },
    status: {
        lowercase: true,
        trim: true,
        type: String,
    },
    team_id: {
        lowercase: true,
        trim: true,
        type: String,
    },
    time: {
        default: () => egoose.utc()
            .toDate(),
        type: Date,
    },
};

export function setupSchema(schema: mongoose.Schema, name: string) {
    schema.index({ team_id: 1 });
    schema.index({ booking_id: 1 });
    schema.index({ event: 1 });
    schema.index({ event: 1, booking_id: 1 });
    schema.index({ event: 1, team_id: 1 });
    schema.index({ status: 1 });
    schema.index({ status: 1, booking_id: 1 });
    schema.index({ status: 1, team_id: 1 });
}
