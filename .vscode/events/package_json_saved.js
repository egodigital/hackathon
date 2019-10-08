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


///
/// running with 'Power Tools' for 'Visual Studio Code':
/// 
/// https://marketplace.visualstudio.com/items?itemName=ego-digital.vscode-powertools
///


exports.execute = async (args) => {
    if (!args.file) {
        return;
    }

    const fs = args.require('fs-extra');
    const path = require('path');

    const PACKAGE_JSON_WEBAPP_FILE = path.resolve(
        path.join(__dirname, '../../api/frontend/package.json')
    );

    const PACKAGE_JSON_BACKEND = JSON.parse(
        await fs.readFile(args.file.fsPath, 'utf8')
    );
    const PACKAGE_JSON_WEBAPP = JSON.parse(
        await fs.readFile(PACKAGE_JSON_WEBAPP_FILE, 'utf8')
    );

    PACKAGE_JSON_WEBAPP.version = PACKAGE_JSON_BACKEND.version;

    await fs.writeFile(
        PACKAGE_JSON_WEBAPP_FILE,
        JSON.stringify(PACKAGE_JSON_WEBAPP, null, 4),
        'utf8'
    );
};
