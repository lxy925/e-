<template>
	<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{
	      paddingTop: navHeight + 'px',
	      height: 'calc(100vh - ' + navHeight + 'px)'
	    }" :scroll-top="scrollTop" :show-scrollbar="false">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" />
		<view class="content">
			<view class="balance-card">
				<text>可提现余额</text>
				<text class="amount" >¥{{ (this.accountInfo.withdrawable_amount / 100).toFixed(2) }}</text>
			</view>

			<view class="input-card">
				<text class="label">提现金额</text>
				<view class="input-row">
					<text class="prefix">¥</text>
					<input type="digit" v-model="amount" placeholder="请输入提现金额" @input="validateAmount" />
				</view>
				<text class="hint">单笔最低1元，最高5000元</text>
			</view>

			<button class="submit-btn" :disabled="!canSubmit || loading" @click="handleWithdraw">
				<text v-if="!loading">提现到微信零钱</text>
				<text v-else>处理中...</text>
			</button>

			<view class="record-link" @click="navigateToRecords">
				<text>查看提现记录</text>
				<uni-icons type="arrowright" size="16"></uni-icons>
			</view>

			<view class="tips">
				<text>提现将在1-3个工作日内到账</text>
			</view>
		</view>
		<!-- 确认收款弹窗 -->
		<!--  <uni-popup ref="confirmPopup" type="dialog">
        <uni-popup-dialog
          title="确认收款"
          content="确认收款"
          @confirm="confirmTransfer"
          @cancel="cancelTransfer"
        /> -->
		</uni-popup>
	</scroll-view>
</template>

<script>
	// import options from '@dcloudio/vue-cli-plugin-uni/lib/options';

	export default {
		data() {
			return {
				balance: 0, // 单位:分
				amount: '', // 用户输入的金额(元)
				loading: false,
				pageTitle: '体现页面',
				scrollTop: 0,
				navHeight: 0, // 添加导航栏高度存储
				accountInfo: '',
				options: {}
			}
		},
		computed: {
			// 转换为分
			amountInCent() {
				return Math.round(parseFloat(this.amount || 0) * 100);
			},
			canSubmit() {
				const min = 1; // 0.01元=1分
				const max = 500000; // 5000元=500000分
				return this.amountInCent >= min &&
					this.amountInCent <= max &&
					this.amountInCent <= this.accountInfo.balance &&
					!this.loading;
			}
		},
		onLoad(options) {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			const refreshToken = uni.getStorageSync("refreshToken");
			this.refreshToken = refreshToken;
			if (options.accountInfo) {
				this.accountInfo = JSON.parse(decodeURIComponent(options.accountInfo));
				console.log(this.accountInfo)

			}

		},
		methods: {
			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop
			},

			// 校验金额
			validateAmount() {
				if (this.amountInCent > this.accountInfo.balance) {
					uni.showToast({
						title: '超出可提现金额',
						icon: 'none'
					});
				}
			},

			// 提现操作
			async handleWithdraw() {
				this.loading = true;

				try {
					const res = await uniCloud.callFunction({
						name: 'withdraw-apply',
						data: {
							user_id: this.accountInfo.user_id,
							amount: this.amountInCent,
							refreshToken: this.refreshToken
						}
					});
					if (res.result.code === 201) {
						// uni.showToast({ title: '提现申请待确认' });
						// this.loadBalance(); // 刷新余额
						this.options = res.result.data.options
						this.confirmTransfer();
						this.amount = ''; // 清空输入框
						// this.$refs.confirmPopup.open(); // 弹出确认框
						console.log(res.result.data)

					}
					// else if (res.result.code === 200) {
					//         uni.showToast({ title: '提现申请已提交' });
					//         this.loadBalance(); // 刷新余额
					//         this.amount = ''; // 清空输入框
					//   this.$refs.confirmPopup.open(); // 弹出确认框
					//   console.log(res.result.options)
					//       }
					else {
						uni.showToast({
							title: res.result.msg,
							icon: 'none'
						});
						this.getMoneyFail();

					}
				} catch (e) {
					uni.showToast({
						title: '提现失败',
						icon: 'none'
					});
					this.getMoneyFail();
					console.error(e);
				} finally {
					this.loading = false;
				}
			},
			// 用户确认收款
			async confirmTransfer() {
				const options = this.options;
				try {
					uni.requestMerchantTransfer({
						...options, // 变量 options 就是 vkPay.transfer 接口的返回值中的 options 参数

						success: (res) => {
							// console.log("res",res)
							uni.showToast({
								title: '提现成功！'
							});
							let _id = this.accountInfo._id;
							//解冻金额
							await db.collection('escort_account').doc(_id).update({
								frozen_amount: this.accountInfo.frozen_amount,
								update_time: Date.now()
							});
							_id = options.out_bill_no;
							await db.collection('withdraw_records').doc(_id).update({
								status: 'SUCCESS',
								update_time: Date.now()
							});
							this.accountInfo.withdrawable_amount-=amount;
						},
						fail: (res) => {
							// console.log("res",res)
							uni.showToast({
								title: res.result.msg,
								icon: 'none'
							});
							this.getMoneyFail();
						}
					});
				} catch (e) {
					uni.showToast({
						title: '确认失败',
						icon: 'none'
					});
					this.getMoneyFail();
				}
			},
			async getMoneyFail() {
				let _id = this.accountInfo._id;
				//解冻金额
				await db.collection('escort_account').doc(_id).update({
					frozen_amount: this.accountInfo.frozen_amount,
					withdrawable_amount: this.accountInfo.withdrawable_amount,
					update_time: Date.now()
				});
				_id = options.out_bill_no;
				await db.collection('withdraw_records').doc(_id).update({
					status: 'FAIL',
					update_time: Date.now()
				});
			},
			async cancelTransfer() {
				await db.collection('escort_account').doc(account._id).update({
					withdrawable_amount: account.withdrawable_amount - amount,
					frozen_amount: (account.frozen_amount || 0) + amount,
					update_time: Date.now()
				});
			},
			// 跳转提现记录
			navigateToRecords() {
				uni.navigateTo({
					url: '/pages/withdraw/records'
				});
			}
		}
	}
