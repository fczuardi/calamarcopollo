import { version } from '../package.json';
import { createRouter } from 'calamars';
import { replies } from '../replies';
import { updateChatSession } from './actionCreators';

const getCommandName = outcomes => {
    try {
        return outcomes.entities.command[0].value;
    } catch (e) {
        return null;
    }
};

const routes = [[
    outcomes => getCommandName(outcomes) === 'version',
    replies.version(version)
], [
    outcomes => getCommandName(outcomes) === 'start',
    replies.start
], [
    outcomes => getCommandName(outcomes) === 'restart',
    (outcomes, store, chat) => {
        console.log('reset chat session', chat);
        store.dispatch(updateChatSession({
            chat: {
                ...chat,
                session: {}
            }
        }));
        return replies.restart;
    }
], [
    outcomes => getCommandName(outcomes) === 'help',
    replies.help
]];

const router = createRouter(routes);
export default router;
