import moment from 'moment';
import latinize from 'latinize';

const dayString = (d, dayStrings) => {
    const day = moment(d);
    const today = moment().utc().subtract(3, 'hours');
    const isToday = day.isBetween(
        today.clone().startOf('day'),
        today.clone().endOf('day')
    );
    const diff = day.clone().endOf('day').diff(today.clone().endOf('day'), 'days');
    if (isToday) {
        return dayStrings.today;
    }
    if (diff <= 1) {
        return dayStrings.tomorrow;
    }
    if (diff <= 2) {
        return dayStrings.dayAfterTomorrow;
    }
    return day.format('LL');
};

const durationFormat = minutes => {
    const m = parseInt(minutes, 10);
    const hours = Math.floor(m / 60);
    const min = m - (hours * 60);
    return hours < 1
        ? `${min}min`
        : `${hours}h${min}min`;
};

const polloSanitize = text => latinize(text)
    .toLowerCase()
    // remove botusername
    .replace(/^@[^ ]* /, '')
    // @HACK wit has trouble with janeiro
    .replace(/rio de janeiro/, 'riodejaneiro')
;

export { dayString, polloSanitize, durationFormat };
