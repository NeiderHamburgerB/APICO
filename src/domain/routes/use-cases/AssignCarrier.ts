import { ApiError } from '../../../shared/errors/apiError';
import { UsersRepository } from '../../users/repositories/users.repository';
import { AssignCarrierDto } from '../dtos/AssignCarrierDto';
import { RoutesEntity } from '../entities/routes.entity';
import { RoutesRepository } from '../repositories/routes.repository';
import { inject, injectable } from 'tsyringe';

export interface AssignCarrierUseCase {
  execute(dto: AssignCarrierDto, routeId: number): Promise<RoutesEntity>;
}

@injectable()
export class AssignCarrier implements AssignCarrierUseCase {
  constructor(
    @inject('RoutesRepository') private readonly repository: RoutesRepository,
    @inject('UsersRepository') private readonly usersRepository: UsersRepository
  ) {}

  async execute(dto: AssignCarrierDto, routeId: number): Promise<RoutesEntity> {
    // Validar si la ruta existe
    const route = await this.repository.findById(routeId);
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }

    // Validar si el carrier está disponible
    const carrierAvailable = await this.usersRepository.isCarrierAvailable(dto.carrierId);
    if (!carrierAvailable) {
      throw new ApiError(400, 'Carrier is not available or does not exist');
    }

    // Asignar el carrier a la ruta y actualizar su disponibilidad a false
    const updatedRoute = await this.repository.assignCarrierToRoute(dto, routeId);

    return updatedRoute;
  }
}
