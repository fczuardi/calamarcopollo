import { replies } from '../../replies';
import { WitDriver } from 'calamars';

const routes = [[
    outcomes => WitDriver.getEntityValue(outcomes, 'insult') !== undefined,
    replies.insult
]];
export default routes;
