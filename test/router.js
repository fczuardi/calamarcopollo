import test from 'ava';
import { version } from '../package.json';
import { replies } from '../replies';
import router from '../src/router';
import { createStore } from '../src/store';
import {
    startCommand,
    versionCommand,
    helpCommand,
    restartCommand,
    greeting,
    greetingWithUsername,
    goodbye
} from './helpers/releases/0.3.0';

const store = createStore();

// # Commands
test('/version command', t => {
    t.is(
        router({ entities: { command: [{ value: 'version' }] } }),
        replies.version(version)
    );
});
test('/version command with wit', versionCommand);

test('/start command', t => {
    t.is(
        router({ entities: { command: [{ value: 'start' }] } }),
        replies.start
    );
});
test('/start command with wit', startCommand);

test('/help command', t => {
    t.is(
        router({ entities: { command: [{ value: 'help' }] } }),
        replies.help
    );
});
test('/help command with wit', helpCommand);

test('/restart command', t => {
    const currentState = store.getState();
    const chatDate = Date.now() / 1000;
    const nextState = {
        ...currentState,
        chats: [
            { id: 12345, session: {}, date: chatDate * 1000 },
            ...currentState.chats
        ]
    };
    t.is(
        router(
            { entities: { command: [{ value: 'restart' }] } },
            {
                store,
                chat: { id: 12345 },
                date: chatDate
            }
        ),
        replies.restart
    );
    t.deepEqual(store.getState(), nextState);
});
test('/restart command with wit', restartCommand);

//
// -----
//
// # Interactions
test('interaction close', t => {
    t.is(
        router({ entities: { interaction: [{ value: 'close' }] } }),
        replies.close
    );
});
test('interaction close with wit', goodbye);

test('interaction greeting', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }), replies.greeting.noUsername);
});
test('interaction greeting with wit', greeting);

test('interaction greeting + username', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }, {
        from: { username: 'George' }
    }), replies.greeting.username('George'));
});
test('interaction greeting + username with wit', greetingWithUsername);
