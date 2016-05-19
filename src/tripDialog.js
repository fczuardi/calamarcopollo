import moment from 'moment';
import { replies } from '../replies';

const CLICKBUS_URL = process.env.CLICKBUS_URL;
const CLICKBUS_WEB_URL = process.env.CLICKBUS_WEB_URL;

const tripListSizeThreshold = 10;

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
        return replies.trip.apiError(apiError);
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
        return {
            url
        };
    }
    if (!originMeta || !destinationMeta) {
        return replies.trip.noTrips(origin, destination);
    }
    const from = originMeta.slugs[0];
    const to = destinationMeta.slugs[0];
    const webUrl = `${CLICKBUS_WEB_URL}/${from}/${to}/`;
    if (hasDestination && hasOrigin && hasTrips && hasNoTrips) {
        return replies.trip.noTripsWithUrl(origin, destination, webUrl);
    }
    if (hasDestination && hasOrigin && hasTrips && timeFilter &&
                timeFilter.from && timeFilter.from.grain !== 'day') {
        const filteredTripsAfter = trips.filter(trip =>
            trip.departureTime.isAfter(timeFilter.from.value)
        );
        if (timeFilter.to === null) {
            const tripListAfter = filteredTripsAfter.map(trip => {
                const departure = moment(trip.departureTime).format('DD/MM HH:mm');
                const arrival = moment(trip.arrivalTime).format('DD/MM HH:mm');
                const company = trip.busCompanyName;
                const seats = trip.availableSeats;
                return `${company}: ${departure} - ${arrival}, ${seats} lugares disponíveis.`;
            }).join('\n');
            return replies.trip.filteredDepartureListAfter(
                origin,
                destination,
                moment(timeFilter.from.value),
                filteredTripsAfter.length,
                webUrl,
                (filteredTripsAfter.length < tripListSizeThreshold) ? tripListAfter : null
            );
        }
        const filteredTripsBetween = filteredTripsAfter.filter(trip =>
            trip.departureTime.isBefore(timeFilter.to.value)
        );
        const tripListBetween = filteredTripsBetween.map(trip => {
            const departure = moment(trip.departureTime).format('DD/MM HH:mm');
            const arrival = moment(trip.arrivalTime).format('DD/MM HH:mm');
            const company = trip.busCompanyName;
            const seats = trip.availableSeats;
            return `${company}: ${departure} - ${arrival}, ${seats} lugares disponíveis.`;
        }).join('\n');
        return replies.trip.filteredDepartureListBetween(
            origin,
            destination,
            moment(timeFilter.from.value),
            moment(timeFilter.to.value),
            filteredTripsBetween.length,
            webUrl,
            (filteredTripsBetween.length < tripListSizeThreshold) ? tripListBetween : null
        );
    }
    const tripList = trips.map(trip => {
        const departure = moment(trip.departureTime).format('DD/MM HH:mm');
        const arrival = moment(trip.arrivalTime).format('DD/MM HH:mm');
        const company = trip.busCompanyName;
        const seats = trip.availableSeats;
        return `${company}: ${departure} - ${arrival}, ${seats} lugares disponíveis.`;
    }).join('\n');
    const day = timeFilter && timeFilter.from ? moment(timeFilter.from) : moment();
    const departure = day.format('YYYY-MM-DD');
    return replies.trip.departureList(
        origin,
        destination,
        departure,
        trips.length,
        webUrl,
        trips.length < tripListSizeThreshold ? tripList : null
    );
};

export { tripDialogReply };
