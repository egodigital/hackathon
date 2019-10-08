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

import * as mongoose from 'mongoose';


export const SCHEMA: mongoose.SchemaDefinition = {
    country: {
        trim: true,
        required: false,
        type: String,
        uppercase: true,
    },
    environment_id: {
        lowercase: true,
        required: false,
        trim: true,
        type: String,
    },
    license_plate: {
        trim: true,
        type: String,
        uppercase: true,
    },
    manufacturer: {
        trim: true,
        type: String,
    },
    model_name: {
        trim: true,
        type: String,
    },
    team_id: {
        lowercase: true,
        trim: true,
        type: String,
    },
};

export function setupSchema(schema: mongoose.Schema, name: string) {
    schema.index({ country: 1 });
    schema.index({ environment_id: 1 });
    schema.index({ license_plate: 1 });
    schema.index({ manufacturer: 1 });
    schema.index({ manufacturer: 1, model_name: 1 });
    schema.index({ team_id: 1 });
    schema.index({ team_id: 1, license_plate: 1 }, { unique: true });
}
