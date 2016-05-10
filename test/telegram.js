import test from 'ava';
const Telegram = require('telegram-bot-api');

const options = {
    token: process.env.TELEGRAM_TOKEN,
    updates: { enabled: true }
};

test('Telegram bot is created sucessfuly', t => {
    const tg = new Telegram(options);
    return tg.getMe()
        .then(data => {
            t.truthy(data.id);
            t.truthy(data.username);
            t.truthy(data.first_name);
        })
        .catch(err => console.log(err))
    ;
});
