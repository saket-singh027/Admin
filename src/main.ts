import { NestFactory, Reflector } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AUTH_SERVICE_NAME } from './generated/auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AdminModule);
    
    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Admin API')
      .setDescription('The Admin API description')
      .setVersion('1.0')
      .addTag('admin')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Start the HTTP server
    const httpPort = process.env.HTTP_PORT || '3002';
    await app.listen(httpPort);
    console.log(`Application is running on: http://localhost:${httpPort}`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap();
