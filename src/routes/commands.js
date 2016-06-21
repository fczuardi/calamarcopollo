import { version } from '../../package.json';
import { replies } from '../../replies';
import { updateChatSession } from '../actionCreators';
import { WitDriver } from 'calamars';
const { getEntityValue } = WitDriver;


const routes = [[
    outcomes => getEntityValue(outcomes, 'command') === 'version',
    (v) => replies.version(v)
], [
    outcomes => getEntityValue(outcomes, 'command') === 'start',
    replies.start()
], [
    outcomes => getEntityValue(outcomes, 'command') === 'help',
    replies.help()
], [
    outcomes => getEntityValue(outcomes, 'command') === 'restart',
    (outcomes, { store, chat, date }) => {
        store.dispatch(updateChatSession({ date, chat: { ...chat, session: {} } }));
        return replies.restart();
    }
]];
export default routes;
