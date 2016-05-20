import { WitDriver } from 'calamars';
import { polloSanitize } from '../../../../src/stringHelpers';
const { getEntity, getEntities, getEntityValue } = WitDriver;
import router from '../../../../src/router';
import { replies } from '../../../../replies';
import { version } from '../../../../package.json';
import { createStore } from '../../../../src/store';
import { cmd, interaction, trips } from './statements';

const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

const wit = new WitDriver(options);
const store = createStore();

const getOutcome = async q => {
    const witResult = await wit.query(polloSanitize(q));
    return witResult.outcomes[0];
};

// # Commands

const startCommand = async t => {
    const expressions = cmd.start;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.start, `Expression: ${expressions[i]}`
    ));
};

const versionCommand = async t => {
    const expressions = cmd.version;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.version(version), `Expression: ${expressions[i]}`
    ));
};

const helpCommand = async t => {
    const expressions = cmd.help;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.help, `Expression: ${expressions[i]}`
    ));
};

const restartCommand = async t => {
    const expressions = cmd.restart;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome, { store }), replies.restart, `Expression: ${expressions[i]}`
    ));
};

// # Interactions

const greeting = async t => {
    const expressions = interaction.greeting;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.greeting.noUsername,
        `Expression: ${expressions[i]}`
    ));
};

const greetingWithUsername = async t => {
    const expressions = interaction.greeting;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    const from = { username: 'George' };
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome, { from }), replies.greeting.username(from.username),
        `Expression: ${expressions[i]}`
    ));
};

const goodbye = async t => {
    const expressions = interaction.close;
    const outcomes = await Promise.all(expressions.map(s => getOutcome(s)));
    return outcomes.forEach((outcome, i) => t.is(
        router(outcome), replies.close,
        `Expression: ${expressions[i]}`
    ));
};

// # Trips

const tripIntent = async t => {
    const expressions = trips.info;
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.map((outcome, i) => t.is(
        getEntityValue(outcome, 'trip'), 'info', `Expression: ${expressions[i]}`
    ));
};

const tripIntentDestination = async t => {
    const expressions = trips.infoDest;
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
    const expressions = trips.infoOrigin;
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
    const expressions = trips.infoOriginDest;
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

const tripOriginDestinationDepartureTime = async t => {
    const expressions = trips.infoOriginDestTime;
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        const origins = getEntities(outcome, 'origin');
        const destination = getEntityValue(outcome, 'destination');
        const place = getEntityValue(outcome, 'places');
        const dateTime = getEntity(outcome, 'datetime');
        const timeFilter = dateTime ? {
            from: !dateTime.from ? dateTime : dateTime.from,
            to: dateTime.to ? dateTime.to : null
        } : null;
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(timeFilter, `timeFilter ${message}`);
        t.truthy(origins[0], `origin ${message}`);
        t.truthy(destination || place || origins[1]
        , `destination ${message}`);
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
    tripOriginDestination,
    tripOriginDestinationDepartureTime
};
