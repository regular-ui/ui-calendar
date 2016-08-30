import { Component } from 'rgui-ui-base';
import _ from '../util';
import template from './index.rgl';

/**
 * @class Calendar
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {Date|number|string=TODAY} options.data.date               <=> 当前选择的日期
 * @param {Date|number|string}      options.data.minDate             => 最小日期，如果为空则不限制
 * @param {Date|number|string}      options.data.maxDate             => 最大日期，如果为空则不限制
 * @param {boolean=false}           options.data.readonly            => 是否只读
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {boolean=true}            options.data.visible             => 是否显示
 * @param {string=''}               options.data.class               => 补充class
 */
const Calendar = Component.extend({
    name: 'calendar',
    template,
    /**
     * @protected
     * @override
     */
    config() {
        this.defaults({
            date: _.clearTime(new Date()),
            minDate: undefined,
            maxDate: undefined,
            _days: [],
        });
        this.supr();
        this.watch();
    },
    /**
     * @protected
     * @override
     */
    watch() {
        this.$watch('date', (newValue, oldValue) => {
            // 时间戳或字符串自动转为日期类型
            if (typeof newValue === 'number')
                return this.data.date = new Date(newValue);
            else if (typeof newValue === 'string')
                return this.data.date = _.parseDate(newValue);

            if (!newValue || newValue + '' === 'Invalid Date')
                throw new TypeError('Invalid Date');

            // 如果超出日期范围，则设置为范围边界的日期
            const isOutOfRange = this.isOutOfRange(newValue);
            if (isOutOfRange) {
                this.data.date = isOutOfRange;

                // 防止第二次刷新同月
                this._update();
                return;
            }

            if (!oldValue || !oldValue.getFullYear)
                this._update();
            else if (newValue.getFullYear() !== oldValue.getFullYear() || newValue.getMonth() !== oldValue.getMonth())
                this._update();

            /**
             * @event change 日期改变时触发
             * @property {object} sender 事件发送对象
             * @property {object} date 改变后的日期
             */
            this.$emit('change', {
                sender: this,
                date: newValue,
            });
        });

        this.$watch('minDate', (newValue, oldValue) => {
            if (!newValue)
                return;

            // 时间戳或字符串自动转为日期类型
            if (typeof newValue === 'number')
                return this.data.minDate = new Date(newValue);
            else if (typeof newValue === 'string')
                return this.data.minDate = _.parseDate(newValue);

            if (newValue + '' === 'Invalid Date')
                throw new TypeError('Invalid Date');
        });

        this.$watch('maxDate', (newValue, oldValue) => {
            if (!newValue)
                return;

            // 时间戳或字符串自动转为日期类型
            if (typeof newValue === 'number')
                return this.data.maxDate = new Date(newValue);
            else if (typeof newValue === 'string')
                return this.data.maxDate = _.parseDate(newValue);

            if (newValue + '' === 'Invalid Date')
                throw new TypeError('Invalid Date');
        });

        this.$watch(['minDate', 'maxDate'], (minDate, maxDate) => {
            if (!(minDate && minDate instanceof Date || maxDate && maxDate instanceof Date))
                return;

            if (minDate && maxDate) {
                if (_.clearTime(minDate) > _.clearTime(maxDate))
                    throw new RangeError('Wrong Date Range where `minDate` is ' + minDate + ' and `maxDate` is ' + maxDate + '!');
            }

            // 如果超出日期范围，则设置为范围边界的日期
            const isOutOfRange = this.isOutOfRange(this.data.date);
            if (isOutOfRange)
                this.data.date = isOutOfRange;
        });
    },
    /**
     * @method _update() 日期改变后更新日历
     * @private
     * @return {void}
     */
    _update() {
        this.data._days = [];

        const date = this.data.date;
        const month = date.getMonth();
        const mfirst = new Date(date); mfirst.setDate(1);
        const mfirstTime = +mfirst;
        const nfirst = new Date(mfirst); nfirst.setMonth(month + 1); nfirst.setDate(1);
        const nfirstTime = +nfirst;
        const lastTime = nfirstTime + ((7 - nfirst.getDay())%7 - 1)*_.MS_OF_DAY;
        let num = -mfirst.getDay();
        let tmpTime, tmp;
        do {
            tmpTime = mfirstTime + (num++)*_.MS_OF_DAY;
            tmp = new Date(tmpTime);
            this.data._days.push(tmp);
        } while (tmpTime < lastTime);
    },
    /**
     * @method addYear(year) 调整年份
     * @public
     * @param  {number=0} year 加/减的年份
     * @return {Date} date 计算后的日期
     */
    addYear(year) {
        if (this.data.readonly || this.data.disabled || !year)
            return;

        if (isNaN(year))
            throw new TypeError(year + ' is not a number!');

        const date = new Date(this.data.date);
        const oldMonth = date.getMonth();
        date.setFullYear(date.getFullYear() + year);
        if (date.getMonth() !== oldMonth)
            date.setDate(0);

        return this.data.date = date;
    },
    /**
     * @method addMonth(month) 调整月份
     * @public
     * @param  {number=0} month 加/减的月份
     * @return {Date} date 计算后的日期
     */
    addMonth(month) {
        if (this.data.readonly || this.data.disabled || !month)
            return;

        if (isNaN(month))
            throw new TypeError(month + ' is not a number!');

        const date = new Date(this.data.date);
        const correctMonth = date.getMonth() + month;
        date.setMonth(correctMonth);
        // 如果跳月，则置为上一个月
        if ((date.getMonth() - correctMonth)%12)
            date.setDate(0);

        return this.data.date = date;
    },
    /**
     * @method select(date) 选择一个日期
     * @public
     * @param  {Date} date 选择的日期
     * @return {void}
     */
    select(date) {
        if (this.data.readonly || this.data.disabled || this.isOutOfRange(date))
            return;

        this.data.date = new Date(date);

        /**
         * @event select 选择某一个日期时触发
         * @property {object} sender 事件发送对象
         * @property {object} date 当前选择的日期
         */
        this.$emit('select', {
            sender: this,
            date,
        });
    },
    /**
     * @method goToday() 回到今天
     * @public
     * @return {void}
     */
    goToday() {
        if (this.data.readonly || this.data.disabled)
            return;

        this.data.date = _.clearTime(new Date());
    },
    /**
     * @method isOutOfRange(date) 是否超出规定的日期范围
     * @public
     * @param {Date} date 待测的日期
     * @return {boolean|Date} date 如果没有超出日期范围，则返回false；如果超出日期范围，则返回范围边界的日期
     */
    isOutOfRange(date) {
        let minDate = this.data.minDate;
        let maxDate = this.data.maxDate;

        if (minDate && typeof minDate === 'string' || maxDate && typeof maxDate === 'string')
            return;

        // 不要直接在$watch中改变`minDate`和`maxDate`的值，因为有时向外绑定时可能不希望改变它们。
        minDate = minDate && _.clearTime(minDate);
        maxDate = maxDate && _.clearTime(maxDate);

        // minDate && date < minDate && minDate，先判断是否为空，再判断是否超出范围，如果超出则返回范围边界的日期
        return (minDate && date < minDate && minDate) || (maxDate && date > maxDate && maxDate);
    },
});

export default Calendar;
