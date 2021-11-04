import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import AppModules from '@modules';
import { useContainer } from 'class-validator';
import GlobalExceptionHandler from './exception';

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

process.on('uncaughtException', (reason) => {
  console.error(reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModules);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  useContainer(app.select(AppModules), { fallbackOnErrors: true });
  app.useGlobalFilters(new GlobalExceptionHandler());
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  console.log(`App listening on http://localhost:${PORT}`);
}
bootstrap();
