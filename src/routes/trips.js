import { updateChatSession } from '../actionCreators';
import { tripDialogReply } from '../tripDialog';
import { extractEntities } from '../fuzzy';
import { WitDriver } from 'calamars';
const { getEntityValue, getEntityMeta } = WitDriver;

const placesConfidenceThreshold = 0.7;

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
        if (timeFilter) {
            nextContext.timeFilter = timeFilter;
        }
        if (destination && destination.confidence >= placesConfidenceThreshold) {
            nextContext.destination = destination.value;
            nextContext.destinationMeta = destinationMeta;
        }
        if (origin && origin.confidence >= placesConfidenceThreshold) {
            nextContext.origin = origin.value;
            nextContext.originMeta = originMeta;
            if (!destination) {
                if (
                    origins && origins.length > 1 &&
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
        if (!origin && !destination && unknownPlaces && unknownPlaces.length > 1) {
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
    outcomes => {
        const {
            unknownPlace,
            origin,
            destination,
            timeFilter
        } = extractEntities(outcomes);
        const place = unknownPlace || origin || destination;
        const result = (
            (origin && destination) ||
            (unknownPlace && destination) ||
            place ||
            timeFilter
        );
        return result;
    },
    (outcomes, { store, chat } = {}) => {
        const context = chat && chat.session ? chat.session : {};
        const {
            unknownPlace,
            origin,
            destination,
            timeFilter
        } = extractEntities(outcomes);
        const unknownPlaceMeta = getEntityMeta(unknownPlace);
        let nextContext = Object.assign({}, context);
        if (timeFilter) {
            nextContext.timeFilter = timeFilter;
        }
        if (origin) {
            // console.log('1 origin', origin);
            nextContext.origin = origin.value;
            nextContext.originMeta = getEntityMeta(origin);
        } else {
            // console.log('2 not origin', destination, unknownPlace);
            if (unknownPlace && destination) {
                // console.log('3 not origin, destination and unknowPlace');
                nextContext.origin = unknownPlace.value;
                nextContext.originMeta = unknownPlaceMeta;
            }
            if (unknownPlace && context.destination && !context.origin) {
                // console.log('4 not origin, unknowPlace and the context has only destination');
                nextContext.origin = unknownPlace.value;
                nextContext.originMeta = unknownPlaceMeta;
            }
        }
        if (destination) {
            // console.log('5 destination', destination);
            nextContext.destination = destination.value;
            nextContext.destinationMeta = getEntityMeta(destination);
        } else {
            // console.log('6 not destination, unknowPlace and the context has only destination');
            if (
                (unknownPlace && !context.destination && context.origin) ||
                (unknownPlace && !context.destination && !context.origin && !origin)
            ) {
                // console.log('7 not dest, unknowPlace and the context has nothing or only origin');
                nextContext.destination = unknownPlace.value;
                nextContext.destinationMeta = unknownPlaceMeta;
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
