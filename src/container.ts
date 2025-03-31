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
import { OrdersRepositoryImpl } from './infrastructure/orders/repositories/ordersRepositoryImpl';
import { OrdersRepository } from './domain/orders/repositories/orders.repository';
import { CreateOrders } from './domain/orders/use-cases/CreateOrders';
import { AddressValidatorService } from './infrastructure/orders/services/addressValidatorService';
import { IAddressValidator } from './domain/orders/contracts/IAddressValidator';
import { RoutesRepository } from './domain/routes/repositories/routes.repository';
import { RoutesRepositoryImpl } from './infrastructure/routes/repositories/routesRepositoryImpl';
import { AssignRoute } from './domain/routes/use-cases/AssignRoute';
import { ICacheService } from './domain/orders/contracts/ICache';
import { RedisCacheService } from './infrastructure/cache/redisClient';
import { GetOrderStatus } from './domain/orders/use-cases/GetOrdersStatus';
import { AssignCarrier } from './domain/routes/use-cases/AssignCarrier';
import { UpdateOrderStatus } from './domain/orders/use-cases/UpdateOrderStatus';
import { QueryOrders } from './domain/orders/use-cases/QueryOrders';

//USERS
container.register<CreateUsers>('CreateUsers', { useClass: CreateUsers });
container.register<UsersRepository>('UsersRepository', { useClass: UsersRepositoryImpl });

//AUTH
container.register<Login>('Login', { useClass: Login });

//ORDERS
container.register<CreateOrders>('CreateOrders', { useClass: CreateOrders });
container.register<OrdersRepository>('OrdersRepository', { useClass: OrdersRepositoryImpl });
container.register<GetOrderStatus>('GetOrderStatus', { useClass: GetOrderStatus });
container.register<UpdateOrderStatus>('UpdateOrderStatus', { useClass: UpdateOrderStatus });
container.register<QueryOrders>('QueryOrders', { useClass: QueryOrders });

//ROUTES
container.register<AssignRoute>('AssignRoute', { useClass: AssignRoute });
container.register<AssignCarrier>('AssignCarrier', { useClass: AssignCarrier });
container.register<RoutesRepository>('RoutesRepository', { useClass: RoutesRepositoryImpl });

//SERVICES
container.register<IEncryptionService>('IEncryptionService', { useClass: BcryptService });
container.register<ITokenService>('ITokenService', { useClass: JwtService });
container.register<IAddressValidator>('IAddressValidator', { useClass: AddressValidatorService });
container.register<ICacheService>('ICacheService', { useClass: RedisCacheService });

export { container };
