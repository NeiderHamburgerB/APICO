import { Request, Response } from 'express';
import { AssignCarrier } from '../../../domain/routes/use-cases/AssignCarrier';
import { NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { AssignCarrierSchema } from '../../../domain/routes/dtos/AssignCarrierDto';

@injectable()
export class AssignCarrierController {
  constructor(
    @inject('AssignCarrier') private readonly useCase: AssignCarrier
  ) {}
  
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { routeId } = req.params;
      const validatedData = AssignCarrierSchema.parse(req.body);
      const result = await this.useCase.execute(validatedData, Number(routeId));
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
