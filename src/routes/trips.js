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
        const place = unknownPlace || origin || destination;
        const placeMeta = getEntityMeta(place);
        let nextContext = Object.assign({}, context);
        if (timeFilter) {
            nextContext.timeFilter = timeFilter;
        }
        if (destination) {
            nextContext.destination = destination.value;
            nextContext.destinationMeta = getEntityMeta(destination);
        }
        if (origin) {
            nextContext.origin = origin.value;
            nextContext.originMeta = getEntityMeta(origin);
        }
        if (unknownPlace && destination) {
            console.log('[issue #24] has places with no role and destination');
            nextContext.origin = unknownPlace.value;
            nextContext.originMeta = getEntityMeta(unknownPlace);
        }
        if (nextContext.destination && !nextContext.origin && place) {
            nextContext.origin = place.value;
            nextContext.originMeta = placeMeta;
        }
        if (!nextContext.destination) {
            nextContext.destination = place.value;
            nextContext.destinationMeta = placeMeta;
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
