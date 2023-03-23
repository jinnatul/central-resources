const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const useragent = require('express-useragent');
const router = require('./routes/router');
const globalErrorHandler = require('./utils/errors/globalErrorHandler');
const sendMessage = require('./utils/responses/sendMessage');

const app = express();

// Middleware
app.use(express.json());
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

module.exports = app;
