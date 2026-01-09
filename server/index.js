
import express from 'express';

const app = express();

// Import your routes
import('../server/routes.ts').then(({ default: routes }) => {
  app.use('/api', routes);
});

export default app;
