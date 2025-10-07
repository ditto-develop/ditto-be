import { SwaggerModule } from '@nestjs/swagger';
import { createApp } from './create-app';

async function bootstrap() {
  const { app, document } = await createApp();
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
