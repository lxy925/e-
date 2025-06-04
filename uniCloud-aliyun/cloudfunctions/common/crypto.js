// common/crypto.js
const CryptoJS = require('crypto-js');

// AES加密
function encrypt(data, key = '12345678901234561234567890123456') {
  const dataStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(
    dataStr, 
    CryptoJS.enc.Utf8.parse(key.substring(0, 32)), 
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  return encrypted.toString();
}

// AES解密
function decrypt(encrypted, key = '12345678901234561234567890123456') {
  const decrypt = CryptoJS.AES.decrypt(
    encrypted,
    CryptoJS.enc.Utf8.parse(key.substring(0, 32)),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

module.exports = {
  encrypt,
  decrypt
};