import test from 'ava';

const request = require('request-promise');
const fakeClickBus = require('fake-clickbus-api');

const CLICKBUS_URL = process.env.CLICKBUS_URL ||
'https://api-evaluation.clickbus.com.br/api/v1';

test('Clickbus places api returns a json with items.', t => {
    fakeClickBus(CLICKBUS_URL);
    const url = `${CLICKBUS_URL}/places`;
    return request(url).then(body => {
        const result = JSON.parse(body);
        t.truthy(result.items);
    });
});
