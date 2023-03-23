const sendData = (res, data, status) => {
  res.status(status ? status : 200).json({
    status: 'ok',
    data,
  });
};

module.exports = sendData;
