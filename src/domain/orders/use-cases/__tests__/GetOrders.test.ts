import 'reflect-metadata';
import { GetOrderStatus } from '../GetOrdersStatus';
import { ApiError } from '../../../../shared/errors/apiError';

const ordersRepositoryMock = {
  getOrdersStatus: jest.fn(),
} as any;

const cacheServiceMock = {
  get: jest.fn(),
  setEx: jest.fn(),
} as any;

describe('GetOrderStatus Use Case', () => {
  let getOrderStatus: GetOrderStatus;
  const orderCode = "APICOS-TEST";

  beforeEach(() => {
    jest.clearAllMocks();
    getOrderStatus = new GetOrderStatus(ordersRepositoryMock, cacheServiceMock);
  });

  it("debe retornar el estado en caché si está presente", async () => {
    cacheServiceMock.get.mockResolvedValue("En transito");

    const status = await getOrderStatus.execute(orderCode);
    expect(status).toBe("En transito");
    expect(ordersRepositoryMock.getOrdersStatus).not.toHaveBeenCalled();
  });

  it("debe consultar el repositorio y almacenar en caché el resultado si no está en caché", async () => {
    cacheServiceMock.get.mockResolvedValue(null);
    ordersRepositoryMock.getOrdersStatus.mockResolvedValue({ status: "En espera" });

    const status = await getOrderStatus.execute(orderCode);
    expect(status).toBe("En espera");
    expect(ordersRepositoryMock.getOrdersStatus).toHaveBeenCalledWith(orderCode);
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(`order:${orderCode}:status`, 1800, "En espera");
  });

  it("debe lanzar error si no se encuentra la orden", async () => {
    cacheServiceMock.get.mockResolvedValue(null);
    ordersRepositoryMock.getOrdersStatus.mockResolvedValue(null);

    await expect(getOrderStatus.execute(orderCode))
      .rejects.toThrow(ApiError);
    await expect(getOrderStatus.execute(orderCode))
      .rejects.toThrow("Order not found");
  });
});
