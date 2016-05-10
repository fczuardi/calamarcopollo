import test from 'ava';
import { WitDriver } from 'calamars';

const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

test('WitDriver instance is created sucessfuly', t => {
    const wit = new WitDriver(options);
    t.is(typeof wit, 'object');
});
