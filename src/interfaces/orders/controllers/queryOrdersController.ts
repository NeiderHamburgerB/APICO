import { Request, Response, NextFunction } from 'express';
import { QueryOrders } from '../../../domain/orders/use-cases/QueryOrders';
import { inject, injectable } from 'tsyringe';
import { QueryOrdersSchema } from '../../../domain/orders/dtos/QueryOrdersDto';

@injectable()
export class QueryOrdersController {
  constructor(
    @inject('QueryOrders') private readonly useCase: QueryOrders
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = QueryOrdersSchema.parse(req.query);
      const result = await this.useCase.execute(parsedData);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
