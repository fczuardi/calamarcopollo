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
        departureDay,
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
        const day = departureDay || moment();
        const departure = moment(day).format('YYYY-MM-DD');
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
    return replies.trip.departureList(origin, destination, departureDay, trips.length);
};

export { tripDialogReply };
