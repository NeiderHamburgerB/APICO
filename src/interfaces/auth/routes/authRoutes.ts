import { Router } from 'express';
import { container } from 'tsyringe';
import { LoginController } from '../controllers/loginController';

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Operaciones relacionadas con autenticación
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión en la aplicación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: neiderhamburger99@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoibmVpZGVyaGFtYnVyZ2VyOTlAZ21haWwuY29tIiwiaWF0IjoxNzQzMzA0ODQwLCJleHAiOjE3NDMzMTkyNDB9.kk1KsvU4_e6MoIDxXtHZw2yD5CJan682Fe1wLEepggw"
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */

const router = Router();

const controller = container.resolve(LoginController);

router.post('/login', (req, res, next) => controller.handle(req, res, next));

export default router;
