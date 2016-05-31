import { WitDriver } from 'calamars';
import { polloSanitize } from '../../../../src/stringHelpers';
const { getEntity, getEntities, getEntityValue, getEntityMeta } = WitDriver;
import { tripsTerminalNames } from './statements';

const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

const wit = new WitDriver(options);

const getOutcome = async q => {
    const witResult = await wit.query(polloSanitize(q));
    return witResult.outcomes[0];
};

const tripIntentDestination = async t => {
    const expressions = tripsTerminalNames.infoDest;
    const outcomes = await Promise.all(expressions.map(
        expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        const destination = getEntity(outcome, 'destination');
        const destinationMeta = getEntityMeta(destination);
        // console.log('destinationMeta', destinationMeta);
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(destination, message);
        t.truthy(destinationMeta, message);
        t.falsy(getEntityValue(outcome, 'origin'), message);
        t.falsy(getEntityValue(outcome, 'places'), message);
    });
};

const tripIntentOrigin = async t => {
    const expressions = tripsTerminalNames.infoOrigin;
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        const origin = getEntity(outcome, 'origin');
        const originMeta = getEntityMeta(origin);
        // console.log('originMeta', originMeta);
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(origin, message);
        t.truthy(originMeta, message);
        t.falsy(getEntityValue(outcome, 'destination'), message);
        t.falsy(getEntityValue(outcome, 'places'), message);
    });
};

const tripOriginDestination = async t => {
    const expressions = tripsTerminalNames.infoOriginDest;
    const outcomes = await Promise.all(expressions.map(
            expression => getOutcome(expression)
    ));
    return outcomes.forEach((outcome, i) => {
        const message = `Expression: ${expressions[i]}`;
        const origins = getEntities(outcome, 'origin');
        const destination = getEntity(outcome, 'destination');
        const place = getEntity(outcome, 'places');
        const otherPlace = destination || place || origins[1];
        t.is(getEntityValue(outcome, 'trip'), 'info', message);
        t.truthy(origins[0], message);
        t.truthy(otherPlace, message);
        // console.log(message);
        // console.log('Metas', getEntityMeta(origins[0]), getEntityMeta(otherPlace));
        t.truthy(getEntityMeta(origins[0]), message);
        t.truthy(getEntityMeta(otherPlace), message);
    });
};

export {
    tripIntentDestination,
    tripIntentOrigin,
    tripOriginDestination
};
