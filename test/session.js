import test from 'ava';
import { calamarMessageFormat } from 'calamars';
import { createStore } from '../src/store';
import { polloSanitize } from '../src/stringHelpers';
import router from '../src/router';
import wit from '../src/wit';

const store = createStore();

const getOutcome = async q => {
    const witResult = await wit.query(polloSanitize(q));
    return witResult.outcomes[0];
};

test('each user has its own session', async t => {
    const textA = 'Quero viajar para sao paulo';
    const textB = 'Estou em bauru';
    const outcomeA = await getOutcome(textA);
    const outcomeB = await getOutcome(textB);
    const senderIdA = 'A1234567';
    const senderIdB = 'B1234567';
    const botId = 'C1234567';
    const facebookUpdateA = {
        sender: { id: senderIdA },
        recipient: { id: botId },
        timestamp: Date.now(),
        message: { text: textA }
    };
    const facebookUpdateB = {
        sender: { id: senderIdB },
        recipient: { id: botId },
        timestamp: Date.now(),
        message: { text: textB }
    };
    const messageA = calamarMessageFormat(facebookUpdateA);
    const messageB = calamarMessageFormat(facebookUpdateB);
    const chatA = { id: messageA.chatId };
    const chatB = { id: messageB.chatId };
    const replyA = router(outcomeA, { store, chat: chatA, date: messageA.timestamp });
    const replyB = router(outcomeB, { store, chat: chatB, date: messageB.timestamp });

    t.not(replyA, replyB);

    const storeState = store.getState();
    const sessionA = storeState.chats.find(item => item.id === messageA.chatId).session;
    const sessionB = storeState.chats.find(item => item.id === messageB.chatId).session;

    t.is(sessionA.origin, undefined);
    t.truthy(sessionA.destination);

    t.truthy(sessionB.origin);
    t.is(sessionB.destination, undefined);
});
