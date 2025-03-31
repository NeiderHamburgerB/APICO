import "reflect-metadata";
import { ICacheService } from "../../contracts/ICache";
import { QueryOrdersDto } from "../../dtos/QueryOrdersDto";
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

    const dto: QueryOrdersDto = {};

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([]);
  });

  it('debería retornar un arreglo vacío si el JSON en la caché es inválido', async () => {
    (mockCacheService.get as jest.Mock).mockResolvedValue("invalid json");

    const dto: QueryOrdersDto = {};

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([]);
  });

  it('debería retornar todas las órdenes si no se aplican filtros', async () => {
    const orders = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { status: "Entregado" }, route: null },
      { deliveredAt: "2025-03-30T15:19:52.990Z", order: { status: "Pendiente" }, route: null },
    ];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {};

    const result = await queryOrders.execute(dto);
    expect(result).toEqual(orders.map(wrapper => wrapper.order));
  });

  it('debería filtrar órdenes por assignedCarrierId', async () => {
    const orders = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { status: "Entregado" }, route: { assignedCarrierId: 1 } },
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { status: "Pendiente" }, route: { assignedCarrierId: 2 } },
    ];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = { assignedCarrierId: 1 };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([{ status: "Entregado" }]);
  });

  it('debería aplicar todos los filtros correctamente', async () => {
    const orders = [
      { deliveredAt: "2025-03-28T15:19:52.990Z", order: { status: "Entregado" }, route: { assignedCarrierId: 1 } },
      { deliveredAt: "2025-03-29T15:19:52.990Z", order: { status: "Pendiente" }, route: { assignedCarrierId: 1 } },
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { status: "Entregado" }, route: { assignedCarrierId: 2 } },
      { deliveredAt: "2025-04-01T15:19:52.990Z", order: { status: "Entregado" }, route: { assignedCarrierId: 1 } },
    ];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      startDate: new Date("2025-03-30T00:00:00.000Z"),
      endDate: new Date("2025-04-01T00:00:00.000Z"),
      status: "Entregado",
      assignedCarrierId: 2,
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([{ status: "Entregado" }]);
  });

  it('debería filtrar correctamente por código', async () => {
    const orders = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { code: "ORDER123", status: "Entregado" }, route: null },
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { code: "ORDER456", status: "Pendiente" }, route: null },
    ];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = { code: 'ORDER123' };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([{ code: "ORDER123", status: "Entregado" }]);
  });

  it('debería filtrar correctamente por rango de fechas', async () => {
    const orders = [
      { deliveredAt: "2025-03-31T15:19:52.990Z", order: { status: "Entregado" }, route: null },
      { deliveredAt: "2025-04-02T15:19:52.990Z", order: { status: "Pendiente" }, route: null },
    ];

    (mockCacheService.get as jest.Mock).mockResolvedValue(JSON.stringify(orders));

    const dto: QueryOrdersDto = {
      startDate: new Date("2025-03-31T00:00:00.000Z"),
      endDate: new Date("2025-04-01T23:59:59.999Z"),
    };

    const result = await queryOrders.execute(dto);
    expect(result).toEqual([{ status: "Entregado" }]);
  });
});
