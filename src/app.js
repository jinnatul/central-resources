import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/router';
import globalErrorHandler from './utils/errors/globalErrorHandler';
import sendMessage from './utils/responses/sendMessage';

const app = express();

// Middleware
app.use(json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));

// Router
app.get('/', (req, res, next) => {
  sendMessage(res, 'Welcome to node app :), Build by Morol');
});
app.use('/api/v1', router);
app.get('/docs', (req, res) => {
  res.redirect('');
});
app.all('*', (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.statusCode = 404;
  error.flag = true;
  return next(error);
});

// Error handler
app.use(globalErrorHandler);

export default app;
