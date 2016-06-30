import {_} from 'rgui-base';

_.MS_OF_DAY = 24*3600*1000;

_.clearTime = function(date) {
    return new Date((date/_.MS_OF_DAY>>0)*_.MS_OF_DAY);
}

// 处理IE8下的兼容性问题
_.parseDate = function(value) {
    return new Date(new Date(value.replace(/-/g, '/')) - new Date('1970/01/01'));
}

export default _;
