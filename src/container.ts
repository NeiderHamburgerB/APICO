import 'reflect-metadata';
import { container } from 'tsyringe';
import { UsersRepository } from './domain/users/repositories/users.repository';
import { IEncryptionService } from './domain/auth/contracts/IEncryptionService';
import { ITokenService } from './domain/auth/contracts/ITokenService';
import { UsersRepositoryImpl } from './infrastructure/users/repositories/usersRepositoryImpl';
import { BcryptService } from './infrastructure/auth/services/brcyptService';
import { JwtService } from './infrastructure/auth/services/jwtService';
import { CreateUsers } from './domain/users/use-cases/CreateUsers';
import { Login } from './domain/auth/use-cases/Login';


//USERS
container.register<CreateUsers>('CreateUsers', { useClass: CreateUsers });
container.register<UsersRepository>('UsersRepository', { useClass: UsersRepositoryImpl });

//AUTH
container.register<Login>('Login', { useClass: Login });



//SERVICES
container.register<IEncryptionService>('IEncryptionService', { useClass: BcryptService });
container.register<ITokenService>('ITokenService', { useClass: JwtService });


export { container };
