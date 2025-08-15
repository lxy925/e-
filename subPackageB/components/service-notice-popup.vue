<template>
	<view class="service-notice-popup" v-show="visible">
		<view class="popup-bg"></view>
		<view class="popup-content">
			<view class="popup-header">
				<text class="title">陪诊服务须知</text>
				<image src="https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/static/service_notice_popup/people.png" alt="" class="people_decorate"
					mode="widthFix" />
				<image src="https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/static/service_notice_popup/people_2.png" alt="" class="people_decorate_2"
					mode="widthFix" />
			</view>
			<view class="popup-body">
				<view class="notice-sessions"><text class="section-title">陪诊服务注意事项：</text></view>
				<view class="notice-item">
					<image class="icon icon-service" src="https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/static/service_notice_popup/service.png"
						mode="widthFix" />
					<view class="item-text">
						<text class="item-title">陪诊服务不退换费用的情况：</text>
						<text class="item-content">
							在陪诊服务开始之后，若患者未及时取消订单且因为个人原因无法到场。
						</text>
					</view>
				</view>

				<view class="notice-item">
					<image class="icon icon-refund" src="https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/static/service_notice_popup/refund.png"
						mode="widthFix" />
					<view class="item-text">
						<text class="item-title">陪诊服务仅退取部分费用的情况：</text>
						<text class="item-content">
							陪诊当天陪诊人及时取消服务，但挂号等相关费用医院无法退换。
						</text>
					</view>
				</view>
				<view class="notice-item">
					<image class="icon icon-register" src="https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/static/service_notice_popup/register.png"
						mode="widthFix" />
					<view class="item-text">
						<text class="item-title">帮挂号服务须知：</text>
						<text class="item-content">
							陪诊师根据陪诊人的要求帮忙代挂号，通过小程序上传凭证让陪诊人支付挂号费用，请及时在平台支付。
						</text>
					</view>
				</view>
				<button class="confirm-btn" @click="onConfirm">知道了</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				visible: false
			};
		},
		methods: {
			show() {
				this.visible = true;
			},
			onConfirm() {
				this.visible = false;
				this.$emit('confirm');
			}
		}
	};
</script>

<style scoped>
	.popup-body {
		/* width: 97%; */
		padding: 40rpx 45rpx;
		margin: 0 5rpx;
		border-radius: 30rpx;
		background-color: #ffffff;
	}

	.service-notice-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10001;
	}

	.popup-bg {
		width: 100%;
		height: 100%;
		background: linear-gradient(#80cf9c, rgb(246, 233, 192, 0.9));
		filter: blur(2rpx);
	}

	.popup-content {
		background: linear-gradient(#ddffec, white);
		background-color: #18d1c2;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 83%;
		padding: 40rpx 25rpx;
		padding-bottom: 0;
		border-radius: 30rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
	}

	.popup-header {
		text-align: left;
		margin-left: 10rpx;
		margin-top: 20rpx;
		margin-bottom: 55rpx;
	}

	.people_decorate {
		top: 20rpx;
		position: fixed;
		right: 140rpx;
		width: 120rpx;
	}

	.people_decorate_2 {
		position: fixed;
		right: 40rpx;
		width: 80rpx;
	}

	.title {
		font-size: 40rpx;
		color: #000000;
		font-weight: 600;
	}

	.section-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.notice-sessions {
		margin-bottom: 40rpx;
	}

	.notice-item {
		display: flex;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}

	.icon {
		margin-right: 20rpx;
		margin-top: 6rpx;
		/* background-color: #18d1c2; */
	}

	.icon-service {
		width: 90rpx;
	}

	.icon-refund {
		width: 70rpx;
		margin: 12rpx;
		margin-right: 20rpx;
	}

	.icon-register {
		width: 75rpx;
	}

	.item-text {
		flex: 1;
	}

	.item-title {
		font-size: 29rpx;
		color: black;
		font-weight: 500;
		display: block;
		margin-bottom: 10rpx;
	}

	.item-content {
		font-size: 24rpx;
		color: #666;
		line-height: 40rpx;
		display: block;
	}

	.confirm-btn {
		text-align: center;
		align-items: center;
		margin: 40rpx 0;
		width: 95%;
		height: 95rpx;
		color: #00aa7f;
		font-size: 38rpx;
		border-radius: 40rpx;
		border: 1px solid #00aa7f;
		margin-bottom: 30rpx;
	}
</style>