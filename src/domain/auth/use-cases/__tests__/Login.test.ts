import 'reflect-metadata';
import { mock, instance, when, verify, reset, anything, deepEqual } from 'ts-mockito';
import { Login } from '../Login';
import { UsersRepository } from '../../../users/repositories/users.repository';
import { IEncryptionService } from '../../contracts/IEncryptionService';
import { ITokenService } from '../../contracts/ITokenService';
import { LoginDto } from '../../dtos/LoginDto';
import { UsersEntity } from '../../../users/entities/users.entity';

describe('Login Use Case', () => {
  let useCase: Login;
  let repositoryMock: UsersRepository;
  let encryptionServiceMock: IEncryptionService;
  let tokenServiceMock: ITokenService;

  beforeEach(() => {
    repositoryMock = mock<UsersRepository>();
    encryptionServiceMock = mock<IEncryptionService>();
    tokenServiceMock = mock<ITokenService>();

    useCase = new Login(
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

  it('debería generar un token JWT correctamente', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user: UsersEntity = {
      id: 1,
      email: dto.email,
      password: 'hashedPassword',
      roleId: 1,
      name: 'Test User',
      isValid: true
    };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(user);
    when(encryptionServiceMock.compare(dto.password, user.password)).thenResolve(true);
    when(tokenServiceMock.generateToken(deepEqual({ userId: user.id, email: user.email }))).thenReturn('validToken');

    const result = await useCase.execute(dto);

    expect(result.token).toBe('validToken');
    verify(tokenServiceMock.generateToken(deepEqual({ userId: user.id, email: user.email }))).once();
  });



  it('debería fallar si el usuario no existe', async () => {
    const dto: LoginDto = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(null);

    await expect(useCase.execute(dto)).rejects.toThrow('User not found');
    verify(repositoryMock.findByEmail(dto.email)).once();
    verify(encryptionServiceMock.compare(dto.password, anything())).never();
    verify(tokenServiceMock.generateToken(anything())).never();
  });

  it('debería fallar si la contraseña es inválida', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'invalidPassword',
    };

    const user: UsersEntity = {
      id: 1,
      email: dto.email,
      password: 'hashedPassword',
      roleId: 1,
      name: 'Test User',
      isValid: true
    };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(user);
    when(encryptionServiceMock.compare(dto.password, user.password)).thenResolve(false);

    await expect(useCase.execute(dto)).rejects.toThrow('User not found or invalid password');
    verify(repositoryMock.findByEmail(dto.email)).once();
    verify(encryptionServiceMock.compare(dto.password, user.password)).once();
    verify(tokenServiceMock.generateToken(anything())).never();
  });

  it('debería generar un token JWT correctamente', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user: UsersEntity = {
      id: 1,
      email: dto.email,
      password: 'hashedPassword',
      roleId: 1,
      name: 'Test User',
      isValid: true
    };

    when(repositoryMock.findByEmail(dto.email)).thenResolve(user);
    when(encryptionServiceMock.compare(dto.password, user.password)).thenResolve(true);
    when(tokenServiceMock.generateToken(anything())).thenReturn('validToken');

    const result = await useCase.execute(dto);

    expect(result.token).toBe('validToken');
    verify(tokenServiceMock.generateToken(anything())).once();
  });

});
