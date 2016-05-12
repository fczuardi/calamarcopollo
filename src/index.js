import fs from 'fs';
import path from 'path';
import bot from './tgBot';
import wit from './wit';
import { createStore } from './store';
import { addExpression, addOutcome } from './actionCreators';

const store = createStore();

bot.getMe()
    .then(data => console.log(data))
    .catch(err => console.error(err))
;

bot.on('update', update => {
    const { message } = update;
    const { date, text, chat, from } = message;
    const chatId = chat.id;
    const authorId = from.id;
    const addExpressionAction = addExpression({ date, text, authorId, chatId });
    store.dispatch(addExpressionAction);
    if (text) {
        console.log(`Message: ${text}`);
        wit.query(text, true)
            .then(result => {
                const outcome = result.outcomes[0] ? {
                    text: result._text,
                    entities: result.outcomes[0].entities
                } : {};
                console.log(outcome);
                const addOutcomeAction = addOutcome(outcome);
                store.dispatch(addOutcomeAction);
            })
            .catch(err => console.error(err))
        ;
    } else {
        console.log(`Update: ${JSON.stringify(update, ' ', 2)}`);
    }
});

process.on('SIGINT', () => {
    console.log('Got SIGINT. Saving state to disk.');
    if (process.env.STATE_FILE) {
        fs.writeFileSync(
            path.join(__dirname, process.env.STATE_FILE),
            JSON.stringify(store.getState(), ' ', 2),
            'utf8'
        );
        process.exit();
    }
});
