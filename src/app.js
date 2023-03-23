import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import useragent from 'express-useragent';
import router from './routes/router';
import globalErrorHandler from './utils/errors/globalErrorHandler';
import sendMessage from './utils/responses/sendMessage';

const app = express();

// Middleware
app.use(json());
app.use(cors());
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'));
app.use(useragent.express());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// security
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 50,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      message: 'Too many request created from this IP, please try again after one minute',
    },
  })
);
app.use(helmet());
app.use(hpp());
app.set('trust proxy', 1);

// Router
app.get('/', (req, res, next) => {
  sendMessage(res, 'Welcome to node app :), Build by Morol');
});
app.use('/api/v1', router);
app.get('/docs', (req, res) => {
  res.redirect(''); // set your api dcos link
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
