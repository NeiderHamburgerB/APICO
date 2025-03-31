import './config/env/env.config';
import './container';
import express, { Router } from 'express';
import Server from './server/server';
import userRoutes from './interfaces/users/routes/usersRoutes';
import authRoutes from './interfaces/auth/routes/authRoutes';
import { errorHandler } from './server/middlewares/handleError';
import ordersRoutes from './interfaces/orders/routes/ordersRoutes';
import routesRoutes from './interfaces/routes/routes/routesRoutes';

const routes: Router = express.Router();
routes.get('/healthcheck', (req, res) => res.send('ok'));
routes.use('/api/v1/users', userRoutes);
routes.use('/api/v1/auth', authRoutes);
routes.use('/api/v1/orders', ordersRoutes);
routes.use('/api/v1/routes', routesRoutes);
routes.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = new Server({
  port,
  routes,
  publicPath: 'public'
});

server.start();
