'use strict';
const db = uniCloud.database();
const vkPay = require("vk-uni-pay");
const dbCmd = db.command;

exports.main = async (event, context) => {
  const { 
    user_id,        // 用户ID（用于记录）
    amount,         // 转账金额（单位：分）
    _id,    // 提现记录ID
    // user_name = '', // 真实姓名（大额转账必填）
    remark = '账户提现' // 转账备注
  } = event;
console.log(user_id);
  try {
 
    const transferRes = await vkPay.transfer({
      provider: "wxpay",
      out_bill_no: _id || `TX${Date.now()}`,
      transfer_amount: amount,
      openid: user_id,
      user_name: amount >= 200000 ? user_name : undefined, // 超过2000元需实名
      transfer_remark: remark,
      transfer_scene_id: "1005", // 业务场景ID
      user_recv_perception: "劳务报酬",
      transfer_scene_report_infos: [
        {
          info_type: "岗位类型",
          info_content: "陪诊师"
        },
		{
		  info_type: "报酬说明",
		  info_content: "完成订单"
		}
      ]
    });
console.log("transferRes",transferRes)
    // 2. 处理成功结果
    if (transferRes.code === 0) {
      await db.collection('withdraw_records').doc(_id).update({
        status: transferRes.result.state,
        out_bill_no: transferRes.result.out_bill_no,
		transfer_bill_no:transferRes.result.transfer_bill_no,
        update_time: transferRes.result.create_time,
		options:transferRes.options
		
      });

      return {
        code: 200,
        msg: transferRes.msg,
        data: {
          options:transferRes.options,
		  out_bill_no:transferRes.result.out_bill_no
        }
      };
    } else {
      throw new Error(transferRes.message || '转账提交失败');
	  await db.collection('withdraw_records').doc(_id).update({
	    status: 'FAILED',
	    error_msg: e.message,
	    update_time: Date.now()
	  });
    }

  } catch (e) {
    // 3. 错误处理
    console.error('提现失败:', e);

    await db.collection('withdraw_records').doc(_id).update({
      status: 'FAILED',
      error_msg: e.message,
      update_time: Date.now()
    });

    return { 
      code: 500, 
      msg: '提现失败: ' + e.message,
      ...(process.env.NODE_ENV === 'development' && { stack: e.stack })
    };
  }
};