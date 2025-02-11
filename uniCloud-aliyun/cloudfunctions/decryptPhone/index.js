'use strict';
const crypto = require('crypto');

class WXBizDataCrypt {
  constructor(appId, sessionKey) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }

  decryptData(encryptedData, iv) {
    const sessionKey = Buffer.from(this.sessionKey, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, Buffer.from(iv, 'base64'));
    decipher.setAutoPadding(true);
    let decoded = decipher.update(Buffer.from(encryptedData, 'base64'), 'binary', 'utf8');
    decoded += decipher.final('utf8');
    const data = JSON.parse(decoded);
    if (data.watermark.appid !== this.appId) {
      throw new Error('Invalid appid in watermark');
    }
    return data;
  }
}

exports.main = async function(event, context) {
  const { encryptedData, iv, session_key } = event;
  const appId = '你的小程序 appId';
  const pc = new WXBizDataCrypt(appId, session_key);

  try {
    const data = pc.decryptData(encryptedData, iv);
    return { success: true, phoneNumber: data.phoneNumber };
  } catch (err) {
    return { success: false, error: '解密失败' };
  }
};
