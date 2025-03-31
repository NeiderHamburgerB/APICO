import { Request, Response, NextFunction } from 'express';
import { UpdateOrderStatus } from '../../../domain/orders/use-cases/UpdateOrderStatus';
import { inject, injectable } from 'tsyringe';
import { UpdateOrderStatusSchema } from '../../../domain/orders/dtos/UpdateOrderStatusDto';

@injectable()
export class UpdateOrderStatusController {
  constructor(
    @inject('UpdateOrderStatus') private readonly useCase: UpdateOrderStatus
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const validatedData = UpdateOrderStatusSchema.parse(req.body);
      const result = await this.useCase.execute(validatedData, Number(orderId));
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
