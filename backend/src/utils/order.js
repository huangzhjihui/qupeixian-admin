const dayjs = require('dayjs');

const generateOrderNo = () => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QP${timestamp}${random}`;
};

const generateAfterSaleNo = () => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AS${timestamp}${random}`;
};

module.exports = { generateOrderNo, generateAfterSaleNo };
