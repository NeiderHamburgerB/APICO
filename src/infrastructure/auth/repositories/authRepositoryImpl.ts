import { AuthRepository } from '../../../domain/auth/repositories/auth.repository';
import { injectable } from 'tsyringe';

@injectable()
export class AuthRepositoryImpl extends AuthRepository {}
