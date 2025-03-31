import { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '../../../domain/auth/dtos/LoginDto';
import { inject, injectable } from 'tsyringe';
import { Login } from '../../../domain/auth/use-cases/Login';

@injectable() 
export class LoginController {
  constructor(
    @inject('Login') private readonly useCase: Login
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await this.useCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);  
    }
  }
}
