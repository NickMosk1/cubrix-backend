import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Cubrix API - LEGO магазин')
    .setDescription('Документация API для интернет-магазина LEGO')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Авторизация', 'Эндпоинты для регистрации и входа')
    .addTag('Пользователи', 'Управление пользователями (только для админов)')
    .addTag('Приложение', 'Общая информация о приложении')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Приложение запущено на http://localhost:${port}`);
  console.log(`📚 Документация Swagger: http://localhost:${port}/docs`);
  console.log(`❤️ Health check: http://localhost:${port}/health`);
  console.log(`PhpMyAdmin: http://localhost:8080/`);
}
bootstrap();
