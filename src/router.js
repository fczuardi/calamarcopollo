import { createRouter } from 'calamars';
import commandRoutes from './routes/commands';
import interactionRoutes from './routes/interactions';
import tripRoutes from './routes/trips';

const routes = [
    ...commandRoutes,
    ...interactionRoutes,
    ...tripRoutes
];

const router = createRouter(routes);
export default router;
