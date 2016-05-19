import { WitDriver } from 'calamars';
const { getEntity, getEntities, getEntityValue, getEntityMeta } = WitDriver;
import router from '../../../src/router';
import { replies } from '../../../replies';
import { version } from '../../../package.json';
import { createStore } from '../../../src/store';


const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

const wit = new WitDriver(options);
const store = createStore();

const getOutcome = async q => {
    const witResult = await wit.query(q);
    return witResult.outcomes[0];
};

// # Commands

const startCommand = async t => {
    const outcome = await getOutcome('/start');
    t.is(router(outcome), replies.start);
};

const versionCommand = async t => {
    const outcome = await getOutcome('/version');
    t.is(router(outcome), replies.version(version));
};

const helpCommand = async t => {
    const outcome = await getOutcome('/help');
    t.is(router(outcome), replies.help);
};

const restartCommand = async t => {
    const outcome = await getOutcome('/restart');
    t.is(router(outcome, { store }), replies.restart);
};

// # Interactions

const greeting = async t => {
    const outcome1 = await getOutcome('Olá');
    const outcome2 = await getOutcome('Oi');
    const outcome3 = await getOutcome('Bom dia bot');
    t.is(router(outcome1), replies.greeting.noUsername);
    t.is(router(outcome2), replies.greeting.noUsername);
    t.is(router(outcome3), replies.greeting.noUsername);
};

const greetingWithUsername = async t => {
    const outcome = await getOutcome('Oi');
    const from = { username: 'George' };
    t.is(router(outcome, { from }), replies.greeting.username(from.username));
};

const goodbye = async t => {
    const outcome1 = await getOutcome('Obrigado.');
    const outcome2 = await getOutcome('Tchau.');
    const outcome3 = await getOutcome('Valeu bot!');
    t.is(router(outcome1), replies.close);
    t.is(router(outcome2), replies.close);
    t.is(router(outcome3), replies.close);
};

// # Trips

const tripIntent = async t => {
    const expressions = [
        'Horários de ônibus',
        'Passagem',
        'Preciso viajar',
        'Quero viajar.',
        'Viagem',
        'Você sabe horarios de ônibus?'
    ];
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.map((outcome, i) => t.is(
        getEntityValue(outcome, 'trip'), 'info', `Expression: ${expressions[i]}`
    ));
};

const tripIntentDestination = async t => {
    const expressions = [
        'bora pro rio',
        'Horários de ônibus para ubatuba',
        'para jahu',
        'Partiu sampa?',
        'Passagem pra Atiabia tem?',
        'Preciso viajar com destino a marília, sp',
        'Quero viajar para santos.',
        'vamos para guarulhos'
    ];
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(getEntityValue(outcome, 'destination'), message);
        t.falsy(getEntityValue(outcome, 'origin'), message);
        t.falsy(getEntityValue(outcome, 'places'), message);
    });
};

const tripIntentOrigin = async t => {
    const expressions = [
        'de osasco',
        'Estou em Itatiba, quero uma passagem',
        'Horários de ônibus a partir de são carlos',
        'Origem sampa',
        'partindo de ribeirao preto, o que tem?',
        'passagens do rio',
        'Preciso viajar saindo de rio de janeiro, rj',
        'Quero viajar saindo de santos.'
    ];
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(getEntityValue(outcome, 'origin'), message);
        t.falsy(getEntityValue(outcome, 'destination'), message);
        t.falsy(getEntityValue(outcome, 'places'), message);
    });
};

const tripOriginDestination = async t => {
    const expressions = [
        'bora para santos saindo de são paulo?',
        'from campinas to rio de janeiro',
        'from campinas to rio de janeiro, rj',
        'horários de São Paulo para Rio de Janeiro',
        'passagem de Santos, SP para Rio de Janeiro, RJ',
        'quais opções tenho eu para ir de brasilha à guarulos?',
        'quero ribeirao, sanca',
        'sampa > santos'
    ];
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        const origins = getEntities(outcome, 'origin');
        const destination = getEntityValue(outcome, 'destination');
        const place = getEntityValue(outcome, 'places');
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(origins[0], message);
        t.truthy(destination || place || origins[1]
        , message);
    });
};

const routerPlaceWithNoRoleNoTripInfo = async t => {
    const outcome = { entities: {
        places: [{ value: 'Sertãozinho' }]
    } };
    t.is(router(outcome), replies.trip.noOrigin);
};

const routerTripInfoPlaceWithNoRole = async t => {
    const outcome = { entities: {
        trip: [{ value: 'info' }],
        places: [{ value: 'Bauru' }]
    } };
    t.is(router(outcome), replies.trip.noOrigin);
};

const routerTripInfo2PlacesWithNoRole = async t => {
    const outcome = { entities: {
        trip: [{ value: 'info' }],
        places: [
            {
                value: 'Sampa',
                metadata: '{ "slugs": ["sao-paulo-sp-todos"] }'
            }, {
                value: 'Rio',
                metadata: '{ "slugs": ["santos-sp-todos"] }'
            }
        ]
    } };
    t.truthy(router(outcome).url);
};

export {
    startCommand,
    versionCommand,
    helpCommand,
    restartCommand,
    greeting,
    greetingWithUsername,
    goodbye,
    tripIntent,
    tripIntentDestination,
    tripIntentOrigin,
    routerPlaceWithNoRoleNoTripInfo,
    routerTripInfoPlaceWithNoRole,
    routerTripInfo2PlacesWithNoRole,
    tripOriginDestination
};
