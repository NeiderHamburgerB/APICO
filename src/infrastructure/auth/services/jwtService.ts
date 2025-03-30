import { injectable } from 'tsyringe';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { ITokenService } from '../../../domain/auth/contracts/ITokenService';

@injectable()
export class JwtService implements ITokenService  {
    private readonly secretKey: Secret;
    private readonly expiresIn: SignOptions["expiresIn"];
  
    constructor() {
      this.secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
      const expiresInEnv = process.env.JWT_EXPIRES_IN;
      if (expiresInEnv && !isNaN(Number(expiresInEnv))) {
        this.expiresIn = Number(expiresInEnv);
      } else {
        this.expiresIn = '4h';
      }
    }
  
    generateToken(payload: object): string {
      const options: SignOptions = { expiresIn: this.expiresIn };
      return jwt.sign(payload, this.secretKey, options);
    }
  
    verifyToken(token: string): any {
      try {
        return jwt.verify(token, this.secretKey);
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    }
}

