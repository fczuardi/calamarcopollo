import { updateChatSession } from '../actionCreators';
import { tripDialogReply } from '../tripDialog';
import { WitDriver } from 'calamars';
const { getEntity, getEntities, getEntityValue, getEntityMeta } = WitDriver;

const placesConfidenceThreshold = 0.7;

const extractEntities = outcomes => {
    const unknownPlace = getEntity(outcomes, 'places');
    const unknownPlaces = getEntities(outcomes, 'places');
    const origin = getEntity(outcomes, 'origin');
    const origins = getEntities(outcomes, 'origin');
    const originMeta = getEntityMeta(origin);
    const destination = getEntity(outcomes, 'destination');
    const destinationMeta = getEntityMeta(destination);
    const dateTime = getEntity(outcomes, 'datetime');
    const timeFilter = dateTime ? {
        from: !dateTime.from ? dateTime : dateTime.from,
        to: dateTime.to ? dateTime.to : null
    } : null;
    return {
        unknownPlace,
        unknownPlaces,
        origin,
        origins,
        originMeta,
        destination,
        destinationMeta,
        timeFilter
    };
};

const routes = [[
    outcomes => getEntityValue(outcomes, 'trip') === 'info',
    (outcomes, { store, chat } = {}) => {
        const {
            origin,
            origins,
            originMeta,
            destination,
            destinationMeta,
            unknownPlace,
            unknownPlaces,
            timeFilter
        } = extractEntities(outcomes);
        const context = chat && chat.session ? chat.session : {};
        let nextContext = Object.assign({}, context);
        nextContext.timeFilter = timeFilter;
        if (destination && destination.confidence >= placesConfidenceThreshold) {
            nextContext.destination = destination.value;
            nextContext.destinationMeta = destinationMeta;
        }
        if (origin && origin.confidence >= placesConfidenceThreshold) {
            nextContext.origin = origin.value;
            nextContext.originMeta = originMeta;
            if (!destination) {
                if (
                    origins.length > 1 &&
                    origins[1].confidence >= placesConfidenceThreshold
                ) {
                    nextContext.destination = origins[1].value;
                    nextContext.destinationMeta = getEntityMeta(origins[1]);
                } else if (unknownPlace) {
                    nextContext.destination = unknownPlace.value;
                    nextContext.destinationMeta = getEntityMeta(unknownPlace);
                }
            }
        }
        if (!origin && !destination && unknownPlaces.length > 1) {
            console.log('[issue #25]: 2 places and no role');
            nextContext.origin = unknownPlaces[0].value;
            nextContext.originMeta = getEntityMeta(unknownPlaces[0]);
            nextContext.destination = unknownPlaces[1].value;
            nextContext.destinationMeta = getEntityMeta(unknownPlaces[1]);
        }
        if (unknownPlaces && nextContext.destination && !nextContext.origin) {
            nextContext.origin = unknownPlaces[0].value;
            nextContext.originMeta = getEntityMeta(unknownPlaces[0]);
        }
        if (
            (unknownPlaces && nextContext.origin && !nextContext.destination)
            || (unknownPlaces && !nextContext.origin && !nextContext.destination)
        ) {
            nextContext.destination = unknownPlaces[0].value;
            nextContext.destinationMeta = getEntityMeta(unknownPlaces[0]);
        }
        if (store) {
            store.dispatch(updateChatSession({
                chat: { ...chat, session: nextContext }
            }));
        }
        return tripDialogReply(nextContext);
    }
], [
    outcomes => (getEntityValue(outcomes, 'trip') !== 'info' && (
        getEntityValue(outcomes, 'places') ||
        getEntityValue(outcomes, 'origin') ||
        getEntityValue(outcomes, 'destination'
    ))),
    (outcomes, { store, chat } = {}) => {
        const context = chat && chat.session ? chat.session : {};
        const {
            unknownPlace,
            origin,
            destination,
            timeFilter
        } = extractEntities(outcomes);
        const place = unknownPlace || origin || destination;
        const placeMeta = getEntityMeta(place);
        let nextContext = Object.assign({}, context);
        nextContext.timeFilter = timeFilter;
        if (origin && destination) {
            console.log('[issue #24, comment 1] has origin and destination');
            nextContext.origin = origin.value;
            nextContext.originMeta = getEntityMeta(origin);
            nextContext.destination = destination.value;
            nextContext.destinationMeta = getEntityMeta(destination);
        }
        if (unknownPlace && destination) {
            console.log('[issue #24] has places with no role and destination');
            nextContext.origin = unknownPlace.value;
            nextContext.originMeta = getEntityMeta(unknownPlace);
            nextContext.destination = destination.value;
            nextContext.destinationMeta = getEntityMeta(destination);
        }
        if (nextContext.destination && !nextContext.origin) {
            nextContext.origin = place.value;
            nextContext.originMeta = placeMeta;
        } else if (
            (!nextContext.destination && nextContext.origin) ||
            (!nextContext.destination && !nextContext.origin)
        ) {
            nextContext.destination = place.value;
            if (placeMeta) {
                nextContext.destinationMeta = placeMeta;
            }
        }
        if (store) {
            store.dispatch(updateChatSession({
                chat: { ...chat, session: nextContext }
            }));
        }
        return tripDialogReply(nextContext);
    }
]];
export default routes;
