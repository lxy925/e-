<template>
	<view class="page">
		<custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>

		<!-- 服务须知弹窗（最外层，确保最高层级） -->
		<service-notice-popup ref="serviceNoticePopup" @confirm="onNoticeConfirm"></service-notice-popup>

		<view class="container">
			<view class="userinfo">
				<view class="appointment-info">
					<image src="../../static/images/order/icon_1.png" class="icon" />
					<text class="title">预约信息</text>
				</view>
				<view class="input-group">
					<text class="label">就诊人</text>
					<input class="input" placeholder="请选择就诊人" :value="selectedPatientName"
						@click="goToPatientManagement" />
				</view>
				<view class="input-group">
					<text class="label">服务医院</text>
					<input class="input" placeholder="请选择医院" @click="goToSelectHospitals" :value="selectedHospital" />
				</view>
				<view class="input-group">
					<text class="label">服务时间</text>
					<input class="input" placeholder="请选择服务时间" :value="selectedDateTime" @tap="showDateTimePicker"
						disabled />
				</view>
				<view class="input-group">
					<text class="label">陪诊师</text>
					<input class="input" disabled placeholder="请选择陪诊师" :value="selectedDoctorName"
						@click="goToDoctorList" />
				</view>
				<view class="input-group" v-if="include_transport">
					<text class="label">接送地点</text>
					<input class="input" placeholder="请选择地址" :value="selectAddress" :class="{ show: include_transport }"
						@click="goToAddressList" />
				</view>
				<view class="note-info">
					<image src="../../static/images/order/icon_2.png" class="icon" />
					<text class="note">若不填陪诊师，我们将为您自动匹配优秀陪诊师</text>
				</view>
			</view>

			<view class="department">
				<text class="label_1">科室</text>
				<text class="more" @tap="goToDepartmentPage">更多>></text>
				<view class="department-list">
					<view v-if="selectedDepartment" class="selected-department">{{ selectedDepartment }}</view>
					<button :class="['department-item', 'top-margin', { selected: selectedDepartment === '儿科' }]"
						data-department="儿科" @tap="selectDepartment">儿科</button>
					<button :class="['department-item', 'top-margin', { selected: selectedDepartment === '妇产科' }]"
						data-department="妇产科" @tap="selectDepartment">妇产科</button>
					<button :class="['department-item', 'top-margin', { selected: selectedDepartment === '内科' }]"
						data-department="内科" @tap="selectDepartment">内科</button>
					<button :class="['department-item', { selected: selectedDepartment === '外科' }]" data-department="外科"
						@tap="selectDepartment">外科</button>
					<button :class="['department-item', { selected: selectedDepartment === '精神科' }]"
						data-department="精神科" @tap="selectDepartment">精神科</button>
					<button :class="['department-item', { selected: selectedDepartment === '心胸外科' }]"
						data-department="心胸外科" @tap="selectDepartment">心胸外科</button>
					<button :class="['department-item', { selected: selectedDepartment === '耳鼻喉科' }]"
						data-department="耳鼻喉科" @tap="selectDepartment">耳鼻喉科</button>
					<button :class="['department-item', { selected: selectedDepartment === '中医科' }]"
						data-department="中医科" @tap="selectDepartment">中医科</button>
					<button :class="['department-item', { selected: selectedDepartment === '眼科' }]" data-department="眼科"
						@tap="selectDepartment">眼科</button>
				</view>
			</view>

			<view class="upload-section">
				<view class="upload-labels">
					<text class="label_1">上传材料</text>
					<text class="label_2">(就诊卡、病例、挂号记录等)</text>
				</view>
				<button class="upload-button" @tap="chooseImage">
					<image src="../../static/images/order/icon_3.png" class="upload-icon" />
					<text class="upload-text">添加图片</text>
				</button>
				<view class="photo-list">
					<view v-for="(item, index) in photoList" :key="index" class="photo-container">
						<image class="photo" :src="item" mode="aspectFit" />
						<image src="../../static/images/order/icon_8.png" class="delete-button" @tap="deletePhoto"
							:data-index="index" />
					</view>
				</view>
			</view>

			<view class="requirements">
				<text class="label_1">就诊人特点及陪诊需求</text>
				<view class="requirements-list">
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('halfSelf') }"
						@tap="toggleCheckbox" data-value="halfSelf">
						<text class="checkbox-text">半自理</text>
						<checkbox value="halfSelf" class="hidden-checkbox" />
					</label>
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('noSelf') }"
						@tap="toggleCheckbox" data-value="noSelf">
						<text class="checkbox-text">无法自理</text>
						<checkbox value="noSelf" class="hidden-checkbox" />
					</label>
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('common') }"
						@tap="toggleCheckbox" data-value="common">
						<text class="checkbox-text">普通话沟通</text>
						<checkbox value="common" class="hidden-checkbox" />
					</label>
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('family') }"
						@tap="toggleCheckbox" data-value="family">
						<text class="checkbox-text">有家属陪同</text>
						<checkbox value="family" class="hidden-checkbox" />
					</label>
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('male') }"
						@tap="toggleCheckbox" data-value="male">
						<text class="checkbox-text">男陪诊师</text>
						<checkbox value="male" class="hidden-checkbox" />
					</label>
					<label class="custom-checkbox" :class="{ selected: selectedCheckboxes.includes('female') }"
						@tap="toggleCheckbox" data-value="female">
						<text class="checkbox-text">女陪诊师</text>
						<checkbox value="female" class="hidden-checkbox" />
					</label>
				</view>
			</view>
		</view>

		<view class="submit">
			<view class="total">
				<view class="total-info">
					<text class="total-label">总额</text>
					<text class="currency" style="color: black;">¥</text>
					<span class="total-amount" style="color:#DD5858;">{{ service_price }}</span>
				</view>
				<!-- <text class="discount">含单值保险 ¥30 优惠抵扣 ¥5</text> -->
			</view>
			<payment-component :amount="1" buttonText="提交订单" />
			<!-- 	<button class="submit-button" @tap="openNoticePopup">提交订单</button> -->
		</view>

		<!-- 日期时间选择器（层级低于弹窗） -->
		<view class="datetime-picker-mask" v-if="showPicker" @tap="hideDateTimePicker"></view>
		<view class="datetime-picker" :class="{ 'picker-show': showPicker }">
			<view class="picker-header">
				<text @tap="hideDateTimePicker">取消</text>
				<text>选择服务时间</text>
				<text @tap="confirmDateTime">确定</text>
			</view>
			<view class="picker-content">
				<scroll-view class="date-list" scroll-y>
					<view v-for="(date, index) in dateList" :key="index"
						:class="['date-item', { active: selectedDateIndex === index }]" @tap="selectDate(index)">
						<text class="day">{{ date.day }}</text>
						<text class="week">{{ date.week }}</text>
					</view>
				</scroll-view>
				<scroll-view class="time-list" scroll-y>
					<view v-for="(time, index) in timeList" :key="index"
						:class="['time-item', { active: selectedTimeIndex === index }]" @tap="selectTime(index)">
						{{ time }}
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import PaymentComponent from '@/components/PaymentComponent.vue';
	import ServiceNoticePopup from '@/components/service-notice-popup.vue';

	export default {
		// name: 'OrderComponent',
		components: {
			ServiceNoticePopup,
			PaymentComponent
		},
		data() {
			return {
				selectedDepartment: null,
				selectedCheckboxes: [],
				photoList: [],
				maxPhotos: 15,
				maxPerUpload: 9,
				maxSize: 5 * 1024 * 1024,
				showPicker: false,
				dateList: [],
				timeList: [],
				selectedDateIndex: 0,
				selectedTimeIndex: -1,
				selectedDateTime: '',
				selectedPatientName: '',
				selectedDoctorName: '',
				selectedHospital: '',
				selectAddress: ' ',
				//服务信息
				serviceData: {},
				service_price: '',
				service_id: '',
				include_transport: ' ',
				storageTimestamp: 0,
				STORAGE_KEY: 'order_form_data',
				STORAGE_EXPIRE: 30 * 60 * 1000
			};
		},
		onLoad(options) {
			this.loadSavedPhotos();
			this.initDateTimeList();
			const serviceDataString = options.service;
			console.log("收到的service参数", serviceDataString)
			if (serviceDataString) {
				try {
					this.serviceData = JSON.parse(decodeURIComponent(serviceDataString));
				} catch (error) {
					this.serviceData = decodeURIComponent(serviceDataString);
				}
			}
			console.log("传入商品参数", this.serviceData)
			this.include_transport = this.serviceData.include_transport;
			this.service_price = this.serviceData.service_price;
			this.service_id = this.serviceData.service_id;
			this.loadPatientInfo();
			this.loadDoctorInfo();
			const address = uni.getStorageSync('selectedAddress');
			if (address) {
				this.selectAddress = address.district + address.detail || '';
			}
		},
		onShow() {
			this.loadDoctorInfo();
			this.loadPatientInfo();
			this.restoreFormData();
		},
		onHide() {
			this.saveFormData();
		},
		onUnload() {
			// 可选：保存数据
		},
		onBackPress() {
			if (this.hasFormData()) {
				uni.showModal({
					title: '提示',
					content: '您有未提交的订单数据，是否保存？',
					success: (res) => {
						if (res.confirm) {
							this.saveFormData();
							uni.navigateBack();
						} else if (res.cancel) {
							this.clearFormData();
							uni.navigateBack();
						}
					}
				});
				return true;
			}
		},
		methods: {
			openNoticePopup() {
				this.$refs.serviceNoticePopup.show();
			},
			onNoticeConfirm() {
				uni.showToast({
					title: '订单提交成功',
					icon: 'success'
				});
				this.clearFormData();
				uni.navigateBack();
			},
			loadDoctorInfo() {
				const doctor = uni.getStorageSync('selectedDoctor');
				if (doctor) {
					this.selectedDoctorName = doctor.name || '';
				}
			},
			loadPatientInfo() {
				const patient = uni.getStorageSync('selectedPatient');
				if (patient) {
					this.selectedPatientName = patient.name || '';
				}
			},
			goToSelectHospitals() {
				uni.navigateTo({
					url: '/pages/more/more?from=order',
					success: () => {
						uni.$once('select-hospital', (hospital) => {
							this.selectedHospital = hospital.name;
						});
					}
				});
			},
			hasFormData() {
				return this.selectedDepartment || this.selectedCheckboxes.length > 0 || this.photoList.length > 0 || this
					.selectedDateTime;
			},
			saveFormData() {
				const formData = {
					selectedDepartment: this.selectedDepartment,
					selectedCheckboxes: this.selectedCheckboxes,
					photoList: this.photoList,
					selectedDateTime: this.selectedDateTime,
					selectedPatientName: this.selectedPatientName,
					selectedDoctorName: this.selectedDoctorName,
					selectAddress: this.selectAddress,
					timestamp: new Date().getTime()
				};
				uni.setStorageSync(this.STORAGE_KEY, formData);
			},
			restoreFormData() {
				const savedData = uni.getStorageSync(this.STORAGE_KEY);
				if (savedData && !this.isDataExpired(savedData.timestamp)) {
					if (!this.selectedDepartment) this.selectedDepartment = savedData.selectedDepartment;
					if (!this.selectedCheckboxes) this.selectedCheckboxes = savedData.selectedCheckboxes;
					if (!this.photoList) this.photoList = savedData.photoList;
					if (!this.selectedDateTime) this.selectedDateTime = savedData.selectedDateTime;
					if (!this.selectedPatientName) this.selectedPatientName = savedData.selectedPatientName;
					if (!this.selectedDoctorName) this.selectedDoctorName = savedData.selectedDoctorName;
					if (!this.selectAddress) this.selectAddress = savedData.selectAddress;
				} else {
					uni.removeStorageSync(this.STORAGE_KEY);
				}
			},
			isDataExpired(timestamp) {
				return new Date().getTime() - timestamp > this.STORAGE_EXPIRE;
			},
			clearFormData() {
				uni.removeStorageSync(this.STORAGE_KEY);
				this.selectedDepartment = null;
				this.selectedCheckboxes = [];
				this.photoList = [];
				this.selectedDateTime = '';
			},
			goToDepartmentPage() {
				uni.navigateTo({
					url: '/pages/department/department?selected=' + (this.selectedDepartment || '')
				});
			},
			selectDepartment(event) {
				this.selectedDepartment = event.currentTarget.dataset.department;
			},
			toggleCheckbox(event) {
				const value = event.currentTarget.dataset.value;
				this.selectedCheckboxes.includes(value) ?
					this.selectedCheckboxes = this.selectedCheckboxes.filter(item => item !== value) :
					this.selectedCheckboxes.push(value);
			},
			loadSavedPhotos() {
				try {
					const savedPhotoList = wx.getStorageSync('photoList');
					if (savedPhotoList) this.photoList = savedPhotoList;
				} catch (e) {
					console.error("Error loading saved photos:", e);
				}
			},
			chooseImage() {
				const remaining = this.maxPhotos - this.photoList.length;
				if (remaining <= 0) {
					wx.showToast({
						title: '最多只能上传15张图片',
						icon: 'none'
					});
					return;
				}
				const count = Math.min(this.maxPerUpload, remaining);
				wx.chooseImage({
					count,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						res.tempFilePaths.forEach(filePath => this.checkFileSize(filePath));
					}
				});
			},
			checkFileSize(filePath) {
				const fs = wx.getFileSystemManager();
				fs.getFileInfo({
					filePath,
					success: (res) => {
						res.size > this.maxSize ?
							wx.showToast({
								title: '图片大小不能超过5MB',
								icon: 'none'
							}) :
							this.uploadImg(filePath);
					},
					fail: (err) => {
						console.error("Failed to get file size:", err);
						wx.showToast({
							title: '无法获取文件大小',
							icon: 'none'
						});
					}
				});
			},
			uploadImg(imgSrc) {
				wx.showLoading({
					title: "上传中..."
				});
				const fs = wx.getFileSystemManager();
				fs.saveFile({
					tempFilePath: imgSrc,
					success: (res) => {
						if (res.savedFilePath) {
							this.photoList.push(res.savedFilePath);
							wx.setStorageSync('photoList', this.photoList);
							wx.hideLoading();
							wx.showToast({
								title: '上传成功',
								icon: 'success'
							});
						} else {
							wx.hideLoading();
							wx.showToast({
								title: '上传失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error("Save failed:", err);
						wx.hideLoading();
						wx.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			deletePhoto(e) {
				const index = e.currentTarget.dataset.index;
				this.photoList.splice(index, 1);
				wx.setStorageSync('photoList', this.photoList);
				wx.showToast({
					title: '图片已删除',
					icon: 'success'
				});
			},
			initDateTimeList() {
				const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
				this.dateList = Array.from({
					length: 7
				}, (_, i) => {
					const date = new Date();
					date.setDate(date.getDate() + i);
					return {
						day: `${date.getMonth() + 1}月${date.getDate()}日`,
						week: days[date.getDay()]
					};
				});
				this.timeList = [];
				for (let hour = 8; hour <= 18; hour++) {
					this.timeList.push(`${hour}:00`);
					if (hour < 18) this.timeList.push(`${hour}:30`);
				}
			},
			showDateTimePicker() {
				this.showPicker = true;
			},
			hideDateTimePicker() {
				this.showPicker = false;
			},
			selectDate(index) {
				this.selectedDateIndex = index;
			},
			selectTime(index) {
				this.selectedTimeIndex = index;
			},
			confirmDateTime() {
				if (this.selectedTimeIndex === -1) {
					uni.showToast({
						title: '请选择时间',
						icon: 'none'
					});
					return;
				}
				const date = this.dateList[this.selectedDateIndex];
				const time = this.timeList[this.selectedTimeIndex];
				this.selectedDateTime = `${date.day} ${date.week} ${time}`;
				this.hideDateTimePicker();
			},
			goToPatientManagement() {
				uni.navigateTo({
					url: '/pages/patientManagement/patientManagement'
				});
			},
			goToDoctorList() {
				uni.navigateTo({
					url: `/pages/doctorlist/doctorlist?from=order`
				});
			},
			goToAddressList() {
				uni.navigateTo({
					url: '/pages/myAddress/myAddress'
				});
			}
		}
	};
</script>


<style scoped>
	.page {
		z-index: 1;
		/* 确保页面内容层级低于弹窗 */
		overflow-y: auto;
		/* 允许垂直滚动 */
		-webkit-overflow-scrolling: touch;
		/* iOS平滑滚动 */
		padding-bottom: 50rpx;
		/* 留出底部空间 */
		margin-top: 140rpx;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(#18d1c2, #f2f3f9, white);
	}

	.container {
		height: auto;
		margin: 0 20rpx;
		margin-top: 40rpx;
		padding: 20rpx;

		padding-bottom: 200rpx;
		/* 增加底部内边距 */
		margin-bottom: 40rpx;
		/* 增加底部外边距 */
		border-radius: 30rpx;
		background-color: #ffffff;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;

	}

	.userinfo,
	.department,
	.upload-section,
	.requirements {
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

	.note-info {
		display: flex;
		align-items: center;
		margin-top: 5rpx;
	}

	.note {
		font-size: 16px;
		color: #b29a6c;
	}

	.department-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 0 1rpx;
	}

	.department-item {
		font-weight: 400;
		width: 32%;
		flex: none;
		margin: 12rpx 0;
		padding: 0 17rpx;
		font-size: 16px;
		background-color: #e5e5e5;
		border-radius: 20px;
	}

	.department-item.selected {
		background-color: #18d1c2;
		color: white;
	}

	.upload-section {
		display: flex;
		flex-direction: column;
		margin-top: 20rpx;
		align-items: flex-start;
	}

	.upload-labels {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.upload-button {
		width: 200rpx;
		height: 200rpx;
		background-color: #e5e5e5;
		color: #333;
		border-radius: 15px;
		font-size: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 10rpx;
	}

	.upload-icon {
		width: 70rpx;
		height: 70rpx;
		margin-bottom: 5rpx;
	}

	.upload-text {
		font-size: 13px;
		color: #bababa;
	}

	.photo-list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 10rpx;
	}

	.photo-container {
		position: relative;
		margin-right: 10rpx;
		margin-bottom: 10rpx;
	}

	.photo {
		width: 150rpx;
		height: 150rpx;
		border-radius: 10rpx;
	}

	.delete-button {
		width: 30rpx;
		height: 30rpx;
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		font-size: 30rpx;
		color: red;
	}

	.submit {
		width: 90%;
		position: fixed;
		display: flex;
		justify-content: space-between;
		align-items: center;
		bottom: 20rpx;
		left: 20rpx;
		padding: 20rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.total {
		margin-left: 10rpx;
		display: flex;
		flex-direction: column;
		margin-right: 100rpx;
	}

	.total-info {
		display: flex;
		align-items: center;
	}

	.total-label {
		font-size: 16px;
		color: #333;
		margin-right: 10rpx;
	}

	.currency {
		font-size: 18px;
		margin-right: 5rpx;
	}

	.total-amount {
		font-size: 18px;
		font-weight: bold;
	}

	.discount {
		font-size: 12px;
		color: #999;
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

	.label_1 {
		font-size: 17px;
		color: #545454;
	}

	.department {
		width: 100%;
		position: relative;
	}

	.more {
		font-size: 16px;
		color: #808080;
		position: absolute;
		right: 0;
		top: 0;
	}

	.top-margin {
		margin-top: 25rpx;
	}

	.label_2 {
		margin-left: 35rpx;
		font-size: 15px;
		color: #b0b0b0;
	}

	.requirements-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 100%;
		padding: 0 1rpx;
	}

	.custom-checkbox {
		width: 32%;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #e5e5e5;
		border-radius: 20px;
		padding: 10rpx 15rpx;
		margin: 12rpx 0;
		transition: background-color 0.3s, color 0.3s;
		min-height: 64rpx;
		box-sizing: border-box;
	}

	.custom-checkbox.selected {
		background-color: #18d1c2;
		color: white;
	}

	.hidden-checkbox {
		display: none;
	}

	.checkbox-text {
		font-size: 16px;
		color: #333;
		text-align: center;
		width: 100%;
		word-wrap: break-word;
		word-break: break-all;
		line-height: 1.2;
	}

	.datetime-picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	.datetime-picker {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		transform: translateY(100%);
		transition: transform 0.3s;
		z-index: 1000;
		height: 600rpx;
	}

	.picker-show {
		transform: translateY(0);
	}

	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #eee;
	}

	.picker-header text {
		font-size: 28rpx;
	}

	.picker-header text:first-child {
		color: #999;
	}

	.picker-header text:last-child {
		color: #18d1c2;
	}

	.picker-content {
		display: flex;
		height: 500rpx;
	}

	.date-list,
	.time-list {
		flex: 1;
		height: 100%;
	}

	.date-list {
		border-right: 1rpx solid #eee;
	}

	.date-item,
	.time-item {
		padding: 20rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333;
	}

	.date-item {
		display: flex;
		flex-direction: column;
	}

	.date-item .day {
		font-size: 26rpx;
		margin-bottom: 6rpx;
	}

	.date-item .week {
		font-size: 24rpx;
		color: #999;
	}

	.date-item.active,
	.time-item.active {
		background-color: #f0f9f8;
		color: #18d1c2;
	}

	.date-item.active .week {
		color: #18d1c2;
	}

	.selected-department {
		width: 100%;
		padding: 10px;
		background-color: #f0f0f0;
		border-radius: 4px;
		margin-bottom: 10px;
		text-align: center;
	}
</style>