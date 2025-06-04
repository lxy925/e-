import CryptoJS from 'crypto-js';

/**
 * AES加密（支持对象自动JSON序列化）
 * @param {Object|String} data 要加密的数据
 * @param {String} key 32位密钥（可选）
 */
export function encrypt(data, key = 'default_key_placeholder_32bytes') {
  try {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      dataStr,
      CryptoJS.enc.Utf8.parse(key.substring(0, 32)),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return encrypted.toString();
  } catch (e) {
    console.error('加密失败:', e);
    throw new Error('数据加密处理失败');
  }
}

/**
 * AES解密
 */
export function decrypt(encrypted, key) {
  const bytes = CryptoJS.AES.decrypt(
    encrypted,
    CryptoJS.enc.Utf8.parse(key.substring(0, 32))
  );
  try {
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// 可选：添加便捷方法
export default {
  encrypt,
  decrypt,
  encryptObject: encrypt,
  decryptToObject: (encrypted, key) => JSON.parse(decrypt(encrypted, key))
};