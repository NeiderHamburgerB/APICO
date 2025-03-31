import 'reflect-metadata';
import { AssignRoute } from '../AssignRoute';
import { ApiError } from '../../../../shared/errors/apiError';

describe('AssignRoute UseCase', () => {
  let assignRoute: AssignRoute;
  let mockRouteRepository: any;
  let mockOrdersRepository: any;
  let mockCacheService: any;

  beforeEach(() => {
    mockRouteRepository = {
      findById: jest.fn(),
      validateVehicleCapacity: jest.fn(),
      assignOrderToRoute: jest.fn(),
    };

    mockOrdersRepository = {
      findOrderById: jest.fn(),
    };

    mockCacheService = {
      setEx: jest.fn(),
    };

    assignRoute = new AssignRoute(
      mockRouteRepository,
      mockOrdersRepository,
      mockCacheService
    );
  });

  it('debe lanzar error cuando la ruta no existe', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);
    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(404, 'Route not found'));
  });

  it('debe lanzar error cuando la orden no existe', async () => {
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: undefined };
    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(null);

    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(404, 'Order not found'));
  });

  it('debe lanzar error cuando la orden ya está asignada a una ruta', async () => {
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: undefined };
    const order = { id: 1, routeId: 999, originCityId: 1, destinationCityId: 2, status: 'pending' };

    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(order);

    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(400, 'Order is already assigned to a route'));
  });

  it('debe lanzar error cuando las ciudades de origen/destino no coinciden', async () => {
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: undefined };
    const order = { id: 1, routeId: null, originCityId: 10, destinationCityId: 2, status: 'pending' };

    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(order);

    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(400, 'The order origin/destination cities do not match the route'));
  });

  it('debe lanzar error cuando la ruta ya ha comenzado', async () => {
    const pastDate = new Date(Date.now() - 10000);
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: pastDate };
    const order = { id: 1, routeId: null, originCityId: 1, destinationCityId: 2, status: 'pending' };

    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(order);

    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(400, 'The order cannot be assigned because the route has already started.'));
  });

  it('debe lanzar error cuando la capacidad del vehículo es insuficiente', async () => {
    const futureDate = new Date(Date.now() + 10000);
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: futureDate };
    const order = { id: 1, routeId: null, originCityId: 1, destinationCityId: 2, status: 'pending' };

    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(order);
    mockRouteRepository.validateVehicleCapacity.mockResolvedValue(false);

    const dto = { orderId: 1 };

    await expect(assignRoute.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(400, 'The vehicle cannot carry the order due to weight or volume constraints'));
  });

  it('debe asignar la orden a la ruta correctamente', async () => {
    const futureDate = new Date(Date.now() + 10000);
    const route = { id: 123, originCityId: 1, destinationCityId: 2, startDateTime: futureDate };
    const order = { id: 1, routeId: null, originCityId: 1, destinationCityId: 2, status: 'pending' };
    const updatedRoute = { id: 123, assignedOrders: [order] };

    mockRouteRepository.findById.mockResolvedValue(route);
    mockOrdersRepository.findOrderById.mockResolvedValue(order);
    mockRouteRepository.validateVehicleCapacity.mockResolvedValue(true);
    mockRouteRepository.assignOrderToRoute.mockResolvedValue(updatedRoute);
    mockCacheService.setEx.mockResolvedValue(undefined);

    const dto = { orderId: 1 };

    const result = await assignRoute.execute(dto, 123);

    expect(result).toEqual(updatedRoute);
    expect(mockCacheService.setEx).toHaveBeenCalledWith(`route:123:status`, 1800, order.status);
  });
});