</script>

<style>
	.page-container {
		min-height: 100vh;
		position: relative;
		padding: 0 rpx;
		padding-left: 25rpx;
		padding-right: 25rpx;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 width 包含 padding */
		-webkit-overflow-scrolling: touch;
		/* 平滑滚动 */
		scrollbar-width: none;
		/* Firefox */
	}

	.page-container ::-webkit-scrollbar {
		display: none;
		/* Chrome/Safari */
		width: 0 !important;
		/* 微信小程序可能需要 */
		height: 0 !important;
	}

	.content {
		width: 100%;
		max-width: 100%;
		/* 限制最大宽度（可选） */
		margin: 0;
		/* 水平居中 */
		padding: 0;
		box-sizing: border-box;
	}

	.balance-card {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		border-radius: 10px;
		padding: 20px;
		color: white;
		margin-bottom: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.balance-card .amount {
		font-size: 24px;
		font-weight: bold;
	}

	.input-card {
		background: #fff;
		border-radius: 10px;
		padding: 15px;
		margin-bottom: 20px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.input-card .label {
		font-size: 14px;
		color: #666;
		display: block;
		margin-bottom: 10px;
	}

	.input-row {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #eee;
		padding-bottom: 8px;
		margin-bottom: 8px;
	}

	.input-row .prefix {
		font-size: 24px;
		margin-right: 5px;
	}

	.input-row input {
		flex: 1;
		font-size: 24px;
		height: 40px;
	}

	.hint {
		font-size: 12px;
		color: #999;
	}

	.submit-btn {
		background: #07c160;
		color: white;
		border-radius: 25px;
		height: 50px;
		line-height: 50px;
		font-size: 16px;
		margin-bottom: 20px;
	}

	.submit-btn[disabled] {
		background: #dddddd;
		color: #999;
	}

	.record-link {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #4facfe;
		font-size: 14px;
		margin-bottom: 30px;
	}

	.tips {
		text-align: center;
		font-size: 12px;
		color: #999;
	}
</style>