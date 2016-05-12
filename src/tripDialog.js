import { replies } from '../replies';
const tripDialogReply = context => {
    const {
        origin,
        destination,
        departureDay,
        apiError,
        trips
    } = context;
    const hasOrigin = origin !== undefined;
    const hasDestination = destination !== undefined;
    const hasDay = departureDay !== undefined;
    const hasApiError = apiError !== undefined;
    const hasTrips = trips !== undefined;
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
        return replies.trip.noTrips(origin, destination);
    }
    if (hasDestination && hasOrigin && hasTrips && !hasDay) {
        const day = Date.now();
        return replies.trip.departureList(origin, destination, day, trips);
    }
    return replies.trip.departureList(origin, destination, departureDay, trips);
};

export { tripDialogReply };
