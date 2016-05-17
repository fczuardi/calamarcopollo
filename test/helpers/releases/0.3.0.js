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

export {
    startCommand,
    versionCommand,
    helpCommand,
    restartCommand
};
