const CryptoJS = require('crypto-js');

const encryptKey = process.env.ENCRYPT_KEY;
if (!encryptKey) {
  throw new Error('致命错误: ENCRYPT_KEY 环境变量未设置，请在 .env 文件中配置');
}

const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, encryptKey).toString();
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  const bytes = CryptoJS.AES.decrypt(encryptedText, encryptKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const maskPhone = (phone) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const maskName = (name) => {
  if (!name || name.length === 0) return name;
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 15) return idCard;
  return idCard.replace(/(\d{6})\d{8,11}(\d{3,4})/, '$1********$2');
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return name[0] + '***@' + domain;
  return name[0] + '***' + name[name.length - 1] + '@' + domain;
};

module.exports = {
  encrypt,
  decrypt,
  maskPhone,
  maskName,
  maskIdCard,
  maskEmail
};
