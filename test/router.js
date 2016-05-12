import test from 'ava';
import { version } from '../package.json';
import { replies } from '../replies';
import router from '../src/router';
import { createStore } from '../src/store';

const store = createStore();

test('/version command', t => {
    t.is(
        router({ entities: { command: [{ value: 'version' }] } }),
        replies.version(version)
    );
});

test('/start command', t => {
    t.is(
        router({ entities: { command: [{ value: 'start' }] } }),
        replies.start
    );
});

test('/help command', t => {
    t.is(
        router({ entities: { command: [{ value: 'help' }] } }),
        replies.help
    );
});

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
            store, { id: 12345 }
        ),
        replies.restart
    );
    t.deepEqual(store.getState(), nextState);
});
