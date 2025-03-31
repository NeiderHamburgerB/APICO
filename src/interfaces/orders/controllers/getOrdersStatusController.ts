import { Request, Response, NextFunction } from 'express';
import { inject } from 'tsyringe';
import { injectable } from 'tsyringe';
import { GetOrderStatus } from '../../../domain/orders/use-cases/GetOrdersStatus';

@injectable()
export class GetOrdersStatusController {
  constructor(
    @inject('GetOrderStatus') private readonly useCase: GetOrderStatus
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code;
      const result = await this.useCase.execute(code);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
