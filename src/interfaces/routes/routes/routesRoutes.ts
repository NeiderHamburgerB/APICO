import { Router } from 'express';
import { container } from 'tsyringe';
import { AssignRouteController } from '../controllers/assignRouteController';
import { AssignCarrierController } from '../controllers/assignCarrierController';
import { AuthenticatedRequest, extractUser } from '../../../server/middlewares/extractUser';

const assignRouteController = container.resolve(AssignRouteController);
const assignCarrierController = container.resolve(AssignCarrierController);
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Gestión de asignaciones de rutas y carriers
 */

/**
 * @swagger
 * /{routeId}/assign:
 *   patch:
 *     summary: Asignar una orden a una ruta específica
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ruta a la que se quiere asignar la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Orden asignada exitosamente a la ruta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 originCityId:
 *                   type: integer
 *                 destinationCityId:
 *                   type: integer
 *                 vehicleId:
 *                   type: integer
 *                 assignedCarrierId:
 *                   type: integer
 *                   nullable: true
 *                 assignedOrders:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 estimatedGeneralFinish:
 *                   type: string
 *                   format: date-time
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *       400:
 *         description: Orden ya asignada o error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order is already assigned to a route
 */

/**
 * @swagger
 * /{routeId}/assign/carrier:
 *   patch:
 *     summary: Asignar un carrier (transportista) a una ruta específica
 *     tags: [Routes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ruta a la que se quiere asignar el carrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carrierId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Carrier asignado exitosamente a la ruta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 originCityId:
 *                   type: integer
 *                 destinationCityId:
 *                   type: integer
 *                 vehicleId:
 *                   type: integer
 *                 assignedCarrierId:
 *                   type: integer
 *                 assignedOrders:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 estimatedGeneralFinish:
 *                   type: string
 *                   format: date-time
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Carrier no disponible o error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Carrier is not available
 */


router.patch('/:routeId/assign', extractUser, (req: AuthenticatedRequest, res, next) => {
    if (req.user && !req.body.userId) {
        if(req.user.roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized, you do not have permission to assign routes' });
        }
        req.body.userId = req.user.userId;
    }
    assignRouteController.handle(req, res, next);
});

router.patch('/:routeId/assign/carrier', extractUser, (req: AuthenticatedRequest, res, next) => {
    if (req.user && !req.body.userId) {
        if(req.user.roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized, you do not have permission to assign carriers' });
        }
        req.body.userId = req.user.userId;
    }
    assignCarrierController.handle(req, res, next);
});

export default router;
