'use strict';
const db = uniCloud.database();

// 新建 test-uni-pay 云函数
exports.main = async () => {
  const uniPay = uniCloud.importObject('uni-pay');
  console.log("nihao",uniPay)
  return {
    isFunction: typeof uniPay.transfer === 'function',
    config: uniCloud.getConfig()
  };
}