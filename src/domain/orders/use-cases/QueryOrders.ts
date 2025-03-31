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
    const cacheKey = `keyOrder:${dto.code}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (!cachedData) {
      return [];
    }

    let ordersList: OrdersEntity[] = [];
    try {
      ordersList = JSON.parse(cachedData);
    } catch (error) {
      return [];
    }

    // Filtro por fechas
    if (dto.startDate !== undefined) {
      const startDate = dto.startDate;
      ordersList = ordersList.filter(
        order => order.deliveredAt && new Date(order.deliveredAt) >= startDate
      );
    }
    if (dto.endDate !== undefined) {
      const endDate = dto.endDate!;
      ordersList = ordersList.filter(
        order => order.deliveredAt && new Date(order.deliveredAt) <= endDate
      );
    }

    // Filtro por estado
    if (dto.status) {
      ordersList = ordersList.filter(order => order.status === dto.status);
    }

    return ordersList;
  }
}
