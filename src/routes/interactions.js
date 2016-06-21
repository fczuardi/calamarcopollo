import { replies } from '../../replies';
import { WitDriver } from 'calamars';
const { getEntityValue } = WitDriver;
const routes = [[
    outcomes => getEntityValue(outcomes, 'interaction') === 'close',
    replies.close()
], [
    outcomes => getEntityValue(outcomes, 'interaction') === 'greeting',
    (outcomes, { from } = { from: null }) => (from && (from.first_name || from.username)
        ? replies.greeting.username(from.first_name || from.username)
        : replies.greeting.noUsername()
    )
]];
export default routes;
