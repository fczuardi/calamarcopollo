import { writeFileSync } from 'fs';
import { join as pathJoin } from 'path';
import bot from './tgBot';
import wit from './wit';
import { createStore } from './store';
import { updateExpression, updateOutcome } from './actionCreators';

const store = createStore();

bot.getMe()
    .then(data => console.log(data))
    .catch(err => console.error(err))
;

bot.on('update', update => {
    const { message } = update;
    // const { date, text, chat, from } = message;
    const { text } = message;
    if (!text) {
        console.log(`Update: ${JSON.stringify(update, ' ', 2)}`);
        return null;
    }
    console.log(`Message: ${text}`);
    store.dispatch(updateExpression({ text }));
    // const chatId = chat.id;
    // const authorId = from.id;
    return wit.query(text, true).then(result => {
        const outcome = result.outcomes[0]
            ? { text: result._text, entities: result.outcomes[0].entities }
            : {};
        console.log(JSON.stringify(outcome));
        store.dispatch(updateOutcome(outcome));
    }).catch(err => console.error(err));
});

process.on('SIGINT', () => {
    console.log('Got SIGINT. Saving state to disk.');
    if (process.env.STATE_FILE) {
        writeFileSync(
            pathJoin(__dirname, process.env.STATE_FILE),
            JSON.stringify(store.getState(), ' ', 2),
            'utf8'
        );
        process.exit();
    }
});
