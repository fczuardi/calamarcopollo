const Telegram = require('telegram-bot-api');

const options = {
    token: process.env.TELEGRAM_TOKEN,
    updates: { enabled: true }
};

const tg = new Telegram(options);

module.exports = tg;
