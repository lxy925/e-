<template>
	<view class="page" :style="{ paddingTop: navHeight + 'px' }">
		<custom-nav :title="'报名'" :isHomePage="false" />
		<view class="signup-page">
			<view class="container">
				<view class="userinfo">
					<view class="appointment-info">
						<image src="../../static/images/order/icon_1.png" class="icon" />
						<text class="title">报名信息</text>
					</view>

					<view class="input-group">
						<text class="label">姓名<span class="required">*</span></text>
						<input class="input" v-model="form.name" placeholder="请输入姓名" />
					</view>

					<view class="input-group">
						<text class="label">证件号<span class="required">*</span></text>
						<input class="input" v-model="form.idNumber" placeholder="请输入证件号" />
					</view>

					<view class="input-group">
						<text class="label">报考类型<span class="required">*</span></text>
						<picker :range="examTypes" :value="form.examTypeIndex"
							@change="onPickerChange('examTypeIndex', $event)">
							<view class="picker-input">{{ examTypes[form.examTypeIndex] || '请选择报考类型' }}</view>
						</picker>
					</view>

					<view class="input-group">
						<text class="label">报考工种<span class="required">*</span></text>
						<picker :range="jobTypes" :value="form.jobTypeIndex"
							@change="onPickerChange('jobTypeIndex', $event)">
							<view class="picker-input">{{ jobTypes[form.jobTypeIndex] || '请选择工种' }}</view>
						</picker>
					</view>

					<view class="input-group">
						<text class="label">考试级别<span class="required">*</span></text>
						<picker :range="availableLevels" :value="form.examLevelIndex"
							@change="onPickerChange('examLevelIndex', $event)">
							<view class="picker-input">{{ availableLevels[form.examLevelIndex] || '请选择考试级别' }}</view>
						</picker>
					</view>
				</view>

				<view class="submit">
					<view>
						点击查看<span @click="findAndOpenHealthCertFile">报考须知</span>和<span @click="showNotice"
							:disabled="!canShowNotice">所选工种描述</span>
					</view>
					<view class="pay">
						<view class="total-info">
							<text class="total-label">总额</text>
							<text class="currency" style="color: black;">¥</text>
							<span class="total-amount"
								style="color:#DD5858;font-size: large;font-weight: bolder;">{{ selectedJobInfo.price }}</span>
							<span class="total-amount" style="color: black;">
								【{{ selectedJobInfo && selectedJobInfo.description ? selectedJobInfo.description : '待选择' }}】
							</span>
						</view>
						<payment-button ref="paymentButton" :user-id="user_id" :form-data="{
								name: form.name.trim(),
								idNumber: form.idNumber.trim(),
								examType: examTypes[form.examTypeIndex] || '',
								examLevel: availableLevels[form.examLevelIndex] || ''
							}" :selected-job-info="selectedJobInfo" :disabled="!isFormValid" @payment-success="handlePaymentSuccess"
							@payment-fail="handlePaymentFail" />
					</view>
				</view>
			</view>
		</view>

		<!-- 报考须知弹窗 -->
		<view class="notice-modal" v-if="showNoticeModal" @click="hideNotice">
			<view class="notice-content" @click.stop>
				<view class="notice-header">
					<text class="notice-title">报考须知</text>
					<view class="close-btn" @click="hideNotice">×</view>
				</view>
				<view class="notice-body" v-if="selectedJobInfo">
					<view class="notice-item">
						<text class="notice-label">工种名称：</text>
						<text class="notice-value">{{ selectedJobInfo.jobName }}</text>
					</view>
					<view class="notice-item">
						<text class="notice-label">考试方式：</text>
						<text class="notice-value">{{ selectedJobInfo.examMethod }}</text>
					</view>
					<view class="notice-item">
						<text class="notice-label">理论考试时长：</text>
						<text class="notice-value">{{ selectedJobInfo.theoryDuration }}</text>
					</view>
					<view class="notice-item">
						<text class="notice-label">实操考试时长：</text>
						<text class="notice-value">{{ selectedJobInfo.practicalDuration }}</text>
					</view>
					<view class="notice-item" v-if="selectedJobInfo.position">
						<text class="notice-label">职业定位：</text>
						<text class="notice-value">{{ selectedJobInfo.position }}</text>
					</view>
					<view class="notice-item" v-if="selectedJobInfo.suit">
						<text class="notice-label">职业定位：</text>
						<text class="notice-value">{{ selectedJobInfo.suit }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import PaymentButton from '../../components/SignUpPaymentButton.vue';
	export default {
		components: {
			PaymentButton
		},
		onLoad(options) {
			this.user_id = options?.user_id || '';
			console.log('父组件获取的user_id:', this.user_id);

			this.loadJobTypes();
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
		},
		data() {
			return {
				navHeight: 0,
				examTypes: ['专业报考', '职业报考'],
				jobTypes: [],
				availableLevels: [],
				jobTypesData: [],
				form: {
					name: '',
					idNumber: '',
					examTypeIndex: null,
					jobTypeIndex: null,
					examLevelIndex: null
				},
				user_id: '',
				showNoticeModal: false
			}
		},
		computed: {
			selectedJobInfo() {
				if (this.form.jobTypeIndex !== null && this.jobTypesData.length > 0) {
					return this.jobTypesData[this.form.jobTypeIndex] || {};
				}
				return {
					_id: '',
					price: 0,
					jobName: '',
					description: ''
				};
			},
			canShowNotice() {
				return this.form.jobTypeIndex !== null;
			},
			isFormValid() {
				return !!this.form.name.trim() &&
					!!this.form.idNumber.trim() &&
					this.form.examTypeIndex !== null &&
					this.form.jobTypeIndex !== null &&
					this.form.examLevelIndex !== null &&
					!!this.selectedJobInfo._id &&
					this.selectedJobInfo.price > 0;
			}
		},
		methods: {
			async handlePaymentSuccess() {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				});
			},
			handlePaymentFail(err) {
				uni.showToast({
					title: err.message || '支付失败',
					icon: 'none'
				});
			},
			async loadJobTypes() {
				try {
					const res = await uniCloud.callFunction({
						name: 'getJobTypes'
					});
					if (res.result && res.result.code === 0) {
						this.jobTypesData = res.result.data;
						this.jobTypes = this.jobTypesData.map(item => item.jobName);
					}
				} catch (e) {
					console.error('加载工种信息异常:', e);
				}
			},
			onPickerChange(field, e) {
				this.form[field] = e.detail.value;
				if (field === 'jobTypeIndex') {
					this.updateAvailableLevels();
					this.form.examLevelIndex = null;
				}
			},
			updateAvailableLevels() {
				if (this.form.jobTypeIndex !== null && this.jobTypesData.length > 0) {
					this.availableLevels = this.jobTypesData[this.form.jobTypeIndex].examLevels || [];
				} else {
					this.availableLevels = [];
				}
			},
			showNotice() {
				if (this.canShowNotice) {
					this.showNoticeModal = true;
				}
			},
			hideNotice() {
				this.showNoticeModal = false;
			},
			/**
			 * 查找并打开云存储中的"杉本健康考证资料"文件
			 */
			async findAndOpenHealthCertFile() {
				try {
					uni.showLoading({
						title: '加载中...'
					});

					// 1. 拼接云存储路径（假设文件在 `file/` 目录下）
					const cloudPath =
						'https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/file/杉本健康考证资料.docx'; // 替换为你的文件名

					// 2. 获取临时下载链接
					const {
						fileList
					} = await uniCloud.getTempFileURL({
						fileList: [cloudPath]
					});

					if (!fileList[0]?.tempFileURL) {
						uni.showToast({
							title: '文件不存在',
							icon: 'none'
						});
						return;
					}

					// 3. 下载并打开文件
					uni.downloadFile({
						url: fileList[0].tempFileURL,
						success(res) {
							if (res.statusCode === 200) {
								uni.openDocument({
									filePath: res.tempFilePath,
									fileType: 'docx', // 根据文件类型调整
									showMenu: true, // 允许用户选择其他应用打开
								});
							}
						},
						fail(err) {
							uni.showToast({
								title: '下载失败',
								icon: 'none'
							});
							console.error(err);
						},
						complete: () => uni.hideLoading(),
					});
				} catch (err) {
					uni.hideLoading();
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
					console.error(err);
				}
			},
		}
	}
