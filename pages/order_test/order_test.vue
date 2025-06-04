<!-- <template>
  <view class="body">
    <button @click="createOrder(1)">支付1元</button>
    <button @click="createOrder(5)">支付5元</button>
	<button @click="test()">test</button>
  <uni-pay ref="pay" @create="onCreate" @success="onSuccess" @fail="onFail" :adpid="adpid"></uni-pay>
  </view>
</template>

<script>
import { encrypt } from '@/Utils/crypto.js'; // 使用别名更安全

export default {
  data() {
    return {
      user_id: "",
	  total_fee: 1, // 支付金额，单位分 100 = 1元
	  order_no: "", // 业务系统订单号（即你自己业务系统的订单表的订单号）
	  out_trade_no: "", // 插件支付单号
	  description: "测试订单", // 支付描述
	  type: "goods", // 支付回调类型 如 recharge 代表余额充值 goods 代表商品订单（可自定义，任意英文单词都可以，只要你在 uni-pay-co/notify/目录下创建对应的 xxx.js文件进行编写对应的回调逻辑即可）
	  //qr_code: true, // 是否强制使用扫码支付
	  openid:"", // 微信公众号需要
	  custom:{
	  	a: "a",
	  	b: 1
	  },
	  adpid: "1000000001", // uni-ad的广告位id
	  transaction_id:"", // 查询订单接口的查询条件
	  getOrderRes:{}, // 查询订单支付成功后的返回值
    }
  },
  onLoad() {
    this.user_id = uni.getStorageSync('uni_id');
	
	uni.login({
		provider: 'weixin',
		success: res => {
			console.log("结果",res)
			this.js_code = res.code
			uni.request({
				url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
				method: 'GET',
				data: {
					appid: 'wxf8afb6dce14d487a', //你的小程序的APPID
					secret: '06d3e5f2f7ed1bf8504fe90a1a1e04e5', //你的小程序秘钥secret,  
					js_code: this.js_code, //uni.login 登录成功后的code
					grant_type: 'authorization_code' //此处为固定值
				},
				success: (res) => {
					console.log('获取信息', res.data);
					this.openid = res.data.openid
					this.session_key = res.data.session_key
				}
			});
		}
	});
  },
  methods: {

	  onCreate(res){
	  	console.log('create: ', res);
	  	// 如果只是想生成支付二维码，不需要组件自带的弹窗，则在这里可以获取到支付二维码 qr_code_image
	  },
	  // 监听事件 - 支付成功
	  onSuccess(res){
	  	console.log('success: ', res);
	  	if (res.user_order_success) {
	  		// 代表用户已付款，且你自己写的回调成功并正确执行了
	  		 console.log('支付成功:', res);
	  		
	  	} else {
	  		// 代表用户已付款，但你自己写的回调执行失败（通常是因为你的回调代码有问题）
	  	 console.log('支付失败:', res);
	  	}
	  },
	  onFail(err){
	  	console.log('err: ', err)
	  },
	  
    // 创建订单
async createOrder(amount) {
  uni.showLoading({ title: '创建订单中' });
  
  try {
	  // 1. 创建业务订单
    const orderRes = await this.createBusinessOrder(amount);
    if (orderRes.success) {
		// 2. >>> 新增延迟任务调用 <<<
    const delayRes = await uniCloud.callFunction({
          name: 'delayCheckOrder', // 确保云函数名称一致
          data: {
            action: 'create',      // 明确操作类型
            order_no: orderRes.order_no,
            delay: 30 * 60 * 1000  // 30分钟延迟
          }
        });
        console.log('延迟任务创建结果:', delayRes); // 添加日志
		 console.log('订单创建结果:', orderRes); // 添加日志
      // 正常发起支付
      this.payOrder(orderRes.order_no, amount);
    }
  } catch (e) {
    uni.showToast({ title: '创建失败:' + e.message, icon: 'none' });
  } finally {
    uni.hideLoading();
  }
},
    
    // 创建业务订单
    async createBusinessOrder(amount) {
      const order_no = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const res = await uniCloud.callFunction({
        name: 'createOrder',
        data: {
          action: 'create',
          data: {
            order_no,
            user_id: this.user_id,
            amount,
            status: 'pending'
          }
        }
      });
      
      return res.result;
    },
    
    // 发起支付
// 修改后的 payOrder 方法
async payOrder(order_no, amount) {
  try {
    // 1. 更新为待支付状态
    const statusRes = await uniCloud.callFunction({
      name: 'updateOrderStatus',
      data: {
        order_no,
        from_status: 'unpaid',
        to_status: 'pending'
      }
    }); 
    if (!statusRes.result.success) {
      throw new Error('订单状态变更失败');
    }

    // 2. 准备支付参数
	console.log("openid为",this.openid)
    this.custom = {
      encryptedData: encrypt({ order_no, amount }) // 自定义数据
    };
	console.log("custom为",this.custom)
	
    // 3. 发起支付
	this.out_trade_no = `${this.order_no}-1`;//插件支付单号
	
    this.$refs.pay.createOrder({
	provider: 'wxpay', // 支付供应商
     total_fee: this.total_fee, // 支付金额，单位分 100 = 1元
     order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
     out_trade_no: this.out_trade_no, // 插件支付单号
     description: this.description, // 支付描述
     type:'goods', // 支付回调类型
     qr_code: this.qr_code, // 是否强制使用扫码支付
     openid: this.openid, // 微信公众号需要
     custom:this.custom, // 自定义数据
    });
  } catch (err) {
    uni.showToast({ title: err.message, icon: 'none'});
  }
},

  }
}
</script>

