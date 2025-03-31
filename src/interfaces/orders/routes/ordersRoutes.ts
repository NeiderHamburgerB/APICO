import { Router } from 'express';
import { container } from 'tsyringe';
import { CreateOrderController } from '../controllers/createOrderController';
import { AuthenticatedRequest, extractUser } from '../../../server/middlewares/extractUser';
import { UpdateOrderStatusController } from '../controllers/updateOrderStatusController';
import { GetOrdersStatusController } from '../controllers/getOrdersStatusController';
import { QueryOrdersController } from '../controllers/queryOrdersController';

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operaciones relacionadas con órdenes de envío
 */

/**
 * @swagger
 * /orders/create:
 *   post:
 *     summary: Crear una nueva orden de envío
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Datos necesarios para crear una orden de envío
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageWeight:
 *                 type: number
 *                 description: Peso del paquete en kilogramos
 *                 example: 5
 *               packageDimensionWidth:
 *                 type: number
 *                 description: Ancho del paquete en centímetros
 *                 example: 20
 *               packageDimensionHeight:
 *                 type: number
 *                 description: Alto del paquete en centímetros
 *                 example: 15
 *               packageDimensionLength:
 *                 type: number
 *                 description: Largo del paquete en centímetros
 *                 example: 30
 *               typeProduct:
 *                 type: string
 *                 description: Tipo de producto
 *                 example: "Electronics"
 *               originCityId:
 *                 type: integer
 *                 description: ID de la ciudad de origen
 *                 example: 3
 *               destinationCityId:
 *                 type: integer
 *                 description: ID de la ciudad de destino
 *                 example: 4
 *               destinationAddress:
 *                 type: string
 *                 description: Dirección completa de destino
 *                 example: "Calle 33 #21b-23 Barranquilla, Colombia"
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /orders/{orderId}/update-status-delivered:
 *   patch:
 *     summary: Actualizar el estado de un pedido a "Entregado"
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a actualizar
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   example: "Entregado"
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /orders/{code}/getOrdersStatus:
 *   get:
 *     summary: Obtener el estado de un pedido por su código
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del pedido
 *     responses:
 *       200:
 *         description: Estado actual del pedido
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "En transito"
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /orders/query:
 *   get:
 *     summary: Consultar pedidos con filtros avanzados
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar pedidos entregados a partir de esta fecha
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar pedidos entregados hasta esta fecha
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [En espera, En transito, Entregado]
 *         description: Filtrar pedidos por su estado
 *       - in: query
 *         name: assignedCarrierId
 *         schema:
 *           type: integer
 *         description: Filtrar pedidos por el ID del transportista asignado
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filtrar pedidos por su código único
 *     responses:
 *       200:
 *         description: Pedidos consultados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: No autorizado para consultar pedidos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 4
 *         code:
 *           type: string
 *           example: "APICOS-ZgZxFt"
 *         userId:
 *           type: integer
 *           example: 5
 *         packageWeight:
 *           type: number
 *           example: 5
 *         packageDimensionWidth:
 *           type: number
 *           example: 20
 *         packageDimensionHeight:
 *           type: number
 *           example: 15
 *         packageDimensionLength:
 *           type: number
 *           example: 30
 *         typeProduct:
 *           type: string
 *           example: "Electronics"
 *         originCityId:
 *           type: integer
 *           example: 2
 *         destinationCityId:
 *           type: integer
 *           example: 1
 *         destinationAddress:
 *           type: string
 *           example: "Calle 33#21b-23"
 *         status:
 *           type: string
 *           example: "En espera"
 *         routeId:
 *           type: integer
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-31T17:35:40.086Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-31T17:35:40.086Z"
 */



const router = Router();

router.post('/create', extractUser, (req: AuthenticatedRequest, res, next) => {
    const controller = container.resolve(CreateOrderController);
    if (req.user && !req.body.userId) {
        req.body.userId = req.user.userId;
    }
    controller.handle(req, res, next);
});

router.patch('/:orderId/update-status-delivered', extractUser, (req: AuthenticatedRequest, res, next) => {
    const controller = container.resolve(UpdateOrderStatusController);
    controller.handle(req, res, next);
});

router.get('/:code/getOrdersStatus', extractUser, (req: AuthenticatedRequest, res, next) => {
    const controller = container.resolve(GetOrdersStatusController);
    controller.handle(req, res, next);
});


router.get('/query', extractUser, (req: AuthenticatedRequest, res, next) => {
    if (req.user && !req.body.userId) {
        if(req.user.roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized, you do not have permission to query orders' });
        }
        req.body.userId = req.user.userId;
    }
    const controller = container.resolve(QueryOrdersController);
    controller.handle(req, res, next);
});

export default router;
