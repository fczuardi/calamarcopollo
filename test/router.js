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
    goodbye,
    routerPlaceWithNoRoleNoTripInfo,
    routerTripInfoPlaceWithNoRole,
    routerTripInfo2PlacesWithNoRole
} from './helpers/releases/v0.3.0';

import {
    callbackRoutes
} from './helpers/releases/v0.8.0';

const store = createStore();

// # Commands
test('/version command', t => {
    t.is(
        router({ entities: { command: [{ value: 'version' }] } }),
        replies.version(version)
    );
});
test('[0.3.0] /version command with wit', versionCommand);

test('/start command', t => {
    t.is(
        router({ entities: { command: [{ value: 'start' }] } }),
        replies.start()
    );
});
test('[0.3.0] /start command with wit', startCommand);

test('/help command', t => {
    t.is(
        router({ entities: { command: [{ value: 'help' }] } }),
        replies.help()
    );
});
test('[0.3.0] /help command with wit', helpCommand);

test('/restart command', t => {
    const currentState = store.getState();
    const chatDate = Date.now();
    const nextState = {
        ...currentState,
        chats: [
            { id: 12345, session: {}, date: chatDate },
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
        replies.restart()
    );
    t.deepEqual(store.getState(), nextState);
});
test('[0.3.0] /restart command with wit', restartCommand);

//
// -----
//
// # Interactions
test('interaction close', t => {
    t.is(
        router({ entities: { interaction: [{ value: 'close' }] } }),
        replies.close()
    );
});
test('[0.3.0] interaction close with wit', goodbye);

test('interaction greeting', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }), replies.greeting.noUsername());
});
test('[0.3.0] interaction greeting with wit', greeting);

test('interaction greeting + username', t => {
    t.is(router({
        entities: { interaction: [{ value: 'greeting' }] }
    }, {
        from: { username: 'George' }
    }), replies.greeting.username('George'));
});
test('[0.3.0] interaction greeting + username with wit', greetingWithUsername);

//
// -----
//
// # Trips
test(
    '[0.3.0] Expressions without trip info intent and PLACES with no role',
    routerPlaceWithNoRoleNoTripInfo
);

test(
    '[0.3.0] Expressions with TRIP INFO intent and PLACES with no role',
    routerTripInfoPlaceWithNoRole
);

test(
    '[0.3.0] Expressions with TRIP INFO intent and PLACES with no role',
    routerTripInfo2PlacesWithNoRole
);

test('[0.8.0] all routes have callback functions and not values',
    callbackRoutes
);
