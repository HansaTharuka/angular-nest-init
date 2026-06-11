import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExportModule } from './export/export.module';
import { LoggingModule } from './logging/logging.module';
import { CorrelationIdMiddleware } from './logging/correlation-id.middleware';

@Module({
  imports: [AuthModule, ExportModule, LoggingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
