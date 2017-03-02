import Calendar from '../';
import _ from '../../util';

describe('Calendar', () => {
    const today = _.clearTime(new Date());
    const today2 = new Date(+new Date() + 2*_.MS_OF_DAY);
    const today7 = new Date(+new Date() + 7*_.MS_OF_DAY);

    const isInCurrentMonth = function (calendar, date) {
        return calendar.data._days.some((day) =>
            day.toDateString() === date.toDateString());
    };

    describe('initialized without params', () => {
        const calendar = new Calendar();

        it('should select today by default.', () => {
            expect(calendar.data.date - today).to.be(0);
        });

        it('should output `_days` of this month.', () => {
            expect(calendar.data._days.length >= 28).to.be.ok();
        });

        describe('#select(date)', () => {
            it('should select correct date.', () => {
                const date = new Date(+new Date() + 4*_.MS_OF_DAY);
                calendar.select(date);
                calendar.$update();

                expect(calendar.data.date - date).to.be(0);
            });

            it('should update `_days` after select next month.', () => {
                const date = new Date(+new Date() + 30*_.MS_OF_DAY);
                calendar.select(date);
                calendar.$update();

                expect(calendar.data.date - date).to.be(0);
                expect(isInCurrentMonth(calendar, date)).to.be.ok();
            });
        });

        describe('#addMonth(month)', () => {
            it('should be "2015-09-30" instead of "2015-10-01" after "2015-08-31" added 1 month.', () => {
                const date = new Date('2015-08-31');
                calendar.data.date = date;
                calendar.$update();

                calendar.addMonth(1);
                calendar.$update();

                expect(calendar.data.date - new Date('2015-09-30')).to.be(0);
            });

            it('should be "2015-08-31" instead of "2015-07-01" after "2015-08-31" added -2 monthes.', () => {
                const date = new Date('2015-08-31');
                calendar.data.date = date;
                calendar.$update();

                calendar.addMonth(-2);
                calendar.$update();

                expect(calendar.data.date - new Date('2015-06-30')).to.be(0);
            });

            it('should be "2016-02-29" instead of "2016-03-01" after "2015-12-31" added 2 monthes.', () => {
                const date = new Date('2015-12-31');
                calendar.data.date = date;
                calendar.$update();

                calendar.addMonth(2);
                calendar.$update();

                expect(calendar.data.date - new Date('2016-02-29')).to.be(0);
            });

            it('should throw a TypeError with an invalid number.', () => {
                try {
                    calendar.addMonth('test');
                } catch (e) {
                    expect(e).to.be.a(TypeError);
                }
            });
        });

        describe('#addYear(year)', () => {
            it('should be "2017-02-28" instead of "2017-03-01" after "2016-02-29" added 1 year.', () => {
                const date = new Date('2016-02-29');
                calendar.data.date = date;
                calendar.$update();

                calendar.addYear(1);
                calendar.$update();

                expect(calendar.data.date - new Date('2017-02-28')).to.be(0);
            });

            it('should be "2013-02-28" instead of "2013-03-01" after "2016-02-29" added -3 years.', () => {
                const date = new Date('2016-02-29');
                calendar.data.date = date;
                calendar.$update();

                calendar.addYear(-3);
                calendar.$update();

                expect(calendar.data.date - new Date('2013-02-28')).to.be(0);
            });

            it('should throw a TypeError with an invalid number.', () => {
                try {
                    calendar.addYear('test');
                } catch (e) {
                    expect(e).to.be.a(TypeError);
                }
            });
        });

        describe('#goToday()', () => {
            it('should go back today.', () => {
                calendar.select(today7);
                calendar.$update();

                calendar.goToday();
                calendar.$update();

                expect(calendar.data.date - today).to.be(0);
            });
        });

        describe('#isOutOfRange(date)', () => {
            it('should return false with any date.', () => {
                expect(calendar.isOutOfRange(today7)).not.to.be.ok();
            });
        });

        describe('#on-change', () => {
            // 暂时没有好方法
            xit('should not emit if date is not changed.', () => {
                calendar.$one('change', ($event) => {
                    // console.log($event.date);
                    expect().fail();
                });
                calendar.data.date = new Date();
                calendar.$update();
            });
        });
    });

    describe('initialized with string-type `date`', () => {
        const calendar = new Calendar({
            data: {
                date: '2008-08-08',
            },
        });

        it('should convert `date` property from string-type to Date-type.', () => {
            expect(calendar.data.date).to.be.a(Date);
            expect(calendar.data.date - new Date('2008-08-08')).to.be(0);
        });

        it('should output `_days` of this month.', () => {
            expect(calendar.data._days.length >= 28).to.be.ok();
        });
    });

    describe('initialized with Date-type `date`', () => {
        const calendar = new Calendar({
            data: {
                date: today2,
            },
        });

        it('should select this day.', () => {
            expect(calendar.data.date - today2).to.be(0);
        });

        it('should output `_days` of this month.', () => {
            expect(calendar.data._days.length >= 28).to.be.ok();
        });

        it('should check if out of the range after set a new `minDate` or `maxDate` value.', () => {
            calendar.data.minDate = today7;
            calendar.$update();

            expect(calendar.data.date.toDateString()).to.be(today7.toDateString());
        });
    });

    describe('initialized with invalid `date`', () => {
        it('should throw a TypeError.', () => {
            try {
                const calendar = new Calendar({
                    data: {
                        date: 'test',
                    },
                });
            } catch (e) {
                expect(e).to.be.a(TypeError);
            }
        });
    });

    describe('initialized to be disabled', () => {
        const calendar = new Calendar({
            data: {
                disabled: true,
            },
        });

        it('should select today by default.', () => {
            expect(calendar.data.date - today).to.be(0);
        });

        it('should output `_days` of this month.', () => {
            expect(calendar.data._days.length >= 28).to.be.ok();
        });

        describe('#select(date)', () => {
            it('should not react.', () => {
                const oldDate = calendar.data.date;

                const date = new Date(+new Date() + 4*_.MS_OF_DAY);
                calendar.select(date);
                calendar.$update();

                expect(calendar.data.date).to.be(oldDate);
            });
        });

        describe('#addMonth(month)', () => {
            it('should not react.', () => {
                const oldDate = calendar.data.date;

                calendar.addMonth(1);
                calendar.$update();

                expect(calendar.data.date).to.be(oldDate);
            });
        });

        describe('#addYear(month)', () => {
            it('should not react.', () => {
                const oldDate = calendar.data.date;

                calendar.addYear(3);
                calendar.$update();

                expect(calendar.data.date).to.be(oldDate);
            });
        });

        describe('#goToday()', () => {
            it('should not react.', () => {
                const oldDate = calendar.data.date;

                calendar.select(today7);
                calendar.$update();

                calendar.goToday();
                calendar.$update();

                expect(calendar.data.date).to.be(oldDate);
            });
        });
    });

    describe('initialized with Date-type `minDate` and `maxDate`', () => {
        const calendar = new Calendar({
            data: {
                minDate: today2,
                maxDate: today7,
            },
        });

        it('should select the boundary date if out of range.', () => {
            expect(calendar.data.date.toDateString()).to.be(today2.toDateString());
        });

        it('should output `_days` of this month.', () => {
            expect(calendar.data._days.length >= 28).to.be.ok();
        });

        it('should check if out of the range after set a new `date` value.', () => {
            calendar.data.date = new Date(+new Date() + 16*_.MS_OF_DAY);
            calendar.$update();

            expect(calendar.data.date.toDateString()).to.be(today7.toDateString());
        });

        describe('#isOutOfRange(date)', () => {
            it('should return true if out of range.', () => {
                expect(calendar.isOutOfRange(today)).to.be.ok();
                expect(calendar.isOutOfRange(today).toDateString()).to.be(today2.toDateString());
            });

            it('should return false if in the range.', () => {
                expect(calendar.isOutOfRange(new Date(+new Date() + 3*_.MS_OF_DAY))).not.to.be.ok();
            });
        });
    });

    describe('initialized with string-type `minDate` and `maxDate`', () => {
        const calendar = new Calendar({
            data: {
                minDate: '2008-08-08',
                maxDate: '2008-08-16',
            },
        });

        it('should select the boundary date if out of range.', () => {
            expect(calendar.data.date - new Date('2008-08-16')).to.be(0);
        });
    });

    describe('initialized with wrong range where `minDate` > `maxDate`', () => {
        it('should throw a RangeError.', () => {
            try {
                const calendar = new Calendar({
                    data: {
                        minDate: today7,
                        maxDate: today2,
                    },
                });
            } catch (e) {
                expect(e).to.be.a(RangeError);
            }
        });
    });

    describe('initialized with invalid `minDate` or invalid `maxDate`', () => {
        it('should throw a TypeError.', () => {
            try {
                const calendar = new Calendar({
                    data: {
                        minDate: 'test',
                    },
                });
            } catch (e) {
                expect(e).to.be.a(TypeError);
            }

            try {
                const calendar = new Calendar({
                    data: {
                        maxDate: 'test',
                    },
                });
            } catch (e) {
                expect(e).to.be.a(TypeError);
            }
        });
    });
});
