import { version } from '../package.json';
import { createRouter } from 'calamars';
import { replies } from '../replies';

const getCommandName = outcomes => {
    try{
        return outcomes.entities.command[0].value
    } catch (e) {
        return null;
    }
};

const routes = [[
    outcomes => getCommandName(outcomes) === 'version',
    replies.version(version)
],[
    outcomes => getCommandName(outcomes) === 'start',
    replies.start
],[
    outcomes => getCommandName(outcomes) === 'restart',
    replies.restart
],[
    outcomes => getCommandName(outcomes) === 'help',
    replies.help
]];

const router = createRouter(routes);
export default router;
