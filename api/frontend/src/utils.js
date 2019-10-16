import _ from 'lodash';

export default {
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
    }
}
