import express, { Router } from 'express';
import compression from 'compression';
import Database from '../infrastructure/database';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerOptions } from '../config/docs/swagger.config';
export interface Options {
  port: number;
  routes: Router;
  publicPath?: string;
}

export default class Server {
  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, publicPath = 'public' } = options;
    if (typeof port !== 'number' || port <= 0) {
      throw new Error('El puerto debe ser un número positivo.');
    }
    if (!routes) {
      throw new Error('Debe proveerse un Router de Express.');
    }
    this.port = port;
    this.publicPath = publicPath;
    this.routes = routes;
  }

  async start() {
    // Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());

    // Archivos estáticos
    this.app.use(express.static(this.publicPath));

    // Rutas
    this.app.use(this.routes);

    // Documentación
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

    // Conexión a la base de datos
    try {
      const pool = Database.getInstance().getPool();
      await pool.query('SELECT 1');
      console.log('Base de datos conectada');
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      process.exit(1);
    }

    // Levantar el servidor
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }

  close() {
    this.serverListener && this.serverListener.close();
  }
}
