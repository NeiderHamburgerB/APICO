import { Request, Response, NextFunction } from 'express';
import { AssignRoute } from '../../../domain/routes/use-cases/AssignRoute';
import { inject, injectable } from 'tsyringe';
import { AssignRouteSchema } from '../../../domain/routes/dtos/AssignRouteDto';

@injectable()
export class AssignRouteController {
  constructor(
    @inject('AssignRoute') private readonly useCase: AssignRoute
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { routeId } = req.params;
      const validatedData = AssignRouteSchema.parse(req.body);
      const result = await this.useCase.execute(validatedData, Number(routeId));
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }
}
