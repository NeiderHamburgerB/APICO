import { inject, injectable } from 'tsyringe';
import { OrdersRepository } from '../repositories/orders.repository';
import { ApiError } from '../../../shared/errors/apiError';
import { ICacheService } from '../contracts/ICache';

export interface GetOrderStatusUseCase {
  execute(code: string): Promise<string>;
}

@injectable()
export class GetOrderStatus implements GetOrderStatusUseCase {
  constructor(
    @inject('OrdersRepository') private readonly ordersRepository: OrdersRepository,
    @inject('ICacheService') private readonly cacheService: ICacheService
  ) {}

  async execute(code: string): Promise<string> {
    // Crear llave de cache
    const cacheKey = `order:${code}:status`;
    const cachedStatus = await this.cacheService.get(cacheKey);
    if (cachedStatus) return cachedStatus;
    // Buscar el estado del pedido en la base de datos
    const order = await this.ordersRepository.getOrdersStatus(code);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    // Almacenar el estado en cache por 30 minutos (1800 segundos)
    await this.cacheService.setEx(cacheKey, 1800, order.status);
    return order.status;
  }
}
