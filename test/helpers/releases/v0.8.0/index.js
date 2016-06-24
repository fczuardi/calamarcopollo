import { WitDriver } from 'calamars';
import { polloSanitize } from '../../../../src/stringHelpers';
import router, { routes } from '../../../../src/router';
import { replies } from '../../../../replies';
import { interaction } from './statements';

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

export {
    callbackRoutes,
    interactionLaugh,
    interactionLaughWit,
    interactionComplimentWit,
    interactionNameOriginWit,
    interactionHowAreYouWit
};
