import { inject, injectable } from 'tsyringe';
import { generateCode } from '../../../shared/utils/generateCode';
import { CreateOrdersDto } from '../dtos/CreateOrdersDto';
import { OrdersEntity } from '../entities/orders.entity';
import { OrdersRepository } from '../repositories/orders.repository';
import { ApiError } from '../../../shared/errors/apiError';
import { IAddressValidator } from '../contracts/IAddressValidator';
import { ICacheService } from '../contracts/ICache';

export interface CreateOrdersUseCase {
  execute(dto: CreateOrdersDto): Promise<OrdersEntity>;
}

@injectable()
export class CreateOrders implements CreateOrdersUseCase {
  constructor(
    @inject('OrdersRepository') private readonly repository: OrdersRepository,
    @inject('IAddressValidator') private readonly addressValidator: IAddressValidator,
    @inject('ICacheService') private readonly cacheService: ICacheService
  ) { }

  async execute(dto: CreateOrdersDto): Promise<OrdersEntity> {
    if (!dto.userId) {
      throw new ApiError(400, 'UserId is required');
    }
    // Validar que la ciudad de origen exista
    const originCity = await this.repository.findExistingCity(dto.originCityId);
    if (!originCity) {
      throw new ApiError(400, 'Origin city not found');
    }

    // Validar que la ciudad de destino exista
    const destinationCity = await this.repository.findExistingCity(dto.destinationCityId);
    if (!destinationCity) {
      throw new ApiError(400, 'Destination city not found');
    }

    //validar que la ciudad de origen y destino sean diferentes
    if (originCity.id === destinationCity.id) {
      throw new ApiError(400, 'Origin and destination cities cannot be the same');
    }

    // Validar que la dirección de destino sea real
    const isAddressValid = await this.addressValidator.validate(dto.destinationAddress, destinationCity.name);
    if (!isAddressValid) {
      throw new ApiError(400, 'the destination address is not valid for the destination city');
    }
    dto.code = generateCode(6);
    const order = await this.repository.createOrder(dto);
    // Guardar el pedido en la caché por 5 días
    const cacheKey = 'orders';
    const cachedOrdersData = await this.cacheService.get(cacheKey);
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
    await this.cacheService.setEx(cacheKey, 432000, JSON.stringify(ordersList));

    return order;
  }
}
