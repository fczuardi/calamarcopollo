import test from 'ava';
import { dayStrings } from '../replies';
import { dayString } from '../src/stringHelpers';

test.only('dayString calculates today, tomorrow, day after tomorrow and other dates', t => {
    const timestamp = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const today = dayString(timestamp, dayStrings);
    const tomorrow = dayString(timestamp + oneDay, dayStrings);
    const dayAfterTomorrow = dayString(timestamp + oneDay * 2, dayStrings);
    const other = dayString(timestamp + oneDay * 3, dayStrings);
    t.is(today, dayStrings.today);
    t.is(tomorrow, dayStrings.tomorrow);
    t.is(dayAfterTomorrow, dayStrings.dayAfterTomorrow);
    t.not(other, dayStrings.today);
    t.not(other, dayStrings.tomorrow);
    t.not(other, dayStrings.dayAfterTomorrow);
});
