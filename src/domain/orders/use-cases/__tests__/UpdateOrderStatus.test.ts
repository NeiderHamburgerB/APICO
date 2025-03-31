import 'reflect-metadata';
import { UpdateOrderStatus } from '../UpdateOrderStatus';
import { UpdateOrderStatusDto } from '../../dtos/UpdateOrderStatusDto';
import { OrdersEntity } from '../../entities/orders.entity';
import { ApiError } from '../../../../shared/errors/apiError';

const repositoryMock = {
  findOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
} as any;

const usersRepositoryMock = {
  areAllOrdersDelivered: jest.fn(),
  updateStatus: jest.fn(),
} as any;

const routesRepositoryMock = {
  findById: jest.fn(),
} as any;

const cacheServiceMock = {
  setEx: jest.fn(),
} as any;

const fakeOrder: OrdersEntity = {
  id: 1,
  code: 'ORDERCODE123',
  status: 'En espera',
  deliveredAt: undefined,
  routeId: 10,
  userId: 10,
  packageWeight: 5,
  packageDimensionWidth: 20,
  packageDimensionHeight: 15,
  packageDimensionLength: 30,
  typeProduct: "Electronics",
  originCityId: 1,
  destinationCityId: 2,
  destinationAddress: "Calle 33 #21b-23",
  createdAt: new Date(),
  updatedAt: new Date(),
  isValid: true,
};

const fakeRoute = {
  assignedCarrierId: 100,
};

describe("UpdateOrderStatus Use Case", () => {
  let updateOrderStatusUseCase: UpdateOrderStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    updateOrderStatusUseCase = new UpdateOrderStatus(
      repositoryMock,
      usersRepositoryMock,
      routesRepositoryMock,
      cacheServiceMock
    );
  });

  it("debe lanzar error si la orden no se encuentra", async () => {
    repositoryMock.findOrderById.mockResolvedValueOnce(null);
    const dto: UpdateOrderStatusDto = { deliveredAt: new Date() };

    await expect(updateOrderStatusUseCase.execute(dto, 1))
      .rejects
      .toThrow(new ApiError(404, 'Order not found'));
  });

  it("debe lanzar error si la orden ya fue entregada", async () => {
    repositoryMock.findOrderById.mockResolvedValueOnce({ ...fakeOrder, status: 'Entregado' });
    const dto: UpdateOrderStatusDto = { deliveredAt: new Date() };

    await expect(updateOrderStatusUseCase.execute(dto, fakeOrder.id))
      .rejects
      .toThrow("Order already delivered");
  });

  it("debe lanzar error si la ruta asociada no se encuentra", async () => {
    repositoryMock.findOrderById.mockResolvedValueOnce(fakeOrder);
    repositoryMock.updateOrderStatus.mockResolvedValueOnce({ ...fakeOrder, status: 'Entregado' });
    routesRepositoryMock.findById.mockResolvedValueOnce(null);

    const dto: UpdateOrderStatusDto = { deliveredAt: new Date() };

    await expect(updateOrderStatusUseCase.execute(dto, fakeOrder.id))
      .rejects
      .toThrow("Route not found");
  });

  it("debe actualizar la orden y configurar la caché correctamente cuando no todas las órdenes están entregadas", async () => {
    repositoryMock.findOrderById.mockResolvedValueOnce({ ...fakeOrder, status: 'En espera' });
    routesRepositoryMock.findById.mockResolvedValueOnce(fakeRoute);
    usersRepositoryMock.areAllOrdersDelivered.mockResolvedValueOnce(false);
  
    const deliveredAtDate = new Date();
    const updatedOrder = { ...fakeOrder, status: 'Entregado', deliveredAt: deliveredAtDate };
    repositoryMock.updateOrderStatus.mockResolvedValueOnce(updatedOrder);
  
    const dto: UpdateOrderStatusDto = { deliveredAt: deliveredAtDate };
    const result = await updateOrderStatusUseCase.execute(dto, fakeOrder.id);
  
    expect(result).toEqual(updatedOrder);
    expect(repositoryMock.updateOrderStatus).toHaveBeenCalledWith(dto, fakeOrder.id);
  
    const statusCacheKey = `order:${fakeOrder.code}:status`;
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(statusCacheKey, 1800, 'Entregado');
  
    const keyOrderCacheKey = `keyOrder:${fakeOrder.id}`;
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(keyOrderCacheKey, 432000, JSON.stringify({
      deliveredAt: deliveredAtDate,
      order: updatedOrder
    }));
  });

  it("debe actualizar la orden y el transportista si todas las órdenes están entregadas", async () => {
    repositoryMock.findOrderById.mockResolvedValueOnce({ ...fakeOrder, status: 'En espera' });
    routesRepositoryMock.findById.mockResolvedValueOnce(fakeRoute);
    usersRepositoryMock.areAllOrdersDelivered.mockResolvedValueOnce(true);
  
    const deliveredAtDate = new Date();
    const updatedOrder = { ...fakeOrder, status: 'Entregado', deliveredAt: deliveredAtDate };
    repositoryMock.updateOrderStatus.mockResolvedValueOnce(updatedOrder);
  
    const dto: UpdateOrderStatusDto = { deliveredAt: deliveredAtDate };
    const result = await updateOrderStatusUseCase.execute(dto, fakeOrder.id);
  
    expect(result).toEqual(updatedOrder);
    expect(repositoryMock.updateOrderStatus).toHaveBeenCalledWith(dto, fakeOrder.id);
    expect(usersRepositoryMock.updateStatus).toHaveBeenCalledWith({ id: fakeRoute.assignedCarrierId, isAvailable: true });
  
    const statusCacheKey = `order:${fakeOrder.code}:status`;
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(statusCacheKey, 1800, 'Entregado');
  
    const keyOrderCacheKey = `keyOrder:${fakeOrder.id}`;
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(keyOrderCacheKey, 432000, JSON.stringify({
      deliveredAt: deliveredAtDate,
      order: updatedOrder
    }));
  });
});
