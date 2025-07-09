// uniCloud/cloudfunctions/getEncryptKey/index.js
'use strict';
const db = uniCloud.database();

exports.main = async (event) => {
  // 实际项目应从数据库获取动态密钥
  const keyRecord = await db.collection('encrypt_keys')
    .where({ status: 'active' })
    .limit(1)
    .get();
    
  return {
    key: keyRecord.data[0]?.value || 'fallback_key_32bytes_placeholder',
    keyId: keyRecord.data[0]?._id
  };
};