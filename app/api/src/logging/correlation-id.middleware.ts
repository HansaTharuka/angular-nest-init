import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger } from './custom.logger';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      req.headers['x-correlation-id'] || req.headers['x-request-id'] || uuidv4();

    (global as any).correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    this.logger.log('Incoming Request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      correlationId,
    });

    res.on('finish', () => {
      this.logger.log('Outgoing Response', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        correlationId,
      });
    });

    next();
  }
}
