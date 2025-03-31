import { ApiError } from '../../../shared/errors/apiError';
import { RoutesRepository } from '../../routes/repositories/routes.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ICacheService } from '../contracts/ICache';
import { UpdateOrderStatusDto } from '../dtos/UpdateOrderStatusDto';
import { OrdersEntity } from '../entities/orders.entity';
import { OrdersRepository } from '../repositories/orders.repository';
import { inject, injectable } from 'tsyringe';

export interface UpdateOrderStatusUseCase {
  execute(dto: UpdateOrderStatusDto, orderId: number): Promise<OrdersEntity>;
}
@injectable()
export class UpdateOrderStatus implements UpdateOrderStatusUseCase {

  constructor(
    @inject('OrdersRepository') private readonly repository: OrdersRepository,
    @inject('UsersRepository') private readonly usersRepository: UsersRepository,
    @inject('RoutesRepository') private readonly routesRepository: RoutesRepository,
    @inject('ICacheService') private readonly cacheService: ICacheService
  ) { }

  async execute(dto: UpdateOrderStatusDto, orderId: number): Promise<OrdersEntity> {
    // Validar que el pedido exista
    const order = await this.repository.findOrderById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    // Validar que el pedido no haya sido entregado previamente
    if (order.status === 'Entregado') {
      throw new ApiError(400, 'Order already delivered');
    }
    // Actualizar el estado del pedido
    order.status = 'Entregado';
    // Actualizar la fecha de entrega
    order.deliveredAt = dto.deliveredAt || new Date();
    // Actualizar el pedido en la base de datos
    const updatedOrder = await this.repository.updateOrderStatus(dto, orderId);
    // Almacenar en caché por 30 minutos (1800 segundos)
    const cacheKey = `order:${order.code}:status`;
    await this.cacheService.setEx(cacheKey, 1800, order.status);

    // Obtener la ruta del pedido
    const route = await this.routesRepository.findById(order.routeId!);
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }
    // Validar si el transportista ha entregado todas las órdenes
    const allDelivered = await this.usersRepository.areAllOrdersDelivered(route.assignedCarrierId!);
    if (allDelivered) {
      await this.usersRepository.updateStatus({ id: route.assignedCarrierId!, isAvailable: true });
    }
    // Guardar el pedido completado en la caché por 5 días
    const keyOrder = `keyOrder:${order.id}`;
    await this.cacheService.setEx(keyOrder, 432000, JSON.stringify({
      deliveredAt: order.deliveredAt,
      order
    }));

    return updatedOrder;
  }
}
