import { writeFileSync } from 'node:fs';
import { createApp } from './create-app';

async function bootstrap() {
  const { app, document } = await createApp(true);
  writeFileSync('./docs/ditto-api.json', JSON.stringify(document, null, 2));
  await app.close();
  console.log('ditto-api.json generated.');
}
bootstrap();
