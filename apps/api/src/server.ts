import { createApp } from './app';
import { logger } from './infra/logger';

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  logger.info({ port }, 'API escuchando');
});
