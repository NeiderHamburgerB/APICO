import { CreateOrdersDto } from '../dtos/CreateOrdersDto';
import { OrdersEntity } from '../entities/orders.entity';

export abstract class OrdersRepository {
  abstract createOrder(dto: CreateOrdersDto): Promise<OrdersEntity>;
  abstract updateOrderStatus(dto: any): Promise<OrdersEntity>;
  abstract queryOrders(dto: any): Promise<OrdersEntity>;
  abstract findExistingCity(id: number): Promise<{id: number, name: string} | null>;
  abstract findOrderById(orderId: number): Promise<OrdersEntity | null>;
  abstract getOrdersStatus(code: string): Promise<OrdersEntity | null>;
}
