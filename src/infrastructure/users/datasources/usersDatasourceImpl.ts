import { injectable } from 'tsyringe';
import { CreateUsersDto } from '../../../domain/users/dtos/CreateUsersDto';
import { UsersEntity } from '../../../domain/users/entities/users.entity';
import { UsersRepository } from '../../../domain/users/repositories/users.repository';
import Database from '../../../infrastructure/database';

const pool = Database.getInstance().getPool();

@injectable()
export class UsersDatasourceImpl implements UsersRepository {
  async create(dto: CreateUsersDto): Promise<UsersEntity> {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, roleId)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, password, roleId, createdAt, updatedAt`,
      [dto.name, dto.email, dto.password, dto.roleId]
    );
    const user = result.rows[0];
    return new UsersEntity(
      user.id,
      user.name,
      user.email,
      user.password,
      user.roleid,
      user.createdat || user.createdAt,
      user.updatedat || user.updatedAt
    );
  }

  async findByEmail(email: string): Promise<UsersEntity | null> {
    const result = await pool.query(
      `SELECT id, name, email, password, roleId, createdAt, updatedAt FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];
    return user
      ? new UsersEntity(
          user.id,
          user.name,
          user.email,
          user.password,
          user.roleid,
          user.createdat || user.createdAt,
          user.updatedat || user.updatedAt
        )
      : null;
  }

  async findById(id: number): Promise<UsersEntity | null> {
    const result = await pool.query(
      `SELECT id, name, email, password, roleId, createdAt, updatedAt FROM users WHERE id = $1`,
      [id]
    );
    const user = result.rows[0];
    return user
      ? new UsersEntity(
          user.id,
          user.name,
          user.email,
          user.password,
          user.roleid,
          user.createdat || user.createdAt,
          user.updatedat || user.updatedAt
        )
      : null;
  }

  async isValidRole(roleId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM roles WHERE id = $1`,
      [roleId]
    );
    return result.rows.length > 0;
  }
}
