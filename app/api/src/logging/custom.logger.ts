import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as dailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;
  private context: string = '';

  constructor() {
    const transports = [
      new winston.transports.Console(),
      new dailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new dailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ];

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'compai-api' },
      transports,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, meta?: Record<string, any>) {
    const correlationId = this.getCorrelationId();
    this.logger.info(message, {
      ...meta,
      context: this.context,
      correlationId,
      level: 'info',
    });
  }

  error(message: string, trace?: string, meta?: Record<string, any>) {
    const correlationId = this.getCorrelationId();
    this.logger.error(message, {
      ...meta,
      context: this.context,
      correlationId,
      trace,
      level: 'error',
    });
  }

  warn(message: string, meta?: Record<string, any>) {
    const correlationId = this.getCorrelationId();
    this.logger.warn(message, {
      ...meta,
      context: this.context,
      correlationId,
      level: 'warn',
    });
  }

  debug(message: string, meta?: Record<string, any>) {
    const correlationId = this.getCorrelationId();
    this.logger.debug(message, {
      ...meta,
      context: this.context,
      correlationId,
      level: 'debug',
    });
  }

  verbose(message: string, meta?: Record<string, any>) {
    const correlationId = this.getCorrelationId();
    this.logger.verbose(message, {
      ...meta,
      context: this.context,
      correlationId,
      level: 'verbose',
    });
  }

  private getCorrelationId(): string {
    // This will be populated by the correlation ID middleware
    return (global as any).correlationId || uuidv4();
  }
}
