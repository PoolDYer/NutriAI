import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // Allow frontend
    await app.listen(3000);
    console.log('NutriAI Backend is running on http://localhost:3000');
}
bootstrap();
