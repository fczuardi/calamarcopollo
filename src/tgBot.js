import Telegram from 'telegram-bot-api';

const options = {
    token: process.env.TELEGRAM_TOKEN,
    updates: { enabled: true }
};

const tg = new Telegram(options);

tg.getMe()
    .then(data => console.log(data))
    .catch(err => console.error(err))
;
module.exports = tg;
