const cloud = require('wx-server-sdk')
const axios = require('axios')
const crypto = require('crypto')
const xml2js = require('xml2js')

cloud.init()

// 微信支付配置（测试环境硬编码，生产环境请改用环境变量）
const config = {
  appId: 'wxf8afb6dce14d487a',
  mchId: '1711967249',
  apiKey: 'Epwy9402123456789012345678901940',
  notifyUrl: 'https://fc-mp-499e2a37-0c77-418a-82aa-3e5820ecb057.next.bspapp.com/uni-pay-co'
}

// 增强的签名生成函数
function generateSignature(params, key) {
  const filtered = Object.entries(params)
    .filter(([k, v]) => v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  const stringA = filtered.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const stringSignTemp = `${stringA}&key=${key}`
  
  return crypto
    .createHash('md5')
    .update(stringSignTemp)
    .digest('hex')
    .toUpperCase()
}

// 改进的XML处理函数（带错误捕获）
async function buildXml(params) {
  try {
    const builder = new xml2js.Builder({
      rootName: 'xml',
      headless: true,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    })
    return builder.buildObject(params)
  } catch (e) {
    console.error('[XML构建失败]', e)
    throw new Error('参数格式错误')
  }
}

async function parseXml(xml) {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      explicitRoot: false
    })
    return parser.parseStringPromise(xml)
  } catch (e) {
    console.error('[XML解析失败]', { xml, error: e })
    throw new Error('微信响应解析异常')
  }
}

exports.main = async (event) => {
  try {
    // 参数校验（增强版）
    const requiredParams = ['order_no', 'amount', 'openid']
    const missingParams = requiredParams.filter(p => !(p in event))
    if (missingParams.length > 0) {
      throw new Error(`缺少必要参数: ${missingParams.join(', ')}`)
    }

    // 构建请求参数（关键修正）
    const params = {
      appid: config.appId,
      mch_id: config.mchId,
      nonce_str: crypto.randomBytes(16).toString('hex'),
      body: '商品购买',
      out_trade_no: `${event.order_no}-${Date.now()}`,
      total_fee: Math.round(parseFloat(event.amount) * 100),
      spbill_create_ip: event.remoteAddress || '127.0.0.1',
      notify_url: config.notifyUrl,
      trade_type: 'JSAPI',
      openid: event.openid,
      attach: '附加信息'
    }

    // 生成签名（核心修正）
    params.sign = generateSignature(params, config.apiKey)

    // 发送请求（带超时控制）
    const response = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      buildXml(params),
      {
        headers: { 'Content-Type': 'application/xml' },
        timeout: 10000, // 延长超时时间
        responseType: 'text' // 明确指定响应类型
      }
    )

    // 调试输出原始响应
    console.log('[微信原始响应]', response.data)

    // 解析响应（关键修正）
    const result = await parseXml(response.data)
    
    // 错误处理（增强版）
    if (result.return_code !== 'SUCCESS') {
      throw new Error(`微信返回错误: ${result.return_msg || '未知错误'}`)
    }
    if (result.result_code !== 'SUCCESS') {
      throw new Error(`业务错误: ${result.err_code_des || '参数错误'}`)
    }

    // 返回支付参数（关键修正）
    return {
      appId: config.appId,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      package: `prepay_id=${result.prepay_id}`,
      signType: 'MD5',
      paySign: generateSignature(
        { ...params, prepay_id: result.prepay_id },
        config.apiKey
      )
    }

  } catch (error) {
    console.error('[支付异常]', {
      error: error.stack,
      request: event,
      response: error.response ? error.response.data : null
    })
    throw new Error(error.message || '支付请求失败')
  }
}