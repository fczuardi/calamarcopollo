import { WitDriver } from 'calamars';
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
    t.is(router(outcome, { from: from }), replies.greeting.username(from.username));
};

const goodbye = async t => {
    const outcome1 = await getOutcome('Obrigado.');
    const outcome2 = await getOutcome('Tchau.');
    const outcome3 = await getOutcome('Valeu bot!');
    t.is(router(outcome1), replies.close);
    t.is(router(outcome2), replies.close);
    t.is(router(outcome3), replies.close);
};

export {
    startCommand,
    versionCommand,
    helpCommand,
    restartCommand,
    greeting,
    greetingWithUsername,
    goodbye
};
