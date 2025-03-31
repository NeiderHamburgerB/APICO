import { ICacheService } from '../contracts/ICache';
import { QueryOrdersDto } from '../dtos/QueryOrdersDto';
import { OrdersEntity } from '../entities/orders.entity';
import { inject, injectable } from 'tsyringe';

export interface QueryOrdersUseCase {
  execute(dto: QueryOrdersDto): Promise<OrdersEntity[]>;
}

@injectable()
export class QueryOrders implements QueryOrdersUseCase {
  constructor(
    @inject('ICacheService') private readonly cacheService: ICacheService,
  ) {}

  async execute(dto: QueryOrdersDto): Promise<OrdersEntity[]> {
    const cacheKey = 'orders';  
    const cachedData = await this.cacheService.get(cacheKey);

    if (!cachedData) {
      return [];
    }

    let ordersList: any[] = [];
    try {
      ordersList = JSON.parse(cachedData);
    } catch (error) {
      return [];
    }

    // Filtro por código  
    if (dto.code) {
      ordersList = ordersList.filter(orderWrapper => orderWrapper.order.code === dto.code);
    }

    // Filtro por fechas  
    if (dto.startDate && dto.startDate instanceof Date && !isNaN(dto.startDate.getTime())) {
      ordersList = ordersList.filter(
        orderWrapper => orderWrapper.deliveredAt && new Date(orderWrapper.deliveredAt) >= dto.startDate!
      );
    }
    
    if (dto.endDate && dto.endDate instanceof Date && !isNaN(dto.endDate.getTime())) {
      ordersList = ordersList.filter(
        orderWrapper => orderWrapper.deliveredAt && new Date(orderWrapper.deliveredAt) <= dto.endDate!
      );
    }

    // Filtro por assignedCarrierId
    if (dto.assignedCarrierId !== undefined) {
      ordersList = ordersList.filter(
        orderWrapper => orderWrapper.route?.assignedCarrierId === dto.assignedCarrierId
      );
    }

    // Filtro por estado
    if (dto.status) {
      ordersList = ordersList.filter(orderWrapper => orderWrapper.order.status === dto.status);
    }

    return ordersList.map(wrapper => wrapper.order);
  }
}
