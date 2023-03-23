const sendResponse = (res, message, data, status) => {
  res.status(status ? status : 200).json({
    status: 'ok',
    message,
    data,
  });
};

module.exports = sendResponse;
