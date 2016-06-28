import { createRouter } from 'calamars';
import commandRoutes from './routes/commands';
import interactionRoutes from './routes/interactions';
import faqRoutes from './routes/faq';
import tripRoutes from './routes/trips';
import insultRoutes from './routes/insult';

const routes = [
    ...faqRoutes,
    ...tripRoutes,
    ...commandRoutes,
    ...interactionRoutes,
    ...insultRoutes
];

const customRoutesPath = process.env.CUSTOM_ROUTES_PATH || './routes/custom';

const customRoutes = require(customRoutesPath);

const finalRoutes = [
    ...routes.slice(0, customRoutes.priority),
    ...customRoutes.routes,
    ...routes.slice(customRoutes.priority)
];

const router = createRouter(finalRoutes);

export default router;
export {
    routes
};
