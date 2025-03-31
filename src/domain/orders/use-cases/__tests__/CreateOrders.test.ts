import 'reflect-metadata';

jest.mock('../../../../shared/utils/generateCode', () => ({
  generateCode: jest.fn(() => "TESTCODE"),
}));

import { CreateOrders } from '../CreateOrders';
import { CreateOrdersDto } from '../../dtos/CreateOrdersDto';
import { generateCode } from '../../../../shared/utils/generateCode';

const originCity = { id: 1, name: "Bogota" };
const destinationCity = { id: 2, name: "Medellin" };

const validDto: CreateOrdersDto = {
  userId: 10,
  packageWeight: 5,
  packageDimensionWidth: 20,
  packageDimensionHeight: 15,
  packageDimensionLength: 30,
  typeProduct: "Electronics",
  originCityId: originCity.id,
  destinationCityId: destinationCity.id,
  destinationAddress: "Calle 33 #21b-23 Medellin, Colombia",
  status: "En espera",
};

const repositoryMock = {
  findExistingCity: jest.fn(),
  createOrder: jest.fn(),
} as any;

repositoryMock.findExistingCity.mockImplementation((cityId: number) => {
  if (cityId === validDto.originCityId) return Promise.resolve(originCity);
  if (cityId === validDto.destinationCityId) return Promise.resolve(destinationCity);
  return Promise.resolve(null);
});

repositoryMock.createOrder.mockImplementation((dto: CreateOrdersDto) => {
  return Promise.resolve({
    id: 100,
    ...dto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

const addressValidatorMock = {
  validate: jest.fn(),
} as any;
addressValidatorMock.validate.mockResolvedValue(true);

const cacheServiceMock = {
  setEx: jest.fn(),
} as any;

describe("CreateOrders Use Case", () => {
  let createOrders: CreateOrders;

  beforeEach(() => {
    jest.clearAllMocks();
    createOrders = new CreateOrders(repositoryMock, addressValidatorMock, cacheServiceMock);
  });

  it("Debe lanzar error si falta el userId", async () => {
    const dto = { ...validDto, userId: undefined } as any;
    await expect(createOrders.execute(dto)).rejects.toThrow("UserId is required");
  });

  it("Debe lanzar error si la ciudad de origen no se encuentra", async () => {
    repositoryMock.findExistingCity.mockReset();
    repositoryMock.findExistingCity
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(destinationCity);
    await expect(createOrders.execute(validDto)).rejects.toThrow("Origin city not found");
  });

  it("Debe lanzar error si la ciudad de destino no se encuentra", async () => {
    repositoryMock.findExistingCity.mockReset();
    repositoryMock.findExistingCity
      .mockResolvedValueOnce(originCity)
      .mockResolvedValueOnce(null);
    await expect(createOrders.execute(validDto)).rejects.toThrow("Destination city not found");
  });

  it("Debe lanzar error si la ciudad de origen y destino son iguales", async () => {
    repositoryMock.findExistingCity.mockReset();
    const sameCity = { id: validDto.originCityId, name: "Bogota" };
    repositoryMock.findExistingCity
      .mockResolvedValueOnce(sameCity)
      .mockResolvedValueOnce(sameCity);
    await expect(createOrders.execute(validDto)).rejects.toThrow("Origin and destination cities cannot be the same");
  });

  it("Debe lanzar error si la dirección de destino no es válida", async () => {
    repositoryMock.findExistingCity.mockReset();
    repositoryMock.findExistingCity
      .mockResolvedValueOnce(originCity)
      .mockResolvedValueOnce(destinationCity);
    addressValidatorMock.validate.mockReset();
    addressValidatorMock.validate.mockResolvedValueOnce(false);
    await expect(createOrders.execute(validDto)).rejects.toThrow("the destination address is not valid for the destination city");
  });

  it("Debe crear la orden exitosamente", async () => {
    repositoryMock.findExistingCity.mockReset();
    repositoryMock.findExistingCity
      .mockResolvedValueOnce(originCity)
      .mockResolvedValueOnce(destinationCity);
    addressValidatorMock.validate.mockReset();
    addressValidatorMock.validate.mockResolvedValueOnce(true);
    repositoryMock.createOrder.mockReset();
    repositoryMock.createOrder.mockImplementation((dto: CreateOrdersDto) => {
      return Promise.resolve({
        id: 100,
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    const result = await createOrders.execute(validDto);
    expect(result.id).toBe(100);
    expect(result.code).toBe("TESTCODE");
    expect(generateCode).toHaveBeenCalledWith(6);
    expect(repositoryMock.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      code: "TESTCODE",
      userId: validDto.userId,
      packageWeight: validDto.packageWeight,
      destinationAddress: validDto.destinationAddress,
    }));
    // Validar que se llame al cacheService con la key correcta
    const expectedKey = `keyOrder:TESTCODE`;
    const expectedValue = JSON.stringify({
      deliveredAt: null,
      order: result
    });
    expect(cacheServiceMock.setEx).toHaveBeenCalledWith(expectedKey, 432000, expectedValue);
  });
});
