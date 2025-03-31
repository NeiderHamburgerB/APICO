import { injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { IEncryptionService } from '../../../domain/auth/contracts/IEncryptionService';

@injectable()
export class BcryptService implements IEncryptionService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
