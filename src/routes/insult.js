import { replies } from '../../replies';
import { WitDriver } from 'calamars';

const routes = [[
    outcomes => WitDriver.getEntityValue(outcomes, 'insult') !== null,
    (outcomes, { from } = { from: null }) => (replies.insult(from.first_name || from.username)
    )
]];
export default routes;
