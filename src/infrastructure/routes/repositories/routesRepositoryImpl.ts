import { RoutesEntity } from '../../../domain/routes/entities/routes.entity';
import { RoutesRepository } from '../../../domain/routes/repositories/routes.repository';
import { inject, injectable } from 'tsyringe';
import { RoutesDatasourceImpl } from '../datasources/routesDatasourceImpl';
import { AssignRouteDto } from '../../../domain/routes/dtos/AssignRouteDto';
import { AssignCarrierDto } from '../../../domain/routes/dtos/AssignCarrierDto';

@injectable()
export class RoutesRepositoryImpl extends RoutesRepository {

  constructor(@inject(RoutesDatasourceImpl) private datasource: RoutesDatasourceImpl) {
    super();
  }

  async findById(id: number): Promise<{ originCityId: number, assignedCarrierId: number, destinationCityId: number, startDateTime: Date | null } | null> {
    const route = await this.datasource.findById(id);
    if (!route) return null;
    return { originCityId: route.originCityId, assignedCarrierId: route.assignedCarrierId, destinationCityId: route.destinationCityId, startDateTime: route.startDateTime };
  }

  async assignOrderToRoute(dto: AssignRouteDto, routeId: number): Promise<RoutesEntity> {
    return this.datasource.assignOrderToRoute(dto, routeId);
  }

  async assignCarrierToRoute(dto: AssignCarrierDto, routeId: number): Promise<RoutesEntity> {
    return this.datasource.assignCarrierToRoute(dto, routeId);
  }

  async validateVehicleCapacity(routeId: number, newOrder: any): Promise<boolean> {
    return this.datasource.validateVehicleCapacity(routeId, newOrder);
  }

}
