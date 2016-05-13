import test from 'ava';
import { version } from '../package.json';
import { replies } from '../replies';
import router from '../src/router';
import { createStore } from '../src/store';

const store = createStore();

// # Commands
test('/version command', t => {
    t.is(
        router({ entities: { command: [{ value: 'version' }] } }),
        replies.version(version)
    );
});
test.todo('/version command with wit');

test('/start command', t => {
    t.is(
        router({ entities: { command: [{ value: 'start' }] } }),
        replies.start
    );
});
test.todo('/start command with wit');

test('/help command', t => {
    t.is(
        router({ entities: { command: [{ value: 'help' }] } }),
        replies.help
    );
});
test.todo('/help command with wit');

test('/restart command', t => {
    const currentState = store.getState();
    const nextState = {
        ...currentState,
        chats: [
            { id: 12345, session: {} },
            ...currentState.chats
        ]
    };
    t.is(
        router(
            { entities: { command: [{ value: 'restart' }] } },
            {
                store,
                chat: { id: 12345 }
            }
        ),
        replies.restart
    );
    t.deepEqual(store.getState(), nextState);
});
test.todo('/restart command with wit');

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
test.todo('interaction close with wit');

test('interaction greeting', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }), replies.greeting.noUsername);
});
test.todo('interaction greeting with wit');

test('interaction greeting with username', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }, {
        from: { username: 'George' }
    }), replies.greeting.username('George'));
});
test.todo('interaction greeting and username with wit');
