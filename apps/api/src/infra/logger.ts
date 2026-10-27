import pino from 'pino';

// §11 y RNF-11: nunca registrar contraseñas, tokens ni cookies.
// Los campos de tarjeta se agregan junto con la integración de Mercado Pago (Fase 4).
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      '*.refreshToken',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[redactado]',
  },
});
