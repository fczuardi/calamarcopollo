import moment from 'moment';
import request from 'request-promise';
import { replies } from '../replies';

const CLICKBUS_URL = process.env.CLICKBUS_URL;
const CLICKBUS_WEB_URL = process.env.CLICKBUS_WEB_URL;

const tripDialogReply = context => {
    const {
        origin,
        originMeta,
        destination,
        destinationMeta,
        timeFilter,
        apiError,
        trips
    } = context;
    const hasOrigin = origin !== undefined;
    const hasDestination = destination !== undefined;
    const hasApiError = apiError !== undefined;
    const hasTrips = trips !== undefined;
    const hasNoTrips = hasTrips && !trips.length;
    if (hasApiError) {
        return replies.apiError;
    }
    if (!hasOrigin && !hasDestination) {
        return replies.trip.noPlaces;
    }
    if (hasOrigin && !hasDestination) {
        return replies.trip.noDestination;
    }
    if (hasDestination && !hasOrigin) {
        return replies.trip.noOrigin;
    }
    if (hasDestination && hasOrigin && !hasTrips) {
        console.log('originMeta', originMeta);
        console.log('destinationMeta', destinationMeta);
        if (!originMeta) {
            return replies.trip.noSlug(origin);
        }
        if (!destinationMeta) {
            return replies.trip.noSlug(destination);
        }
        const from = originMeta.slugs[0];
        const to = destinationMeta.slugs[0];
        const day = timeFilter && timeFilter.from
            ? moment(timeFilter.from.value) : moment();
        const departure = day.format('YYYY-MM-DD');
        const url = `${CLICKBUS_URL}/trips?from=${from}&to=${to}&departure=${departure}`;
        console.log(`requesting ${url}`);
        return request(url);
    }
    if (hasDestination && hasOrigin && hasTrips && hasNoTrips) {
        if (!originMeta || !destinationMeta) {
            return replies.trip.noTrips(origin, destination);
        }
        const from = originMeta.slugs[0];
        const to = destinationMeta.slugs[0];
        const url = `${CLICKBUS_WEB_URL}/${from}/${to}/`;
        return replies.trip.noTripsWithUrl(origin, destination, url);
    }
    if (hasDestination && hasOrigin && hasTrips && timeFilter.from && timeFilter.from.grain !== 'day') {
        const filteredTripsAfter = trips.filter(trip =>
            trip.departureTime.isAfter(timeFilter.from.value)
        );
        if (timeFilter.to === null) {
            return replies.trip.filteredDepartureListAfter(
                origin,
                destination,
                moment(timeFilter.from.value),
                filteredTripsAfter.length
            );
        }
        const filteredTripsBetween = filteredTripsAfter.filter(trip =>
            trip.departureTime.isBefore(timeFilter.to.value)
        );
        console.log('timeFilter.from.value', timeFilter.from.value);
        console.log('timeFilter.to.value', timeFilter.to.value);
        return replies.trip.filteredDepartureListBetween(
            origin,
            destination,
            moment(timeFilter.from.value),
            moment(timeFilter.to.value),
            filteredTripsBetween.length
        );
    }
    const day = timeFilter && timeFilter.from ? moment(timeFilter.from) : moment();
    const departure = day.format('YYYY-MM-DD');
    return replies.trip.departureList(origin, destination, departure, trips.length);
};

export { tripDialogReply };