<style>
.body {
  padding: 20rpx;
}
button {
  margin: 20rpx 0;
}
</style> -->

<template>
	<view class="body">
		<button @click="createOrder(1)">支付1元</button>
		<button @click="createOrder(5)">支付5元</button>
	</view>
</template>

<script>
	import {
		encrypt
	} from '@/Utils/crypto.js'; // 使用别名更安全

	export default {
		data() {
			return {
				user_id: '',
				openid: ''
			};
		},
		onLoad() {
			uni.login({
				provider: 'weixin',
				success: res => {
					console.log("结果", res)
					this.js_code = res.code
					uni.request({
						url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
						method: 'GET',
						data: {
							appid: 'wxf8afb6dce14d487a', //你的小程序的APPID
							secret: '06d3e5f2f7ed1bf8504fe90a1a1e04e5', //你的小程序秘钥secret,  
							js_code: this.js_code, //uni.login 登录成功后的code
							grant_type: 'authorization_code' //此处为固定值
						},
						success: (res) => {
							console.log('获取信息', res.data);
							this.openid = res.data.openid
							this.session_key = res.data.session_key
						}
					});
				}
			});
		},
		methods: {

			async createOrder(amount) {
				uni.showLoading({
					title: '创建订单中...'
				});
				try {
					const order_no = `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
					const createRes = await uniCloud.callFunction({
						name: 'createOrder',
						data: {
							order_no,
							user_id: this.openid,
							status: 'unpaid',
							total_price: amount,
							client_time: new Date(),
						}
					});
					console.log('订单创建结果:', createRes); // 修正日志中的变量名

					// 无论支付是否成功，均跳转到订单详情页
					uni.navigateTo({
						url: `/pages/orderDetail/orderDetail?order_no=${order_no}`
					});

					// // 继续支付流程（即使跳转后也会在后台执行）
					// if (createRes.result.code === 200) {
					//   await this.payOrder(order_no, amount);
					// }
				} catch (e) {
					uni.showToast({
						title: '创建失败: ' + e.message,
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			async payOrder(order_no, amount) {
				try {
					// 1. 更新为待支付状态（仅在首次支付时需要）
					const statusRes = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no,
							from_status: 'unpaid',
							to_status: 'pending'
						}
					});
					if (!statusRes.result.success) {
						throw new Error('订单状态变更失败');
					}

					// 2. 准备支付参数
					const custom = {
						encryptedData: encrypt({
							order_no,
							amount
						})
					};
					const out_trade_no = `${order_no}-1`; // 插件支付单号

					// 3. 发起支付（使用 uni-app 的支付插件）
					const payParams = {
						provider: 'wxpay',
						order_info: {
							openid: this.openid,
							amount: amount * 1, // 单位转为分
							out_trade_no,
							description: '商品支付',
							custom
						}
					};

					// 4. 调用支付（示例使用 uni-app 的支付插件）
					const res = await uni.requestPayment(payParams);
					if (res.result == 'success') {
						// 支付成功后更新状态
						await uniCloud.callFunction({
							name: 'updateOrderStatus',
							data: {
								order_no,
								from_status: 'pending',
								to_status: 'paid'
							}
						});
					}
				} catch (err) {
					throw new Error('支付失败: ' + err.message);
				}
			}


		}
	};
</script>
<style>
	body {
		margin-top: 200px;
	}
</style>