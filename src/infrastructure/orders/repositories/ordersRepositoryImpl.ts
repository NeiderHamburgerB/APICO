import { CreateOrdersDto } from '../../../domain/orders/dtos/CreateOrdersDto';
import { QueryOrdersDto } from '../../../domain/orders/dtos/QueryOrdersDto';
import { UpdateOrderStatusDto } from '../../../domain/orders/dtos/UpdateOrderStatusDto';
import { OrdersEntity } from '../../../domain/orders/entities/orders.entity';
import { OrdersRepository } from '../../../domain/orders/repositories/orders.repository';
import { OrdersDatasourceImpl } from '../datasources/ordersDatasourceImpl';
import { injectable } from 'tsyringe';

@injectable()
export class OrdersRepositoryImpl extends OrdersRepository {
  constructor(private readonly ordersDatasource: OrdersDatasourceImpl) {
    super();
  }
  async createOrder(dto: CreateOrdersDto): Promise<OrdersEntity> {
    return this.ordersDatasource.createOrder(dto);
  }
  async updateOrderStatus(dto: UpdateOrderStatusDto, orderId: number): Promise<OrdersEntity> {
    return this.ordersDatasource.updateOrderStatus(dto, orderId);
  }
  async queryOrders(dto: QueryOrdersDto): Promise<OrdersEntity> {
    return this.ordersDatasource.queryOrders(dto);
  }

  async findExistingCity(id: number): Promise<{id: number, name: string} | null> {
    return this.ordersDatasource.findExistingCity(id);
  }

  async findOrderById(orderId: number): Promise<OrdersEntity | null> {
    return this.ordersDatasource.findOrderById(orderId);
  }
  async getOrdersStatus(code: string): Promise<OrdersEntity | null> {
    return this.ordersDatasource.getOrdersStatus(code);
  }

}
