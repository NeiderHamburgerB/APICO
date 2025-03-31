import { RoutesEntity } from '../entities/routes.entity';
import { AssignRouteDto } from '../dtos/AssignRouteDto';
import { AssignCarrierDto } from '../dtos/AssignCarrierDto';

export abstract class RoutesRepository {
  abstract findById(id: number): Promise<{ originCityId: number, assignedCarrierId: number, destinationCityId: number, startDateTime: Date | null } | null>;
  abstract validateVehicleCapacity(routeId: number, newOrder: any): Promise<boolean>;
  abstract assignOrderToRoute(dto: AssignRouteDto, routeId: number): Promise<RoutesEntity>;
  abstract assignCarrierToRoute(dto: AssignCarrierDto, routeId: number): Promise<RoutesEntity>;
}
