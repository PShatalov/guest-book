import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JsonObjectBodyPipe } from './common/pipes/json-object-body.pipe';
import { configureSessionMiddleware } from './common/session/configure-session.middleware';
import type { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  app.use(helmet());

  const corsOrigin = configService.get('corsOrigin', { infer: true });
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });
  }

  const sessionSecret = configService.get('sessionSecret', { infer: true });
  if (sessionSecret) {
    configureSessionMiddleware(app);
  }

  app.useGlobalPipes(
    new JsonObjectBodyPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Guest Book API')
    .setDescription('Guestbook REST API')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  for (const schemaName of [
    'RegisterRequestDto',
    'LoginRequestDto',
    'CreateMessageRequestDto',
    'UpdateMessageRequestDto',
  ]) {
    const schema = document.components?.schemas?.[schemaName];
    if (schema && typeof schema === 'object' && 'properties' in schema) {
      schema.additionalProperties = false;
    }
  }
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('port', { infer: true });
  await app.listen(port);
}

void bootstrap();
