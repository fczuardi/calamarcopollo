import moment from 'moment';
import { replies } from '../replies';

const CLICKBUS_URL = process.env.CLICKBUS_URL;

const tripListSizeThreshold = 10;

const buildFacebookElements = trips => trips.map(trip => {
    const {
        price,
        arrivalTime,
        arrivalPlace,
        departurePlace,
        departureTime,
        busCompanyName,
        // busCompanyLogo,
        availableSeats,
        duration
    } = trip;
    const departure = {
        time: moment(departureTime).format('DD/MM HH:mm'),
        name: departurePlace
    };
    const arrival = {
        time: moment(arrivalTime).format('DD/MM HH:mm'),
        name: arrivalPlace
    };
    const company = busCompanyName;
    const seats = availableSeats;
    const formattedPrice = `R$${price.slice(0, -2)},${price.slice(-2)}`;
    const title = replies.trip.listTitle(company, departureTime, availableSeats, duration, formattedPrice);
    const subtitle = replies.trip.listItemFb(company, departure, arrival, seats, duration, true);
    return {
        title,
        // image_url: busCompanyLogo,
        subtitle
    };
});

const tripDialogReply = context => {
    const {
        origin,
        originMeta,
        destination,
        destinationMeta,
        timeFilter,
        apiError,
        trips,
        chatPlatform,
        shortUrl
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
    const day = timeFilter && timeFilter.from
        ? moment(timeFilter.from.value) : moment();
    const departureDay = day.format('YYYY-MM-DD');
    if (hasDestination && hasOrigin && !hasTrips) {
        if (!originMeta) {
            return replies.trip.noSlug(origin);
        }
        if (!destinationMeta) {
            return replies.trip.noSlug(destination);
        }
        const from = originMeta.slugs[0];
        const to = destinationMeta.slugs[0];
        const url = `${CLICKBUS_URL}/trips?from=${from}&to=${to}&departure=${departureDay}`;
        return {
            url,
            departureDay
        };
    }
    if (!originMeta || !destinationMeta) {
        return replies.trip.noTrips(origin, destination);
    }

    if (hasDestination && hasOrigin && hasTrips && hasNoTrips) {
        return replies.trip.noTripsWithUrl(origin, destination, shortUrl);
    }
    if (hasDestination && hasOrigin && hasTrips && timeFilter &&
                timeFilter.from && timeFilter.from.grain !== 'day') {
        const filteredTripsAfter = trips.filter(trip =>
            trip.departureTime.isAfter(timeFilter.from.value)
        );


        if (timeFilter.to === null) {
            const tripListAfter = filteredTripsAfter.map(trip => {
                const departure = {
                    time: moment(trip.departureTime).format('DD/MM HH:mm'),
                    name: trip.departurePlace
                };
                const arrival = {
                    time: moment(trip.arrivalTime).format('DD/MM HH:mm'),
                    name: trip.arrivalPlace
                };
                const company = trip.busCompanyName;
                const seats = trip.availableSeats;

                return replies.trip.listItemTg(company, departure, arrival, seats);
            });
            return {
                textReply: replies.trip.filteredDepartureListAfter(
                    origin,
                    destination,
                    moment(timeFilter.from.value),
                    filteredTripsAfter.length,
                    shortUrl,
                    (filteredTripsAfter.length < tripListSizeThreshold)
                        ? tripListAfter.join('\n')
                        : null
                ),
                structuredRely: buildFacebookElements(filteredTripsAfter)
                // structuredRely: []
            };
        }
        const filteredTripsBetween = filteredTripsAfter.filter(trip =>
            trip.departureTime.isBefore(timeFilter.to.value)
        );
        const tripListBetween = filteredTripsBetween.map(trip => {
            const departure = {
                time: moment(trip.departureTime).format('DD/MM HH:mm'),
                name: trip.departurePlace
            };
            const arrival = {
                time: moment(trip.arrivalTime).format('DD/MM HH:mm'),
                name: trip.arrivalPlace
            };
            const company = trip.busCompanyName;
            const seats = trip.availableSeats;
            return replies.trip.listItemTg(company, departure, arrival, seats);
        }).join('\n');
        return {
            textReply: replies.trip.filteredDepartureListBetween(
                origin,
                destination,
                moment(timeFilter.from.value),
                moment(timeFilter.to.value),
                filteredTripsBetween.length,
                shortUrl,
                (filteredTripsBetween.length < tripListSizeThreshold)
                    ? tripListBetween
                    : null
            ),
            structuredRely: buildFacebookElements(filteredTripsBetween)
        };
    }
    const tripList = trips.map(trip => {
        const departure = {
            time: moment(trip.departureTime).format('DD/MM HH:mm'),
            name: trip.departurePlace
        };
        const arrival = {
            time: moment(trip.arrivalTime).format('DD/MM HH:mm'),
            name: trip.arrivalPlace
        };
        const company = trip.busCompanyName;
        const seats = trip.availableSeats;
        return replies.trip.listItemTg(company, departure, arrival, seats);
    }).join('\n');
    return {
        textReply: replies.trip.departureList(
            origin,
            destination,
            departureDay,
            trips.length,
            shortUrl,
            trips.length < tripListSizeThreshold ? tripList : null
        ),
        structuredRely: buildFacebookElements(trips)
    };
};

export { tripDialogReply };
