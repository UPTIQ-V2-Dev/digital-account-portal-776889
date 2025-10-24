import config from '../../config/config.ts';
import accountOpeningRoute from './accountOpening.route.ts';
import authRoute from './auth.route.ts';
import docsRoute from './docs.route.ts';
import userRoute from './user.route.ts';
import express from 'express';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute
    },
    {
        path: '/users',
        route: userRoute
    },
    {
        path: '/account-opening',
        route: accountOpeningRoute
    }
];

const devRoutes = [
    // routes available only in development mode
    {
        path: '/docs',
        route: docsRoute
    }
];

defaultRoutes.forEach(route => {
    router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
    devRoutes.forEach(route => {
        router.use(route.path, route.route);
    });
}

export default router;
