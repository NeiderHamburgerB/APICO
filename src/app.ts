import './config/env/env.config';
import express, { Router } from 'express';
import Server from './server/server';

const routes: Router = express.Router();
routes.get('/', (req, res) => res.send('ok'));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = new Server({
  port,
  routes,
  publicPath: 'public'
});

server.start();
