export default {
	// 微信支付相关 API
	async postInsertWeChatPayInfo(data) {
		return uniCloud.callFunction({
			name: 'postInsertWeChatPayInfo',
			data: data
		});
	},

};