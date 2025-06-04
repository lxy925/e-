const crypto = require('crypto') // 引入MD5加密模块
/**
 * 根据传入的参数对象以及密钥，经过处理以及加密, 生成并返回sing参数
 * @param {object} obj 参数组成的对象
 * @param {String} mchKey 商户平台设置设置的密钥
 * @returns 
 */
const getSign = (obj, mchKey) => {
  // 对传入的对象进行排序
  let arr = new Array();
  let num = 0;
  for (let i in obj) {
    arr[num] = i;
    num++;
  }
  let sortArr = arr.sort();
  let sortObj = {};
  for (let i in sortArr) {
    sortObj[sortArr[i]] = obj[sortArr[i]];
  }

  // 对传入的对象进行拼接
  let sortStr = ''
  sortArr.forEach(key => {
    sortStr += key + "=" + sortObj[key] + "&amp;"
  });
  // 减去最后一个参数的&amp;连接符
  // sortStr = sortStr.substring(0, sortStr.length - 1)
  // 拼接密钥
  sortStr += "key=" + mchKey
  // 使用MD5进行加密, 并将加密结果的英文字母全部转换成大写
  const sign = crypto.createHash('md5').update(sortStr, 'utf8').digest('hex').toUpperCase();
  return sign;
}

module.exports = {
  getSign: getSign
}
