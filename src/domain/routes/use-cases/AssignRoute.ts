import { ApiError } from '../../../shared/errors/apiError';
import { ICacheService } from '../../orders/contracts/ICache';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { AssignRouteDto } from '../dtos/AssignRouteDto';
import { RoutesEntity } from '../entities/routes.entity';
import { RoutesRepository } from '../repositories/routes.repository';
import { inject, injectable } from 'tsyringe';

export interface AssignRouteUseCase {
  execute(dto: AssignRouteDto, routeId: number): Promise<RoutesEntity>;
}

@injectable()
export class AssignRoute implements AssignRouteUseCase {
  constructor(
    @inject('RoutesRepository') private readonly routeRepository: RoutesRepository,
    @inject('OrdersRepository') private readonly ordersRepository: OrdersRepository,
    @inject('ICacheService') private readonly cacheService: ICacheService
  ) { }

  async execute(dto: AssignRouteDto, routeId: number): Promise<RoutesEntity> {
    const { orderId } = dto;

    // Validar si la ruta existe
    const route = await this.routeRepository.findById(routeId);
    if (!route) throw new ApiError(404, 'Route not found');

    // Validar si la orden existe y está pendiente
    const order = await this.ordersRepository.findOrderById(orderId);
 
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.routeId) throw new ApiError(400, 'Order is already assigned to a route');

    // Validar que el origen y destino coinciden
    if (order.originCityId !== route.originCityId || order.destinationCityId !== route.destinationCityId) {
      throw new ApiError(400, 'The order origin/destination cities do not match the route');
    }

    // Validar que la ruta no haya comenzado
    if (route.startDateTime && new Date() > route.startDateTime) {
      throw new ApiError(400, 'The order cannot be assigned because the route has already started.');
    }

    // Validar capacidad del vehículo
    const canCarry = await this.routeRepository.validateVehicleCapacity(routeId, order);
    
    if (!canCarry) {
      throw new ApiError(400, 'The vehicle cannot carry the order due to weight or volume constraints');
    }

    // Asignar la orden a la ruta y actualizar el estimatedDeliveryTime y el estado
    const updatedRoute = await this.routeRepository.assignOrderToRoute(dto, routeId);
   
    // Almacenar en caché por 30 minutos (1800 segundos)
    const cacheKey = `order:${order.code}:status`;

    order.status = 'En transito';
    await this.cacheService.setEx(cacheKey, 1800, order.status);

    // Guardar el pedido en la caché por 5 días
    const cacheKeyOrders = 'orders';
    const cachedOrdersData = await this.cacheService.get(cacheKeyOrders);
    let ordersList = [];
    if (cachedOrdersData) {
      try {
        ordersList = JSON.parse(cachedOrdersData);
      } catch (error) {
        ordersList = [];
      }
    }
    ordersList.push({
      deliveredAt: null,
      order,
      route: null
    });
    await this.cacheService.setEx(cacheKeyOrders, 432000, JSON.stringify(ordersList));

    return updatedRoute;
  }
}
