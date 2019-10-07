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
import * as path from 'path';


/**
 * Returns the full path of a file insice 'res' subfolder.
 *
 * @param {string} file The (relative) path to the file.
 *
 * @return {string} The full path.
 */
export function getResourcePath(file: string): string {
    return path.resolve(
        path.join(
            __dirname, 'res',
            egoose.toStringSafe(file),
        )
    );
}
