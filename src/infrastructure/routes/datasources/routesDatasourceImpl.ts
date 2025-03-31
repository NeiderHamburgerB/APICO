import { RoutesEntity } from '../../../domain/routes/entities/routes.entity';
import { RoutesRepository } from '../../../domain/routes/repositories/routes.repository';
import { injectable } from 'tsyringe';
import Database from '../../database';
import { canVehicleCarryOrder } from '../../../shared/utils/vehicleValidator';
import { ApiError } from '../../../shared/errors/apiError';
import { AssignRouteDto } from '../../../domain/routes/dtos/AssignRouteDto';
import { AssignCarrierDto } from '../../../domain/routes/dtos/AssignCarrierDto';

const pool = Database.getInstance().getPool();

@injectable()
export class RoutesDatasourceImpl implements RoutesRepository {

  async findById(id: number): Promise<{ originCityId: number, assignedCarrierId: number, destinationCityId: number, startDateTime: Date | null } | null> {
    const result = await pool.query(`SELECT originCityId, assignedCarrierId, destinationCityId, startDateTime FROM routes WHERE id = $1`, [id]);

    if (result.rows.length === 0) return null;

    return { originCityId: result.rows[0].origincityid, assignedCarrierId: result.rows[0].assignedcarrierid, destinationCityId: result.rows[0].destinationcityid, startDateTime: result.rows[0].startdatetime };
  }

  async assignCarrierToRoute(dto: AssignCarrierDto, routeId: number): Promise<RoutesEntity> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE routes 
           SET assignedCarrierId = $1 
           WHERE id = $2 
           RETURNING *`,
        [dto.carrierId, routeId]
      );

      if (result.rows.length === 0) {
        throw new ApiError(400, 'Failed to assign carrier to route');
      }

      await client.query(
        `UPDATE users 
           SET isAvailable = false 
           WHERE id = $1`,
        [dto.carrierId]
      );

      await client.query('COMMIT');

      return RoutesEntity.fromObject(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


  async validateVehicleCapacity(routeId: number, newOrder: any): Promise<boolean> {
    const vehicleResult = await pool.query(
      `SELECT v.capacity, v.maxVolume, v.maxWidth, v.maxHeight, v.maxLength
       FROM vehicles v
       JOIN routes r ON r.vehicleId = v.id
       WHERE r.id = $1`,
      [routeId]
    );

    if (vehicleResult.rows.length === 0) {
      throw new ApiError(404, 'Vehicle not found for the specified route');
    }

    const vehicle = vehicleResult.rows[0];

    const ordersResult = await pool.query(
      `SELECT o.packageWeight as weight, 
              o.packageDimensionWidth as width, 
              o.packageDimensionHeight as height, 
              o.packageDimensionLength as length
       FROM orders o
       WHERE o.routeId = $1`,
      [routeId]
    );

    const orders = ordersResult.rows.map(row => ({
      weight: Number(row.weight),
      width: Number(row.width),
      height: Number(row.height),
      length: Number(row.length)
    }));

    orders.push({
      weight: newOrder.packageWeight,
      width: newOrder.packageDimensionWidth,
      height: newOrder.packageDimensionHeight,
      length: newOrder.packageDimensionLength
    });

    return canVehicleCarryOrder(vehicle, orders);
  }


  async assignOrderToRoute(dto: AssignRouteDto, routeId: number): Promise<RoutesEntity> {
    const { orderId } = dto;
    const result = await pool.query(
      `UPDATE orders 
       SET routeId = $1, status = 'En transito', estimatedDeliveryTime = (
           SELECT estimatedGeneralFinish FROM routes WHERE id = $1
       )
       WHERE id = $2
       RETURNING *`,
      [routeId, orderId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(400, 'Failed to assign order to route');
    }

    const routeUpdateResult = await pool.query(
      `UPDATE routes
       SET assignedOrders = array_append(assignedOrders, $1)
       WHERE id = $2
       RETURNING *`,
      [orderId, routeId]
    );

    return RoutesEntity.fromObject(routeUpdateResult.rows[0]);
  }

}
