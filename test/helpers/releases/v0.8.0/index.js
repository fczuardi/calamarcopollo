import { routes } from '../../../../src/router';

const callbackRoutes = t => {
    const notFunctions = routes.filter(r => typeof r[1] !== 'function');
    t.is(notFunctions.length, 0);
};

export {
    callbackRoutes
};
