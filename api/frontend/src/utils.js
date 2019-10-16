import _ from 'lodash';

export default {
    isLocalDev() {
        return ['127.0.0.1', 'localhost'].indexOf(
            window.location.hostname.toLowerCase().trim()
        ) > -1;
    },
    toBooleanSafe(val) {
        if (_.isBoolean(val)) {
            return val;
        }

        if (_.isNil(val)) {
            return false;
        }

        if (_.isString(val)) {
            if ('true' === val) {
                return true;
            }

            if ('false' === val) {
                return false;
            }

            return Boolean(val).valueOf();
        }

        return !!val;
    },
    toStringSafe(val) {
        if (_.isString(val)) {
            return val;
        }

        if (_.isNil(val)) {
            return '';
        }

        if (_.isFunction(val['toString'])) {
            return String(val.toString());
        }

        return '' + val;
    },
    withBaseUrl(path = '') {
        let baseUrl;

        if (this.isLocalDev()) {
            baseUrl = `http://${window.location.hostname}`;
        } else {
            baseUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
        }

        return baseUrl + '/api/v2/' + path;
    },
}
