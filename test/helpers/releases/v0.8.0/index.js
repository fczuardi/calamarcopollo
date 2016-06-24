import { WitDriver } from 'calamars';
import { polloSanitize } from '../../../../src/stringHelpers';
import router, { routes } from '../../../../src/router';
import { replies } from '../../../../replies';
import { interaction, bugs } from './statements';
import { createStore } from '../../../../src/store';

const store = createStore();


const { getEntity, getEntityMeta } = WitDriver;

const callbackRoutes = t => {
    const notFunctions = routes.filter(r => typeof r[1] !== 'function');
    t.is(notFunctions.length, 0);
};

const interactionLaugh = t => {
    t.is(router({
        entities: { interaction: [{ value: 'laugh' }] }
    }), replies.laugh());
    t.pass();
};

const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

const wit = new WitDriver(options);

const getOutcome = async q => {
    const witResult = await wit.query(polloSanitize(q));
    return witResult.outcomes[0];
};

const interactionLaughWit = async t => {
    const expressions = interaction.laugh;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.laugh(),
        `Expression: ${expressions[i]}`
    ));
};

const interactionComplimentWit = async t => {
    const expressions = interaction.compliment;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.compliment(),
        `Expression: ${expressions[i]}`
    ));
};

const interactionNameOriginWit = async t => {
    const expressions = interaction.nameOrigin;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.nameOrigin(),
        `Expression: ${expressions[i]}`
    ));
};

const interactionHowAreYouWit = async t => {
    const expressions = interaction.howAreYou;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.howAreYou(),
        `Expression: ${expressions[i]}`
    ));
};

const knowCitiesWithSlug = async t => {
    const expressions = bugs.shouldHaveMeta;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach(outcome => {
        const origin = getEntity(outcome, 'origin');
        const originMeta = getEntityMeta(origin);
        const destination = getEntity(outcome, 'destination');
        const destinationMeta = getEntityMeta(destination);
        const place = getEntity(outcome, 'places');
        const placeMeta = getEntityMeta(place);
        const cityMeta = originMeta || destinationMeta || placeMeta;
        return t.truthy(cityMeta, JSON.stringify(outcome));
    });
};

const keepTimeFilterInContext = async t => {
    const chatDate = Date.now();
    const chatId = 12345080;
    const context0 = {
        id: chatId,
        session: {},
        date: chatDate
    };
    const outcome1 = await getOutcome('de sanca para sampa amanhã');
    const outcome2 = await getOutcome('e para bauru?');
    const reply1 = router(outcome1, { store, chat: context0 });
    const context1 = store.getState().chats.find(chat => chat.id === chatId);
    t.truthy(reply1.url);
    t.truthy(context1.session.timeFilter.from.value);
    const reply2 = router(outcome2, { store, chat: context1 });
    const context2 = store.getState().chats.find(chat => chat.id === chatId);
    t.truthy(reply2.url);
    t.truthy(context2.session.timeFilter.from.value);
    t.not(reply1, reply2);
    t.is(context1.session.timeFilter.from.value, context2.session.timeFilter.from.value);
};

export {
    callbackRoutes,
    interactionLaugh,
    interactionLaughWit,
    interactionComplimentWit,
    interactionNameOriginWit,
    interactionHowAreYouWit,
    knowCitiesWithSlug,
    keepTimeFilterInContext
};
