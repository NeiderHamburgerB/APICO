import { Router } from 'express';
import { container } from 'tsyringe';
import { CreateUserController } from '../controllers/createUserController';

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operaciones relacionadas con usuarios
 * 
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       description: Datos necesarios para registrar un usuario
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "neider"
 *               email:
 *                 type: string
 *                 example: "neiderhamburger98@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               roleId:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 4
 *                     name:
 *                       type: string
 *                       example: "neider"
 *                     email:
 *                       type: string
 *                       example: "neiderhamburger98@gmail.com"
 *                     password:
 *                       type: string
 *                       example: "$2b$10$6VuFkfPFAJCW0c6.TsyCWuAXoaiN7kZqVCOOhezPWupBP0RNRK6vu"
 *                     roleId:
 *                       type: number
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T11:11:45.391Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T11:11:45.391Z"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoibmVpZGVyaGFtYnVyZ2VyOThAZ21haWwuY29tIiwiaWF0IjoxNzQzMzA0MzY1LCJleHAiOjE3NDMzMTg3NjV9.ChFRnFM2XLo99HPhFDnzgp-ap5cp60yZiivz-7-wmeY"
 *       400:
 *         description: Error en la validación o datos incorrectos.
 */


const router = Router();

const controller = container.resolve(CreateUserController);

router.post('/register', (req, res, next) => controller.handle(req, res, next));

export default router;
