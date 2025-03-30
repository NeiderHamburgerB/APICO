import { injectable, inject } from 'tsyringe';
import { CreateUsersDto } from '../../../domain/users/dtos/CreateUsersDto';
import { UsersEntity } from '../../../domain/users/entities/users.entity';
import { UsersRepository } from '../../../domain/users/repositories/users.repository';
import { UsersDatasourceImpl } from '../datasources/usersDatasourceImpl';

@injectable()
export class UsersRepositoryImpl extends UsersRepository {
  constructor(@inject(UsersDatasourceImpl) private datasource: UsersDatasourceImpl) {
    super();
  }

  async create(dto: CreateUsersDto): Promise<UsersEntity> {
    return this.datasource.create(dto);
  }

  async findByEmail(email: string): Promise<UsersEntity | null> {
    return this.datasource.findByEmail(email);
  }


  async findById(id: number): Promise<UsersEntity | null> {
    return this.datasource.findById(id);
  }

  async isValidRole(roleId: number): Promise<boolean> {
    return this.datasource.isValidRole(roleId);
  }
}
