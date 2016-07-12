import moment from 'moment';
import { replies } from '../replies';
import latinize from 'latinize';

const CLICKBUS_URL = process.env.CLICKBUS_URL;
const CLICKBUS_SVG_LOGO_URL = process.env.CLICKBUS_SVG_LOGO_URL || 'https://m.clickbus.com.br/app/public/img/buslines/br/';
const MORE_RESULTS_IMAGE_URL = process.env.MORE_RESULTS_IMAGE_URL;

const buildFacebookElements = (origin, destination, session, searchUrl, trips) => {
    if (!trips || !trips.length ){
        console.log('buildFacebookElements', trips);
        return [];
    }
    console.log('buildFacebookElements', trips.length);
    const result = trips.map(trip => {
        const {
            price,
            arrivalTime,
            arrivalPlace,
            departurePlace,
            departureTime,
            busCompanyName,
            // busCompanyLogo,
            busType,
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
            company, departureTime, availableSeats, duration, formattedPrice, busType
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
    return result.slice(0, 9).concat(buildLastFacebookElement(searchUrl));
};

const buildLastFacebookElement = url => (
    {
        title: replies.trip.moreResultsTitle(),
        image_url: MORE_RESULTS_IMAGE_URL,
        buttons: [{
            type: 'web_url',
            url,
            title: replies.trip.moreResultsButton()
        }]
    }
);

const busTypeValueIds = {
    convencional: [1],
    'semi-leito': [2, 3],
    leito: [4, 5, 6, 7, 8, 9]
};

const sortTripByDepartureTime = (tripA, tripB) => (
    tripA.departureTime.isBefore(tripB.departureTime) ? -1 : 1
);
const sortTripsByPriceAscending = (tripA, tripB) => {
    const priceA = parseInt(tripA.price, 10);
    const priceB = parseInt(tripB.price, 10);
    if (priceA < priceB) {
        return -1;
    }
    if (priceA > priceB) {
        return 1;
    }
    return sortTripByDepartureTime(tripA, tripB);
};
const sortTripsByPriceDescending = (tripA, tripB) => {
    const priceA = parseInt(tripA.price, 10);
    const priceB = parseInt(tripB.price, 10);
    if (priceA > priceB) {
        return -1;
    }
    if (priceA < priceB) {
        return 1;
    }
    return sortTripByDepartureTime(tripA, tripB);
};

const getExpandedResults = (sortedTrips, filteredTripsAfter, filteredTripsBetween, filteredTripsByBusType) => {
    let excludedFilters = [];

    if (filteredTripsByBusType.length > 0) {
        const result = {
            excludedFilters,
            results: filteredTripsByBusType
        };
        return result;
    }
    excludedFilters.push('busTypeFilters');

    if (filteredTripsBetween.length > 0) {
        const result = {
            excludedFilters,
            results: filteredTripsBetween
        };
        return result;
    }
    excludedFilters.push('timeFilterTo');

    if (filteredTripsAfter.length > 0) {
        return {
            excludedFilters,
            results: filteredTripsAfter
        };
    }
    excludedFilters.push('timeFilterFrom');

    return {
        excludedFilters,
        results: sortedTrips
    };
};

const filterByBusType = (trips, busTypeFilters) => {
    const hasBustypeFilters = busTypeFilters && busTypeFilters.length;
    return hasBustypeFilters ? trips.filter(trip => {
        const busTypeId = parseInt(trip.busTypeId, 10);
        // array flatten in js http://stackoverflow.com/a/10865042/2052311
        const busTypeIds = [].concat.apply([],
            busTypeFilters.map(busTypeEntity => busTypeValueIds[busTypeEntity.value])
        );
        const result = busTypeIds.indexOf(busTypeId) !== -1;
        return result;
    }) : trips;
}

const tripDialogReply = context => {
    const {
        origin,
        originMeta,
        destination,
        destinationMeta,
        timeFilter,
        priceFilter,
        busTypeFilters,
        apiError,
        trips,
        shortUrl,
        sessionCookie
    } = context;
    // console.log('tripDialogReply context', context);
    const hasOrigin = origin !== undefined;
    const hasDestination = destination !== undefined;
    const hasApiError = apiError !== undefined;
    const hasTrips = trips !== undefined;
    const hasNoTrips = hasTrips && !trips.length;
    const hasBustypeFilters = busTypeFilters && busTypeFilters.length;
    const hasPriceFilter = priceFilter !== undefined;
    if (hasApiError) {
        // console.log('hasApiError, return', apiError);
        return replies.trip.apiError(apiError);
    }
    if (!hasOrigin && !hasDestination) {
        // console.log('no places, return');
        return replies.trip.noPlaces();
    }
    if (hasOrigin && !originMeta) {
        // console.log('no slug (origin), return', origin);
        return replies.trip.noSlug(origin);
    }
    if (hasDestination && !destinationMeta) {
        // console.log('no slug (destination), return', destination);
        return replies.trip.noSlug(destination);
    }
    if (hasOrigin && !hasDestination) {
        // console.log('no destination, return');
        return replies.trip.noDestination();
    }
    if (hasDestination && !hasOrigin) {
        // console.log('no origin, return');
        return replies.trip.noOrigin();
    }
    const day = timeFilter && timeFilter.from
        ? moment(timeFilter.from.value) : moment();
    const departureDay = day.format('YYYY-MM-DD');
    if (hasDestination && hasOrigin && !hasTrips) {
        const from = originMeta.slugs[0];
        const to = destinationMeta.slugs[0];
        const url = `${CLICKBUS_URL}/trips?from=${from}&to=${to}&departure=${departureDay}`;
        // console.log('need to make api call, return', url);
        return {
            url,
            departureDay
        };
    }
    if (!originMeta || !destinationMeta) {
        // console.log('missing metadata', origin, destination);
        return replies.trip.noTrips(origin, destination);
    }

    if (hasDestination && hasOrigin && hasTrips && hasNoTrips) {
        // console.log('has metadata but api returned 0 results', shortUrl);
        return replies.trip.noTripsWithUrl(origin, destination, shortUrl);
    }

    // console.log('build hasBustypeFilters array');
    const btfValues = hasBustypeFilters
        ? busTypeFilters.reduce((prev, curr) => (
            prev.indexOf(curr.value) === -1
                ? prev.concat(curr.value)
                : prev
        ), [])
        : null;

    // console.log('filteredTripsByBusType.length', filteredTripsByBusType.length, trips.length);

    const sortByPrice = hasPriceFilter && priceFilter.value !== 'maiorPreco'
        ? sortTripsByPriceAscending
        : sortTripsByPriceDescending;
    const sortedTrips = hasPriceFilter
        ? trips.sort(sortByPrice)
        : trips;


    if (hasDestination && hasOrigin && hasTrips && timeFilter) {
        const hasIntervalFrom = (
            timeFilter.from && timeFilter.from.value && timeFilter.from.grain !== 'day');
        const hasIntervalTo = (
            timeFilter.to && timeFilter.to.value && timeFilter.to.grain !== 'day');
        if (hasIntervalFrom) {
            // Filter trips after a day time
            const filteredTripsAfter = sortedTrips.filter(trip =>
                trip.departureTime.isSameOrAfter(timeFilter.from.value)
            );

            if (hasIntervalTo) {
                // Filter trips after a day time and before another time
                const filteredTripsBetween = filteredTripsAfter.filter(trip =>
                    trip.departureTime.isSameOrBefore(timeFilter.to.value)
                );
                const {
                    results,
                    excludedFilters
                } = getExpandedResults(sortedTrips, filteredTripsAfter, filteredTripsBetween, filterByBusType(filteredTripsBetween, busTypeFilters));
                console.log('excludedFilters', excludedFilters);
                const structuredRely = buildFacebookElements(
                    originMeta.slugs[0],
                    destinationMeta.slugs[0],
                    sessionCookie,
                    shortUrl,
                    results
                );
                const textReply = replies.trip.filteredDepartureList(
                    origin,
                    destination,
                    results,
                    shortUrl,
                    {
                        day,
                        timeFilterFrom: moment(timeFilter.from.value),
                        timeFilterTo: moment(timeFilter.to.value),
                        busTypeFilters: btfValues,
                        priceFilter,
                        excludedFilters
                    }
                );
                return {
                    textReply,
                    structuredRely
                };
            }

            console.log('!hasIntervalTo . . . . .');
            const {
                results,
                excludedFilters
            } = getExpandedResults(sortedTrips, filteredTripsAfter, [], filterByBusType(filteredTripsAfter, busTypeFilters));
            console.log('excludedFilters', excludedFilters, filterByBusType(filteredTripsAfter, busTypeFilters).length);
            const structuredRely = buildFacebookElements(
                originMeta.slugs[0],
                destinationMeta.slugs[0],
                sessionCookie,
                shortUrl,
                results
            );
            const textReply = replies.trip.filteredDepartureList(
                origin,
                destination,
                results,
                shortUrl,
                {
                    day,
                    timeFilterFrom: moment(timeFilter.from.value),
                    timeFilterTo: null,
                    busTypeFilters: btfValues,
                    priceFilter,
                    excludedFilters
                }
            );
            return {
                textReply,
                structuredRely
            };
        }
        if (!hasIntervalFrom && hasIntervalTo) {
            // Filter trips before a day time
            const filteredTripsBefore = sortedTrips.filter(trip =>
                trip.departureTime.isSameOrBefore(timeFilter.to.value)
            );
            console.log('---filteredTripsBefore', filteredTripsBefore.length, sortedTrips.length);
            const {
                results,
                excludedFilters
            } = getExpandedResults(sortedTrips, sortedTrips, filteredTripsBefore, filterByBusType(filteredTripsBefore, busTypeFilters));
            console.log('excludedFilters', excludedFilters);
            const structuredRely = buildFacebookElements(
                originMeta.slugs[0],
                destinationMeta.slugs[0],
                sessionCookie,
                shortUrl,
                results
            );
            const textReply = replies.trip.filteredDepartureList(
                origin,
                destination,
                results,
                shortUrl,
                {
                    day,
                    timeFilterFrom: moment(timeFilter.from.value),
                    timeFilterTo: null,
                    busTypeFilters: btfValues,
                    priceFilter,
                    excludedFilters
                }
            );
            return {
                textReply,
                structuredRely
            };
        }
    }
    const {
        results,
        excludedFilters
    } = getExpandedResults(sortedTrips, [], [], filterByBusType(sortedTrips, busTypeFilters));
    console.log('excludedFilters', excludedFilters);
    const structuredRely = buildFacebookElements(
        originMeta.slugs[0],
        destinationMeta.slugs[0],
        sessionCookie,
        shortUrl,
        results
    );
    // console.log('structuredRely', JSON.stringify(structuredRely));


    const textReply = replies.trip.filteredDepartureList(
        origin,
        destination,
        results,
        shortUrl,
        {
            day,
            timeFilterFrom: null,
            timeFilterTo: null,
            busTypeFilters: btfValues,
            priceFilter,
            excludedFilters
        }
    );
    return {
        textReply,
        structuredRely
    };
};

export { tripDialogReply };
