import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { createUsersSchema } from '../../../domain/users/dtos/CreateUsersDto';
import { CreateUsers } from '../../../domain/users/use-cases/CreateUsers';

@injectable()
export class CreateUserController {

  constructor(
    @inject('CreateUsers') private readonly useCase: CreateUsers
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createUsersSchema.parse(req.body);
     const result = await this.useCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
