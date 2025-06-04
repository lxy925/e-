'use strict';
// 5. 支付成功处理
console.log('支付成功回调:', paymentRes);
this.transactionId = paymentRes.transactionId;
const successTime = uni.$u.timeFormat(
	parseInt(validatedParams.timeStamp) * 1000,
	'yyyy-mm-dd hh:MM:ss'
);

// 6. 提交支付信息到后端
await this.$api.postInsertWeChatPayInfo({
	order_no: order_no,
	payment_time: successTime,
	transaction_id: paymentRes.transaction_id // 微信订单号
});

// 7. 更新订单状态
const updateRes = await uniCloud.callFunction({
	name: 'updateOrderStatus',
	data: {
		order_no: order_no,
		from_status: 'pending',
		to_status: 'paid'
	}
});