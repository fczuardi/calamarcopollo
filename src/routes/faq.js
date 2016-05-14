import { replies } from '../../replies';
import { WitDriver } from 'calamars';

const routes = [[
    outcomes => WitDriver.getEntityValue(outcomes, 'faq') !== null,
    outcomes => replies.faq(WitDriver.getEntityValue(outcomes, 'faq'))
]];
export default routes;
