import moment from 'moment';
import { replies } from '../replies';
import latinize from 'latinize';

const CLICKBUS_URL = process.env.CLICKBUS_URL;
const CLICKBUS_SVG_LOGO_URL = process.env.CLICKBUS_SVG_LOGO_URL || 'https://m.clickbus.com.br/app/public/img/buslines/br/';

const tripListSizeThreshold = 10;

const buildFacebookElements = (origin, destination, session, searchUrl, trips) => {
    console.log('buildFacebookElements');
    const result = trips.map(trip => {
        const {
            price,
            arrivalTime,
            arrivalPlace,
            departurePlace,
            departureTime,
            busCompanyName,
            // busCompanyLogo,
            availableSeats,
            duration,
            scheduleId
        } = trip;
        const busCompanyLogoName = latinize(busCompanyName).replace(/ |%20/ig, '-').toLowerCase();
        const busCompanyLogo = `${CLICKBUS_SVG_LOGO_URL}${busCompanyLogoName}.svg`;
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
        const title = replies.trip.listTitle(
            company, departureTime, availableSeats, duration, formattedPrice
        );
        const subtitle = replies.trip.listItemFb(company, departure, arrival, seats, duration, true);
        const baseURL = `${process.env.BOT_URL}${process.env.POST_TO_CLICKBUS_HACK_PATH}`;
        const decodedScheduleTrip = new Buffer(scheduleId, 'base64').toString('utf8');
        const trips0 = decodedScheduleTrip.split('--').map((item, index) => {
            if ([2, 4, 8, 9].includes(index)) {
                return `"${item}"`;
            }
            if (index === 7) {
                return item === '1';
            }
            return parseInt(item, 10);
        }).toString();
        const postBody = {
            originSlug: origin,
            destinationSlug: destination,
            trips0,
            store: process.env.CLICKBUS_STORE,
            platform: process.env.CLICKBUS_PLATFORM
        };
        const postURL = process.env.CLICKBUS_WEB_POST_URL;
        const failUrl = searchUrl;
        const url = `${baseURL}?body=${JSON.stringify(postBody)}&url=${postURL}&session=${session}&failUrl=${failUrl}`;
        return {
            title,
            image_url: busCompanyLogo,
            buttons: [{
                type: 'web_url',
                url,
                title: replies.trip.detail()
            }],
            subtitle
        };
    });
    return result.slice(0, 10);
};

const tripDialogReply = context => {
    const {
        origin,
        originMeta,
        destination,
        destinationMeta,
        timeFilter,
        apiError,
        trips,
        shortUrl,
        sessionCookie
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
        return replies.trip.noPlaces();
    }
    if (hasOrigin && !originMeta) {
        return replies.trip.noSlug(origin);
    }
    if (hasDestination && !destinationMeta) {
        return replies.trip.noSlug(destination);
    }
    if (hasOrigin && !hasDestination) {
        return replies.trip.noDestination();
    }
    if (hasDestination && !hasOrigin) {
        return replies.trip.noOrigin();
    }
    const day = timeFilter && timeFilter.from
        ? moment(timeFilter.from.value) : moment();
    const departureDay = day.format('YYYY-MM-DD');
    if (hasDestination && hasOrigin && !hasTrips) {
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
            const structuredRely = buildFacebookElements(
                originMeta.slugs[0],
                destinationMeta.slugs[0],
                sessionCookie,
                shortUrl,
                filteredTripsAfter
            );
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
                structuredRely
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
        const structuredRely = buildFacebookElements(
            originMeta.slugs[0],
            destinationMeta.slugs[0],
            sessionCookie,
            shortUrl,
            filteredTripsBetween
        );
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
            structuredRely
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
    const structuredRely = buildFacebookElements(
        originMeta.slugs[0],
        destinationMeta.slugs[0],
        sessionCookie,
        shortUrl,
        trips
    );
    // console.log('structuredRely', JSON.stringify(structuredRely));
    return {
        textReply: replies.trip.departureList(
            origin,
            destination,
            departureDay,
            trips.length,
            shortUrl,
            trips.length < tripListSizeThreshold ? tripList : null
        ),
        structuredRely
    };
};

export { tripDialogReply };
