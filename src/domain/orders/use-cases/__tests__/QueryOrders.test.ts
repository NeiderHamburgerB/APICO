import "reflect-metadata";
import { ICacheService } from "../../contracts/ICache";
import { QueryOrdersDto } from "../../dtos/QueryOrdersDto";
import { OrdersEntity } from "../../entities/orders.entity";
import { QueryOrders } from "../QueryOrders";

const mockCacheService: ICacheService = {
  get: jest.fn(),
  setEx: jest.fn(),
};

describe('QueryOrders Use Case', () => {
  let queryOrders: QueryOrders;

  beforeEach(() => {
    (mockCacheService.get as jest.Mock).mockReset();
    queryOrders = new QueryOrders(mockCacheService);
  });

  it('debería retornar un arreglo vacío si no hay datos en la caché', async () => {
    (mockCacheService.get as jest.Mock).mockResolvedValue(null);

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      assignedCarrierId: undefined,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([]);
  });

  it('debería retornar un arreglo vacío si el JSON en la caché es inválido', async () => {
    (mockCacheService.get as jest.Mock).mockResolvedValue("invalid json");

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([]);
  });

  it('debería retornar todas las órdenes si no se aplican filtros', async () => {
    const orders: OrdersEntity[] = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-03-30T15:19:52.990Z", status: "Pendiente" },
    ] as unknown as OrdersEntity[];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual(orders);
  });

  it('debería filtrar órdenes por startDate', async () => {
    const orders: OrdersEntity[] = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-03-29T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: new Date("2025-03-30T00:00:00.000Z"),
      endDate: undefined,
      status: undefined,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[]);
  });

  it('debería filtrar órdenes por endDate', async () => {
    const orders: OrdersEntity[] = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-04-01T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: undefined,
      endDate: new Date("2025-04-01T00:00:00.000Z"),
      status: undefined,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[]);
  });

  it('debería filtrar órdenes por status', async () => {
    const orders: OrdersEntity[] = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-03-31T15:20:52.990Z", status: "Pendiente" },
    ] as unknown as OrdersEntity[];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: undefined,
      endDate: undefined,
      status: "Entregado",
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[]);
  });

  it('debería aplicar filtros combinados correctamente', async () => {
    const orders: OrdersEntity[] = [
      { deliveredAt: "2025-03-28T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-03-29T15:19:52.990Z", status: "Pendiente" },
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
      { deliveredAt: "2025-04-01T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      code: 'ORDER123',
      startDate: new Date("2025-03-30T00:00:00.000Z"),
      endDate: new Date("2025-04-01T00:00:00.000Z"),
      status: "Entregado",
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([
      { deliveredAt: "2025-03-31T15:19:52.990Z", status: "Entregado" },
    ] as unknown as OrdersEntity[]);
  });
});
