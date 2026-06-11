import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLogger } from './logging/custom.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new CustomLogger();
  logger.setContext('NestFactory');

  // Use custom logger
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  app.setGlobalPrefix('api');

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('CompAI API')
    .setDescription('CompAI Backend API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`NestJS backend listening on http://localhost:${port}/api`, {
    port,
  });
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, {
    docsUrl: `http://localhost:${port}/api/docs`,
  });
}

bootstrap().catch((err) => {
  const logger = new CustomLogger();
  logger.error('Bootstrap failed', err.stack, { error: err });
});
