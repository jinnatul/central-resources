const { Router } = require('express');
const authRouter = require('./authRouter');

const router = Router();

router.use('/auth', authRouter);

module.exports = router;
