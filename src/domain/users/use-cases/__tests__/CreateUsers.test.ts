import 'reflect-metadata';
import { mock, instance, when, verify, reset, anything } from 'ts-mockito';
import { UsersRepository } from '../../repositories/users.repository';
import { CreateUsers } from '../CreateUsers';
import { IEncryptionService } from '../../../auth/contracts/IEncryptionService';
import { ITokenService } from '../../../auth/contracts/ITokenService';
import { CreateUsersDto } from '../../dtos/CreateUsersDto';
import { UsersEntity } from '../../entities/users.entity';


describe('CreateUsers Use Case', () => {
  let useCase: CreateUsers;
  let repositoryMock: UsersRepository;
  let encryptionServiceMock: IEncryptionService;
  let tokenServiceMock: ITokenService;

  beforeEach(() => {
    repositoryMock = mock<UsersRepository>();
    encryptionServiceMock = mock<IEncryptionService>();
    tokenServiceMock = mock<ITokenService>();

    useCase = new CreateUsers(
      instance(repositoryMock),
      instance(encryptionServiceMock),
      instance(tokenServiceMock)
    );
  });

  afterEach(() => {
    reset(repositoryMock);
    reset(encryptionServiceMock);
    reset(tokenServiceMock);
  });

  it('debería crear un usuario exitosamente', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      password: 'password123',
      roleId: 1,
      name: 'Test User',
    };

    const hashedPassword = 'hashedPassword123';
    const user: UsersEntity = { id: 1, name: 'Test User', email: dto.email, password: hashedPassword, roleId: dto.roleId, isValid: true };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(null);
    when(repositoryMock.isValidRole(dto.roleId)).thenResolve(true);
    when(encryptionServiceMock.hash(dto.password)).thenResolve(hashedPassword);
    when(repositoryMock.create(anything())).thenResolve(user);
    when(tokenServiceMock.generateToken(anything())).thenReturn('validToken');

    const result = await useCase.execute(dto);

    expect(result.user).toEqual(user);
    expect(result.token).toBe('validToken');
    verify(repositoryMock.findByEmail(dto.email)).once();
    verify(repositoryMock.isValidRole(dto.roleId)).once();
    verify(encryptionServiceMock.hash(dto.password)).once();
    verify(repositoryMock.create(anything())).once();
    verify(tokenServiceMock.generateToken(anything())).once();
  });

  it('debería fallar si el email ya existe', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      password: 'password123',
      roleId: 1,
      name: 'Test User',
    };

    const existingUser: UsersEntity = { id: 1, name: 'Test User', email: dto.email, password: 'hashedPassword', roleId: dto.roleId, isValid: true };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(existingUser);

    await expect(useCase.execute(dto)).rejects.toThrow('Email already exists');
    verify(repositoryMock.findByEmail(dto.email)).once();
  });

  it('debería fallar si el rol es inválido', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      password: 'password123',
      roleId: 999,
      name: 'Test User',
    };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(null);
    when(repositoryMock.isValidRole(dto.roleId)).thenResolve(false);

    await expect(useCase.execute(dto)).rejects.toThrow('Invalid role');
    verify(repositoryMock.findByEmail(dto.email)).once();
    verify(repositoryMock.isValidRole(dto.roleId)).once();
  });


  it('debería generar un token JWT al crear un usuario', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      password: 'password123',
      roleId: 1,
      name: 'Test User',
    };

    const hashedPassword = 'hashedPassword';
    const user: UsersEntity = { id: 1, name: 'Test User', email: dto.email, password: hashedPassword, roleId: dto.roleId, isValid: true };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(null);
    when(repositoryMock.isValidRole(dto.roleId)).thenResolve(true);
    when(encryptionServiceMock.hash(dto.password)).thenResolve(hashedPassword);
    when(repositoryMock.create(anything())).thenResolve(user);
    when(tokenServiceMock.generateToken(anything())).thenReturn('validToken');

    const result = await useCase.execute(dto);

    expect(result.token).toBe('validToken');
    verify(tokenServiceMock.generateToken(anything())).once();
  });

  it('debería encriptar correctamente la contraseña', async () => {
    const dto: CreateUsersDto = {
      email: 'test@example.com',
      password: 'password123',
      roleId: 1,
      name: 'Test User',
    };

    const hashedPassword = 'hashedPassword';
    const user: UsersEntity = { id: 1, name: 'Test User', email: dto.email, password: hashedPassword, roleId: dto.roleId, isValid: true };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(null);
    when(repositoryMock.isValidRole(dto.roleId)).thenResolve(true);
    when(encryptionServiceMock.hash(dto.password)).thenResolve(hashedPassword);
    when(repositoryMock.create(anything())).thenResolve(user);

    await useCase.execute(dto);

    verify(encryptionServiceMock.hash(dto.password)).once();
  });

});
