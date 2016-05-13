import { updateChatSession } from '../actionCreators';
import { tripDialogReply } from '../tripDialog';
import { WitDriver } from 'calamars';
const { getEntity, getEntityValue, getEntityMeta } = WitDriver;

const routes = [[
    outcomes => getEntityValue(outcomes, 'trip') === 'info',
    (outcomes, { store, chat }) => {
        const context = chat.session;
        const origin = getEntity(outcomes, 'origin');
        const destination = getEntity(outcomes, 'destination');
        let nextContext = Object.assign({}, context);
        console.log('tripInfo intent', context);
        if (destination) {
            nextContext.destination = destination.value;
        }
        if (origin) {
            nextContext.origin = origin.value;
        }
        console.log(getEntityMeta(destination));
        console.log('nextContext: ', nextContext);
        store.dispatch(updateChatSession({
            chat: { ...chat, session: nextContext }
        }));
        // TODO api call if the required parameters are on the context
        return tripDialogReply(nextContext);
    }
], [
    outcomes => (getEntityValue(outcomes, 'trip') !== 'info' && (
        getEntityValue(outcomes, 'places') ||
        getEntityValue(outcomes, 'origin') ||
        getEntityValue(outcomes, 'destination'
    ))),
    (outcomes, { store, chat }) => {
        const context = chat.session;
        const place = getEntity(outcomes, 'places') ||
                        getEntity(outcomes, 'origin') ||
                        getEntity(outcomes, 'destination');
        let nextContext = Object.assign({}, context);
        if (
            (nextContext.destination && !nextContext.origin) ||
            (!nextContext.destination && !nextContext.origin)
        ) {
            console.log('Por que??', nextContext.destination, nextContext.origin);
            nextContext.origin = place.value;
        } else if (!nextContext.destination && nextContext.origin) {
            nextContext.destination = place.value;
        }
        console.log('nextContext: ', nextContext);
        store.dispatch(updateChatSession({
            chat: { ...chat, session: nextContext }
        }));
        // TODO api call if the required parameters are on the context
        return tripDialogReply(nextContext);
    }
]];
export default routes;
