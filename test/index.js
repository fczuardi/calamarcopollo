import test from 'ava';

import { setupUpdateListener } from '../src';


test('Check if a googleURL shortener error breaks the bot', t => {
    const googleUrl = {
        shorten: (url, cb) => {
            const err = new Error('an error');
            cb(err, null);
        }
    };
    const updateListenerConfig = {
        googleUrl
    };
    const updateHandler = setupUpdateListener(updateListenerConfig);
    const dummyBot = {
        getUserInfo: () => null,
        sendMessage: msg => {
            console.log('msg: ', JSON.stringify(msg));
            return new Promise(resolve => resolve());
        }
    };
    const update = {
        sender: {
            id: '12345678'
        },
        recipient: {
            id: '87654321'
        },
        timestamp: new Date().getTime(),
        message: {
            is_echo: true,
            app_id: 252494808462690,
            mid: 'mid.1472239049252:8d0797a44bf1140b06',
            seq: 6001,
            text: 'sampa > sanca hoje a tarde'
        }
    };
    return updateHandler({
        bot: dummyBot,
        update
    }).then(() => t.pass());
});
