import { CreateOrdersDto } from '../../../domain/orders/dtos/CreateOrdersDto';
import { QueryOrdersDto } from '../../../domain/orders/dtos/QueryOrdersDto';
import { UpdateOrderStatusDto } from '../../../domain/orders/dtos/UpdateOrderStatusDto';
import { OrdersEntity } from '../../../domain/orders/entities/orders.entity';
import { OrdersRepository } from '../../../domain/orders/repositories/orders.repository';
import Database from '../../../infrastructure/database';
import { injectable } from 'tsyringe';

const pool = Database.getInstance().getPool();

@injectable()
export class OrdersDatasourceImpl implements OrdersRepository {
  async createOrder(dto: CreateOrdersDto): Promise<OrdersEntity> {
    const result = await pool.query(
      `INSERT INTO orders (
          code,
          userId,
          packageWeight,
          packageDimensionWidth,
          packageDimensionHeight,
          packageDimensionLength,
          typeProduct,
          originCityId,
          destinationCityId,
          destinationAddress,
          status
       )
       VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
       )
       RETURNING 
          id,
          code,
          userId,
          packageWeight,
          packageDimensionWidth,
          packageDimensionHeight,
          packageDimensionLength,
          typeProduct,
          originCityId,
          destinationCityId,
          destinationAddress,
          status,
          estimatedDeliveryTime,
          deliveredAt,
          createdAt,
          updatedAt`,
      [
        dto.code,
        dto.userId,
        dto.packageWeight,
        dto.packageDimensionWidth,
        dto.packageDimensionHeight,
        dto.packageDimensionLength,
        dto.typeProduct || null,
        dto.originCityId,
        dto.destinationCityId,
        dto.destinationAddress || null,
        dto.status
      ]
    );

    const order = result.rows[0];
    return OrdersEntity.fromObject(order);
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto, orderId: number): Promise<OrdersEntity> {
    const result = await pool.query(
      `UPDATE orders SET status = $1, deliveredAt = $2 WHERE id = $3 RETURNING id, userId, status, packageWeight, packageDimensionWidth, packageDimensionHeight, packageDimensionLength, typeProduct, originCityId, destinationCityId, destinationAddress, estimatedDeliveryTime, deliveredAt, createdAt, updatedAt`,
      ['Entregado', dto.deliveredAt, orderId]
    );
    const order = result.rows[0];
    return new OrdersEntity(
      order.id,
      order.userId,
      order.status,
      order.packageWeight,
      order.packageDimensionWidth,
      order.packageDimensionHeight,
      order.packageDimensionLength,
      order.typeProduct,
      order.originCityId,
      order.destinationCityId,
      order.destinationAddress,
      order.estimatedDeliveryTime,
      order.deliveredAt,
      order.createdAt,
      order.updatedAt
    );
  }

  async queryOrders(dto: QueryOrdersDto): Promise<OrdersEntity> {
    throw new Error("Not implemented");
  }

  async findExistingCity(id: number): Promise<{ id: number, name: string } | null> {
    const result = await pool.query(
      `SELECT id, name FROM cities WHERE id = $1`,
      [id]
    );
    const city = result.rows[0];
    return city
      ? { id: city.id, name: city.name }
      : null;
  }

  async findOrderById(orderId: number): Promise<OrdersEntity | null> {
    const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    return result.rows.length ? OrdersEntity.fromObject(result.rows[0]) : null;
  }

  async findOrderByCode(code: string): Promise<OrdersEntity | null> {
    const result = await pool.query(`SELECT * FROM orders WHERE code = $1`, [code]);
    return result.rows.length ? OrdersEntity.fromObject(result.rows[0]) : null;
  }

  async getOrdersStatus(code: string): Promise<OrdersEntity | null> {
    const result = await pool.query(`SELECT * FROM orders WHERE code = $1`, [code]);
    return result.rows.length ? OrdersEntity.fromObject(result.rows[0]) : null;
  }
}
