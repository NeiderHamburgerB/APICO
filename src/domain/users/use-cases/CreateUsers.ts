import { injectable, inject } from 'tsyringe';
import { CreateUsersDto } from '../dtos/CreateUsersDto';
import { UsersEntity } from '../entities/users.entity';
import { UsersRepository } from '../repositories/users.repository';
import { IEncryptionService } from '../../../domain/auth/contracts/IEncryptionService';
import { ITokenService } from '../../../domain/auth/contracts/ITokenService';

export interface CreateUsersUseCase {
  execute(dto: CreateUsersDto): Promise<{ user: UsersEntity; token: string }>;
}

@injectable()
export class CreateUsers implements CreateUsersUseCase {
  constructor(
    @inject('UsersRepository') private readonly repository: UsersRepository,
    @inject('IEncryptionService') private readonly encryptionService: IEncryptionService,
    @inject('ITokenService') private readonly tokenService: ITokenService
  ) {}

  async execute(dto: CreateUsersDto): Promise<{ user: UsersEntity; token: string }> {
    // Validar que el email no exista
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validar que el rol sea válido
    const roleValid = await this.repository.isValidRole(dto.roleId);
    if (!roleValid) {
      throw new Error('Invalid role');
    }

    // Encriptar la contraseña
    const hashedPassword = await this.encryptionService.hash(dto.password);

    // Crear el usuario
    const newUserDto = { ...dto, password: hashedPassword };
    const user = await this.repository.create(newUserDto);

    // Generar token JWT
    const token = this.tokenService.generateToken({ userId: user.id, email: user.email, roleId: user.roleId });
    return { user, token };
  }
}
