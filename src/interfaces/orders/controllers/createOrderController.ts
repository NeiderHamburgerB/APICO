import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { CreateOrders } from '../../../domain/orders/use-cases/CreateOrders';
import { createOrdersSchema } from '../../../domain/orders/dtos/CreateOrdersDto';

@injectable()
export class CreateOrderController {
  constructor(
    @inject('CreateOrders') private readonly useCase: CreateOrders
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createOrdersSchema.parse(req.body);
      const result = await this.useCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
