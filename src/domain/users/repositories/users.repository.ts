import { CreateUsersDto } from '../dtos/CreateUsersDto';
import { UsersEntity } from '../entities/users.entity';

export abstract class UsersRepository {
  abstract create(dto: CreateUsersDto): Promise<UsersEntity>;
  abstract findByEmail(email: string): Promise<UsersEntity | null>;
  abstract findById(id: number): Promise<UsersEntity | null>;
  abstract isValidRole(roleId: number): Promise<boolean>;
  abstract isCarrierAvailable(carrierId: number): Promise<boolean>;
  abstract updateStatus(dto: { id: number; isAvailable: boolean }): Promise<UsersEntity>;
  abstract areAllOrdersDelivered(carrierId: number): Promise<boolean>;
}
