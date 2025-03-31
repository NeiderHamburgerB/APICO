import 'reflect-metadata';
import { AssignCarrier } from '../AssignCarrier';
import { ApiError } from '../../../../shared/errors/apiError';

describe('AssignCarrier UseCase', () => {
  let assignCarrier: AssignCarrier;
  let mockRoutesRepository: any;
  let mockUsersRepository: any;

  beforeEach(() => {
    mockRoutesRepository = {
      findById: jest.fn(),
      assignCarrierToRoute: jest.fn(),
    };

    mockUsersRepository = {
      isCarrierAvailable: jest.fn(),
    };

    assignCarrier = new AssignCarrier(mockRoutesRepository, mockUsersRepository);
  });

  it('debe lanzar error cuando la ruta no existe', async () => {
    mockRoutesRepository.findById.mockResolvedValue(null);
    const dto = { carrierId: 1 };

    await expect(assignCarrier.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(404, 'Route not found'));
  });

  it('debe lanzar error cuando el carrier no está disponible o no existe', async () => {
    const route = { id: 123 };
    mockRoutesRepository.findById.mockResolvedValue(route);
    mockUsersRepository.isCarrierAvailable.mockResolvedValue(false);
    const dto = { carrierId: 1 };

    await expect(assignCarrier.execute(dto, 123))
      .rejects
      .toEqual(new ApiError(400, 'Carrier is not available or does not exist'));
  });

  it('debe asignar el carrier a la ruta correctamente', async () => {
    const route = { id: 123 };
    const updatedRoute = { id: 123, carrierId: 1 };

    mockRoutesRepository.findById.mockResolvedValue(route);
    mockUsersRepository.isCarrierAvailable.mockResolvedValue(true);
    mockRoutesRepository.assignCarrierToRoute.mockResolvedValue(updatedRoute);

    const dto = { carrierId: 1 };

    const result = await assignCarrier.execute(dto, 123);

    expect(result).toEqual(updatedRoute);
    expect(mockRoutesRepository.assignCarrierToRoute).toHaveBeenCalledWith(dto, 123);
  });
});
