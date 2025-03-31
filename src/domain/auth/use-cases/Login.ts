import { UsersRepository } from '../../users/repositories/users.repository';
import { IEncryptionService } from '../contracts/IEncryptionService';
import { ITokenService } from '../contracts/ITokenService';
import { LoginDto } from '../dtos/LoginDto';
import { AuthEntity } from '../entities/auth.entity';
import { inject, injectable } from 'tsyringe';
export interface LoginUseCase {
  execute(dto: LoginDto): Promise<AuthEntity>;
}
@injectable()
export class Login implements LoginUseCase {
  constructor(
    @inject('UsersRepository') private readonly repository: UsersRepository,
    @inject('IEncryptionService') private readonly encryptionService: IEncryptionService,
    @inject('ITokenService') private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginDto): Promise<any> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await this.encryptionService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('User not found or invalid password');
    }
    const token = this.tokenService.generateToken({ userId: user.id, email: user.email, roleId: user.roleId });
    return { token };
  }
}