</script>

<style>
	/* 原有样式保持不变 */
	.page {
		height: auto;
		display: flex;
		justify-content: center;
	}

	.signup-page {
		padding: 20rpx;
		padding-top: 0rpx;
		width: 100%;
		height: auto;
		display: flex;
		justify-content: center;
	}

	.container {
		height: auto;
		padding: 20rpx;
		padding-bottom: 100rpx;
		margin-bottom: 40rpx;
		border-radius: 30rpx;
		background-color: #ffffff;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		width: calc(100% - 10rpx);
		max-width: 700rpx;
	}

	.userinfo {
		width: 100%;
	}

	.title {
		font-size: 23px;
		font-weight: normal;
		margin-bottom: 15rpx;
		color: #000000;
	}

	.input-group {
		display: flex;
		width: 100%;
		margin-bottom: 15rpx;
		border-bottom: 0.5px solid rgba(224, 224, 224, 0.5);
		padding-bottom: 10rpx;
	}

	.label {
		width: 100px;
		color: #646464;
		font-weight: 500;
	}

	.required {
		color: #FF4D4F;
		margin-left: 4rpx;
	}

	.input {
		position: relative;
		font-size: 15px;
		color: #b3b3b3;
		flex: 1;
		border: none;
		border-radius: 4px;
		padding: 10rpx;
		z-index: 1;
	}

	.picker-input {
		position: relative;
		font-size: 15px;
		color: #b3b3b3;
		flex: 1;
		border: none;
		border-radius: 4px;
		padding: 10rpx;
		z-index: 1;
	}

	.icon {
		width: 45rpx;
		height: 45rpx;
		margin-right: 20rpx;
	}

	.appointment-info {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.submit {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 100rpx;
		gap: 20rpx;
	}

	.submit span {
		color: blue;
	}

	.notice-btn {
		width: 90%;
		height: 60rpx;
		line-height: 60rpx;
		background: #f0f0f0;
		color: #666;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: none;
	}

	.notice-btn:disabled {
		background: #e0e0e0;
		color: #999;
	}

	.submit-btn {
		width: 90%;
		height: 80rpx;
		line-height: 80rpx;
		background: #18d1c2;
		color: #fff;
		border-radius: 40rpx;
		font-size: 28rpx;
		border: none;
	}

	/* 弹窗样式 */
	.notice-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.notice-content {
		width: 90%;
		max-width: 600rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		max-height: 80vh;
		overflow-y: auto;
	}

	.notice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		border-bottom: 1px solid #eee;
		padding-bottom: 20rpx;
	}

	.notice-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.close-btn {
		font-size: 40rpx;
		color: #999;
		padding: 10rpx;
		cursor: pointer;
	}

	.notice-body {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.notice-item {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.notice-label {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}

	.notice-value {
		font-size: 30rpx;
		color: #333;
		padding: 15rpx;
		background: #f8f8f8;
		border-radius: 10rpx;
		line-height: 1.5;
	}

	.pay {
		margin-top: 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 20rpx;
	}

	.total-info {
		width: 100%;
	}
</style>