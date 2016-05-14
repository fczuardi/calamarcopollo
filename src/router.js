import { createRouter } from 'calamars';
import commandRoutes from './routes/commands';
import interactionRoutes from './routes/interactions';
import tripRoutes from './routes/trips';
import insultRoutes from './routes/insult';

const routes = [
    ...commandRoutes,
    ...interactionRoutes,
    ...tripRoutes,
    ...insultRoutes
];

const router = createRouter(routes);
export default router;
