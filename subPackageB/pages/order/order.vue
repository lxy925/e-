<template>
	<view class="page">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<scroll-view class="page-container" :style="{ paddingTop: navHeight + 'px' }">
			<!-- 	<view class="content"> -->

			<!-- 服务须知弹窗 -->
			<service-notice-popup ref="serviceNoticePopup" @confirm="onNoticeConfirm"></service-notice-popup>

			<view class="container">
				<view class="userinfo">
					<view class="appointment-info">
						<image src="../../../static/images/order/icon_1.png" class="icon" />
						<text class="title">预约信息</text>
					</view>
					<!-- 输入框错误状态 -->
					<view class="input-group" :class="{ 'error-field': fieldErrors.patient }">
						<text class="label">就诊人<span class="required">*</span></text>
						<view class="input" @tap="goToPatientManagement">
							{{ selectedPatientName || '请选择就诊人' }}
						</view>
					</view>

					<view class="input-group" :class="{ 'error-field': fieldErrors.hospital }">
						<text class="label">服务医院<span class="required">*</span></text>

						<view class="input" @tap="goToSelectHospitals">
							{{ selectedHospital || '请选择医院' }}
						</view>
					</view>

					<view class="input-group" :class="{ 'error-field': fieldErrors.datetime }">
						<text class="label">服务时间<span class="required">*</span></text>
						<view class="input" @tap="showDateTimePicker">
							{{ selectedDateTime || '请选择服务时间' }}
						</view>
						<!-- <input class="input" placeholder="请选择服务时间" :value="selectedDateTime" @tap="showDateTimePicker"
							disabled /> -->
					</view>

					<view class="input-group">
						<text class="label">陪诊师</text>
						<view class="input" @tap="goToDoctorList" >
							{{ selectedDoctorName || '请选择陪诊师' }}
						</view>
						<!-- <input class="input" disabled placeholder="请选择陪诊师" :value="selectedDoctorName"
							@click="goToDoctorList" /> -->
					</view>
					<view class="input-group" v-if="include_transport" :class="{ 'error-field': fieldErrors.address }">
						<text class="label">接送地点<span class="required">*</span></text>
						<view class="input" @tap="goToAddressList">
							{{ selectedAddress || '请选择地址' }}
						</view>
						<!-- <input class="input" placeholder="请选择地址" :value="selectedAddress" @click="goToAddressList" /> -->
					</view>
					<view class="note-info">
						<image src="../../../static/images/order/icon_2.png" class="icon" />
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
						<button :class="['department-item', { selected: selectedDepartment === '外科' }]"
							data-department="外科" @tap="selectDepartment">外科</button>
						<button :class="['department-item', { selected: selectedDepartment === '精神科' }]"
							data-department="精神科" @tap="selectDepartment">精神科</button>
						<button :class="['department-item', { selected: selectedDepartment === '心胸外科' }]"
							data-department="心胸外科" @tap="selectDepartment">心胸外科</button>
						<button :class="['department-item', { selected: selectedDepartment === '耳鼻喉科' }]"
							data-department="耳鼻喉科" @tap="selectDepartment">耳鼻喉科</button>
						<button :class="['department-item', { selected: selectedDepartment === '中医科' }]"
							data-department="中医科" @tap="selectDepartment">中医科</button>
						<button :class="['department-item', { selected: selectedDepartment === '眼科' }]"
							data-department="眼科" @tap="selectDepartment">眼科</button>
					</view>
				</view>

				<view class="upload-section">
					<view class="upload-labels">
						<text class="label_1">上传材料</text>
						<text class="label_2">(就诊卡、病例、挂号记录等)</text>
					</view>
					<button class="upload-button" @tap="chooseImage">
						<image src="../../../static/images/order/icon_3.png" class="upload-icon" />
						<text class="upload-text">添加图片</text>
					</button>
					<view class="photo-list">
						<view v-for="(item, index) in photoList" :key="index" class="photo-container">
							<image class="photo" :src="item" mode="aspectFit" />
							<image src="../../../static/images/order/icon_8.png" class="delete-button" @tap="deletePhoto"
								:data-index="index" />
						</view>
					</view>
				</view>


				<view class="requirements">
					<text class="label_1">就诊人特点及陪诊需求</text>
					<!-- 就诊人特点分组 -->
					<view class="requirements-group">
						<text class="group-title">就诊人特点</text>
						<view class="requirements-list">
							<label v-for="item in patientFeatures" :key="item.value" class="custom-checkbox"
								:class="{ selected: selectedCheckboxes.includes(item.value) }" @tap="toggleCheckbox"
								:data-value="item.value">
								<text class="checkbox-text">{{ item.label }}</text>
								<checkbox :value="item.value" class="hidden-checkbox" />
							</label>
						</view>
					</view>

					<!-- 沟通需求分组 -->
					<view class="requirements-group">
						<text class="group-title">沟通需求</text>
						<view class="requirements-list">
							<label v-for="item in communicationNeeds" :key="item.value" class="custom-checkbox"
								:class="{ selected: selectedCheckboxes.includes(item.value) }" @tap="toggleCheckbox"
								:data-value="item.value">
								<text class="checkbox-text">{{ item.label }}</text>
								<checkbox :value="item.value" class="hidden-checkbox" />
							</label>
						</view>
					</view>

					<!-- 陪诊师偏好分组 -->
					<view class="requirements-group">
						<text class="group-title">陪诊师偏好</text>
						<view class="requirements-list">
							<label v-for="item in doctorPreferences" :key="item.value" class="custom-checkbox"
								:class="{ selected: selectedCheckboxes.includes(item.value) }" @tap="toggleCheckbox"
								:data-value="item.value">
								<text class="checkbox-text">{{ item.label }}</text>
								<checkbox :value="item.value" class="hidden-checkbox" />
							</label>
						</view>
					</view>

					<!-- 自定义需求描述 -->
					<view class="requirements-textarea">
						<text class="textarea-label">其他特殊需求描述</text>
						<textarea v-model="customRequirements" placeholder="请输入您的特殊需求（如：需要轮椅服务、语言翻译等）"
							placeholder-class="textarea-placeholder" auto-height maxlength="500"
							@input="onCustomRequirementsInput"></textarea>
						<text class="char-count">{{ customRequirements.length }}/500</text>
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
				</view>
				<!-- 修改支付组件调用 -->

				<!-- 主页面模板中支付组件的调用 -->
				<payment-component :buttonText="buttonText" :orderInfo="orderInfo" :servicePrice="service_price"
					:serviceId="serviceData.service_id" :serviceName="serviceData.service_name"
					:serviceDesc="serviceData.service_desc" :formValid="formValid" :requiredErrors="fieldErrors"
					:duration="serviceData.duration" buttonText="提交订单" :missingOptional="missingOptionalFields"
					ref="paymentComponent" />

			</view>

			<!-- 日期时间选择器 -->
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
		</scroll-view>
	</view>
</template>

<script>
	import PaymentComponent from '../../components/PaymentComponent.vue';
	import ServiceNoticePopup from '../../components/service-notice-popup.vue';

	export default {
		components: {
			ServiceNoticePopup,
			PaymentComponent
		},
		data() {
			return {
				navHeight: 0, // 添加导航栏高度存储
				pageTitle: '服务信息',
				scrollTop: 0,
				// 选择科室
				selectedDepartment: null,
				// 就诊人特点&需求
				selectedCheckboxes: [],
				// 病例照片
				photoList: [],
				// 最多照片数
				maxPhotos: 15,
				// 每次最多上传多少张照片
				maxPerUpload: 9,
				// 照片尺寸
				maxSize: 5 * 1024 * 1024,
				// 是否展示日期选择弹窗
				showPicker: false,
				dateList: [],
				timeList: [],
				selectedDateIndex: 0,
				selectedTimeIndex: -1,
				selectedDateTime: '',
				selectedDateTimeISO: '',
				selectedTime: null,
				selectedPatientName: '',
				selectedPatientPhone: '',
				selectedDoctorName: '',
				selectedDoctorId: '',
				selectedHospital: '',
				selectedAddress: ' ',
				// 服务信息
				serviceData: {},
				service_id: '',
				service_name: '',
				service_desc: '',
				service_price: '',
				include_transport: ' ',

				storageTimestamp: 0,
				STORAGE_KEY: 'order_form_data',
				STORAGE_EXPIRE: 30 * 60 * 1000,
				// 就诊人特点选项
				patientFeatures: [{
						value: 'halfSelf',
						label: '半自理'
					},
					{
						value: 'noSelf',
						label: '无法自理'
					},
					{
						value: 'family',
						label: '有家属陪同'
					}
				],
				// 沟通需求选项
				communicationNeeds: [{
						value: 'common',
						label: '普通话沟通'
					},
					{
						value: 'cantonese',
						label: '粤语沟通'
					},
					{
						value: 'chaoshan',
						label: '潮汕话沟通'
					}
				],
				// 陪诊师偏好选项
				doctorPreferences: [{
						value: 'male',
						label: '男陪诊师'
					},
					{
						value: 'female',
						label: '女陪诊师'
					}
				],
				// 自定义需求描述
				customRequirements: '',
				// 表单验证相关
				missingRequiredFields: false,
				// 表单验证状态
				formValid: false,
				fieldErrors: {
					patient: false,
					hospital: false,
					datetime: false,
					address: false
				},
				missingOptionalFields: []
			};
		},
		onPageScroll(e) {
			// console.log('页面滚动:', e.scrollTop);
			this.scrollTop = e.scrollTop;
		},
		onShow() {
			// 恢复服务数据
			const savedService = uni.getStorageSync('current_service');
			if (savedService) {
				console.log("获取缓存的服务数据", savedService);
				this.serviceData = savedService;
				this.service_price = savedService.service_price;
			}


			this.loadDoctorInfo();
			this.loadPatientInfo();
			this.loadSavedPhotos();
			this.restoreFormData();
		},
		onLoad(options) {
			uni.$on('clear-order-form-data', this.resetFormData);
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			this.initDateTimeList();

			// 解析并存储服务数据
			// 检查是否来自服务选择页面
			if (options.from === 'order_details') {
				this.resetFormData();
				console.log("重置表单数据");
			}
			const serviceDataString = options.service;
			if (serviceDataString) {
				this.serviceData = JSON.parse(decodeURIComponent(serviceDataString));
				uni.setStorageSync('current_service', this.serviceData); // 仅初始化时更新缓存
			}

			this.include_transport = this.serviceData?.include_transport || '';
			this.service_price = this.serviceData?.service_price || '';
			this.service_id = this.serviceData?.service_id || '';
			this.service_name = this.serviceData.service_name || '';
			this.service_desc = this.serviceData.service_details || ''; // 注意字段名是 service_details
			this.include_transport = this.serviceData.include_transport || false;
			console.log("完整服务数据:", this.serviceData);
			// 在 order.vue 的 onShow 中添加
			console.log("serviceData.duration:", this.serviceData.duration, typeof this.serviceData.duration);
			// 存储服务数据
			uni.setStorageSync('serviceData', this.serviceData);

		},

		computed: {
			// 整合所有订单信息
			orderInfo() {
				const serviceTime = this.selectedDateTimeISO;
				console.log('父组件传递的 service_time:', serviceTime); // 必须是有效的 ISO 字符串
				return {
					patient_phone: this.selectedPatientPhone,
					patient_name: this.selectedPatientName,
					hospital: this.selectedHospital,
					service_time: this.selectedDateTimeISO,
					doctor_name: this.selectedDoctorName,
					doctor_id: this.selectedDoctorId,
					department: this.selectedDepartment,
					materials: this.photoList,
					requirements: this.selectedCheckboxes,
					custom_requirements: this.customRequirements,
					include_transport: this.include_transport,
					address: this.selectedAddress,
					service_id: this.service_id,
					service_name: this.service_name,
					service_desc: this.service_desc // 使用组件数据而非 serviceData
				};
			}
		},

		onShow() {
			this.$nextTick(() => {
				this.loadDoctorInfo();
				this.loadPatientInfo();
				this.loadSavedPhotos();
				this.restoreFormData(); // 统一回显
				const address = uni.getStorageSync('selectedAddress');
				if (address) {
					this.selectedAddress = address.district + address.detail || '';
				}
				// 如果 selectedHospital 仍然为空，尝试从单独的 storage 恢复
				if (!this.selectedHospital) {
					const hospital = uni.getStorageSync('selectedHospital');
					if (hospital) {
						this.selectedHospital = hospital;
					}
				}
			});
			// this.loadDoctorInfo();
			// this.loadPatientInfo();
			// this.loadSavedPhotos();
			// this.restoreFormData();


		},

		onHide() {
			this.saveFormData();
		},

		onUnload() {
			// 移除监听，避免内存泄漏
			uni.$off('clear-order-form-data', this.clearFormData);
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

		mounted() {
			console.log('支付组件实例:', this.$refs.paymentComponent);
			if (!this.$refs.paymentComponent) {
				console.error('未获取到支付组件实例，请检查ref名称是否正确');
			}
		},

		methods: {

			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},

			resetFormData() {
				this.selectedDepartment = null;
				this.selectedCheckboxes = [];
				this.photoList = [];
				this.selectedDateTime = '';
				this.selectedDateTimeISO = null;
				this.selectedPatientName = '';
				this.selectedPatientPhone = '';
				this.selectedDoctorName = '';
				this.selectedDoctorId = '';
				this.selectedHospital = '';
				this.selectedAddress = '';
				this.customRequirements = '';

				// 清除所有可能的数据源
				const storageKeys = [
					'selectedPatient',
					'selectedDoctor',
					'selectedAddress',
					'selectedHospital',
					'photoList',
					'order_form_full_data',
					'current_service',
					'serviceData'
				];
				storageKeys.forEach(key => {
					try {
						uni.removeStorageSync(key);
					} catch (e) {
						console.error(`清除存储 ${key} 失败:`, e);
					}
				});
				// 清除图片物理文件
				this.clearPhotoCache();

				// 重置验证状态
				this.fieldErrors = {
					patient: false,
					hospital: false,
					datetime: false,
					address: false
				};
				this.missingOptionalFields = [];
			},


			// 提交订单处理函数
			handleSubmitOrder() {
				console.log('提交订单事件触发，开始验证表单');
				this.validateForm().then(valid => {
					if (valid) {
						this.openNoticePopup(); // 显示服务须知
					} else {
						uni.showToast({
							title: '请完成必填信息',
							icon: 'none'
						});
					}
				});
			},

			// 表单验证方法
			validateForm() {
				return new Promise((resolve) => {
					// 地址字段的特殊处理
					const addressRequired = this.include_transport &&
						(!this.selectedAddress || this.selectedAddress.trim() === '');
					// 重置验证状态
					this.fieldErrors = {
						patient: !this.selectedPatientName,
						hospital: !this.selectedHospital,
						datetime: !this.selectedDateTime,
						address: addressRequired
					};

					// 检查必填字段
					const requiredFields = ['patient', 'hospital', 'datetime'];
					const missingRequired = requiredFields.some(field => this.fieldErrors[field]);

					if (missingRequired) {
						// 收集错误字段并显示提示
						const errorFields = requiredFields.filter(field => this.fieldErrors[field])
							.map(field => {
								switch (field) {
									case 'patient':
										return '就诊人';
									case 'hospital':
										return '服务医院';
									case 'datetime':
										return '服务时间';
									case 'address':
										return '接送地点';
									default:
										return field;
								}
							});

						uni.showToast({
							title: '请填写以下必填信息：' + errorFields.join('、'),
							icon: 'none'
						});
						resolve(false);
						return;
					}

					// 选填字段检查
					this.missingOptionalFields = [];
					const optionalFields = [{
							value: this.selectedDepartment,
							name: '科室'
						},
						{
							value: this.selectedCheckboxes.length > 0,
							name: '就诊人特点及陪诊需求'
						},
						{
							value: this.photoList.length > 0,
							name: '上传材料'
						},
						{
							value: this.customRequirements,
							name: '其他特殊需求描述'
						}
					];

					const missingOptional = optionalFields.filter(field => {
						if (typeof field.value === 'string') {
							return !field.value || field.value.trim() === '';
						}
						return !field.value;
					});

					if (missingOptional.length > 0) {
						this.missingOptionalFields = missingOptional.map(field => field.name);
						// 显示选填字段提示
						uni.showModal({
							title: '提示',
							content: `您尚未填写以下选填信息：${missingOptional.map(field => field.name).join('、')}，是否继续提交？`,
							success: (res) => {
								resolve(res.confirm);
							},
							fail: () => resolve(true)
						});
					} else {
						resolve(true);
					}
				});
			},
			openNoticePopup() {
				this.$refs.serviceNoticePopup.show();
			},

			onNoticeConfirm() {
				console.log('服务须知已确认，开始创建订单');
				// 服务须知确认后，调用组件的提交方法
				this.$refs.paymentComponent.submitOrderAfterValidation();
			},

			loadDoctorInfo() {
				const doctor = uni.getStorageSync('selectedDoctor');
				console.log("获取医生信息：" + doctor.user_id);
				if (doctor) {
					this.selectedDoctorId = doctor.user_id;
					this.selectedDoctorName = doctor.name || '';
				}
			},

			loadPatientInfo() {
				const patient = uni.getStorageSync('selectedPatient');
				if (patient) {

					this.selectedPatientPhone = patient.phone;
					this.selectedPatientName = patient.name || '';
					console.log("病人是" + this.selectedPatientName + "电话为" + this.selectedPatientPhone)
				}
			},

			goToSelectHospitals() {
				uni.navigateTo({
					url: '/subPackageB/pages/more/more?from=order',
					success: () => {
						// 确保每次跳转都重新绑定事件
						uni.$once('select-hospital', (hospital) => {
							this.selectedHospital = hospital.name;
							this.saveFormData(); // 存储最新选择的医院
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
					selectedAddress: this.selectedAddress,
					selectedHospital: this.selectedHospital, // 存储医院
					customRequirements: this.customRequirements,

					serviceData: this.serviceData, // 新增服务数据保存
					service_price: this.service_price, // 新增价格保存
					timestamp: new Date().getTime()
				};
				uni.setStorageSync('order_form_full_data', formData);
			},

			restoreFormData() {
				const savedData = uni.getStorageSync('order_form_full_data');
				if (savedData && !this.isDataExpired(savedData.timestamp)) {
					// 恢复表单数据
					if (!this.selectedDepartment) this.selectedDepartment = savedData.selectedDepartment;
					if (!this.selectedCheckboxes) this.selectedCheckboxes = savedData.selectedCheckboxes;
					if (!this.photoList) this.photoList = savedData.photoList;
					if (!this.selectedDateTime) this.selectedDateTime = savedData.selectedDateTime;
					if (!this.selectedDateTimeISO) this.selectedDateTimeISO = savedData.selectedDateTimeISO;
					if (!this.selectedPatientName) this.selectedPatientName = savedData.selectedPatientName;
					if (!this.selectedDoctorName) this.selectedDoctorName = savedData.selectedDoctorName;
					if (!this.selectAddress) this.selectAddress = savedData.selectAddress;
					if (!this.customRequirements) this.customRequirements = savedData.customRequirements || '';


					Object.keys(savedData).forEach(key => {
						if (!this[key] && savedData[key]) {
							this[key] = savedData[key];
						}
					});
				} else {
					uni.removeStorageSync('order_form_full_data');
				}
			},

			isDataExpired(timestamp) {
				return new Date().getTime() - timestamp > this.STORAGE_EXPIRE;
			},

			clearFormData() {
				// 重置所有表单数据
				this.selectedDepartment = null;
				this.selectedCheckboxes = [];
				this.photoList = [];
				this.selectedDateTime = '';
				this.selectedPatientName = '';
				this.selectedPatientPhone = '';
				this.selectedDoctorName = '';
				this.selectedDoctorId = '';
				this.selectedHospital = '';
				this.selectAddress = '';
				this.customRequirements = '';

				// 清除本地缓存
				uni.removeStorageSync('selectedAddress');
				uni.removeStorageSync('selectedDoctor');
				uni.removeStorageSync('selectedPatient');
				uni.removeStorageSync('photoList');

				// 删除已上传的图片文件（如果有）
				this.clearPhotoCache();
			},

			clearPhotoCache() {
				if (this.photoList && this.photoList.length > 0) {
					const fs = uni.getFileSystemManager();
					this.photoList.forEach(path => {
						try {
							fs.unlinkSync(path); // 删除物理文件
						} catch (e) {
							console.error('删除文件失败:', e);
						}
					});
					this.photoList = [];
				}
			},

			goToDepartmentPage() {
				uni.navigateTo({
					url: '/subPackageB/pages/department/department?selected=' + (this.selectedDepartment || '')
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
					date.setDate(date.getDate() + i + 1);
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
				const dateMatch = date.day.match(/(\d+)月(\d+)日/);
				if (!dateMatch) {
					console.error('日期格式解析错误:', date.day);
					return;
				}

				const month = parseInt(dateMatch[1]);
				const day = parseInt(dateMatch[2]);
				const timeMatch = time.match(/(\d+):(\d+)/);
				if (!timeMatch) {
					console.error('时间格式解析错误:', time);
					return;
				}

				const hours = parseInt(timeMatch[1]);
				const minutes = parseInt(timeMatch[2]);

				// 2. 创建 Date 对象（当前年份）
				const currentYear = new Date().getFullYear();
				const dateObj = new Date(currentYear, month - 1, day, hours, minutes);

				// 3. 转换为 ISO 字符串格式 (UTC)
				this.selectedDateTimeISO = dateObj.toISOString();

				// 测试输出
				console.log('原始时间:', this.selectedDateTime);
				console.log('转换后时间:', this.selectedDateTimeISO);

				this.hideDateTimePicker();
			},

			goToPatientManagement() {
				// 跳转前保存所有数据
				this.saveFormData();
				uni.setStorageSync('current_service', this.serviceData);

				uni.navigateTo({
					url: '/subPackageB/pages/patientManagement/patientManagement'
				});
			},

			goToDoctorList() {
				if (this.selectedDateTime == '') {
					uni.showToast({
						title: '请先选择时间',
						icon: 'none'
					});
					return;
				}
				this.saveFormData();
				uni.setStorageSync('current_service', this.serviceData);

				// 关键修改：使用已转换的 ISO 字符串创建 Date 对象
				if (!this.selectedDateTimeISO) {
					console.error("selectedDateTimeISO 为空，时间转换失败");
					return;
				}

				// 检查 duration 是否有效
				if (typeof this.serviceData.duration !== 'number' || isNaN(this.serviceData.duration) || this.serviceData
					.duration <= 0) {
					console.error("serviceData.duration 无效（必须是正数）:", this.serviceData.duration);
					return;
				}

				// 使用 ISO 字符串创建 startTime（确保有效）
				const startTime = new Date(this.selectedDateTimeISO);
				// 二次验证 startTime 是否有效
				if (isNaN(startTime.getTime())) {
					console.error("startTime 无效，ISO 字符串格式错误:", this.selectedDateTimeISO);
					return;
				}
				// 计算结束时间
				const endTime = new Date(startTime.getTime() + this.serviceData.duration * 60 * 60 * 1000);
				// 验证 endTime 是否有效
				if (isNaN(endTime.getTime())) {
					console.error("endTime 无效，可能是 duration 过大导致时间溢出");
					return;
				}

				const timeObj = this.convertTimeToValue(this.selectedDateTime);
				console.log("timeObj", timeObj)
				// 检查 timeObj 是否有效
				if (timeObj === null || timeObj === undefined) {
					console.error('生成 timeObj 失败，selectedDateTime 可能为空');
					uni.showToast({
						title: '请先选择服务时间',
						icon: 'none'
					});
					return; // 阻止跳转
				}

				// 跳转前添加日志
				const url = `/subPackageC/pages/doctorlist/doctorlist?timeObj=${timeObj}&` +
					`startTime=${encodeURIComponent(startTime.toISOString())}&` +
					`endTime=${encodeURIComponent(endTime.toISOString())}&` +
					`from=order`;
				console.log('跳转的完整URL:', url); // 关键日志：查看 URL 中是否有 timeObj=xxx

				uni.navigateTo({
					url
				});
			},

			goToAddressList() {
				uni.navigateTo({
					url: '/subPackageB/pages/myAddress/myAddress'
				});
			},

			// 处理自定义需求输入
			onCustomRequirementsInput(e) {
				this.customRequirements = e.detail.value;
			},
			convertTimeToValue(timeStr) {
				if (!timeStr) return null;

				// 解析字符串
				const parts = timeStr.split(' ');
				if (parts.length < 3) return null;

				const weekDay = parts[1]; // 获取周几
				const time = parts[2]; // 获取时间

				// 周几映射
				const weekMap = {
					'周一': 0,
					'周二': 1,
					'周三': 2,
					'周四': 3,
					'周五': 4,
					'周六': 5,
					'周日': 6
				};

				// 判断上午/下午
				const hour = parseInt(time.split(':')[0]);
				const isAfternoon = hour >= 12;

				// 计算值
				const weekValue = weekMap[weekDay] || 0;
				return isAfternoon ? weekValue + 7 : weekValue;
			},
		}
	};
</script>

<style scoped>
	/* 添加错误状态样式 */
	.error-field {
		border: 1px solid #ff4d4f !important;
		border-radius: 8rpx;
		animation: shake 0.5s;
	}

	@keyframes shake {

		0%,
		100% {
			transform: translateX(0);
		}

		25% {
			transform: translateX(-5px);
		}

		75% {
			transform: translateX(5px);
		}
	}

	.page {
		height: 100vh;
	}

	.page-container {
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 padding 包含在宽度内 */
		padding-left: 25rpx;
		padding-right: 25rpx;
		height: calc(100vh - var(--nav-height));
		overflow-y: auto;
	}

	.page-container ::-webkit-scrollbar {
		display: none;
		/* Chrome/Safari */
		width: 0 !important;
		/* 微信小程序可能需要 */
		height: 0 !important;
	}

	.container {
		height: auto;
		margin: 0 20rpx;
		margin-top: 40rpx;
		padding: 20rpx;
		padding-bottom: 200rpx;
		margin-bottom: 40rpx;
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

	/* 必填项标记样式 */
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
		background-color: #1fc7d6;
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

	.requirements {
		margin-top: 20rpx;
	}

	.requirements-group {
		margin-bottom: 20rpx;
	}

	.group-title {
		font-size: 16px;
		color: #545454;
		margin-bottom: 10rpx;
		padding-left: 10rpx;
		border-left: 4px solid #1fc7d6;
	}

	.requirements-list {
		display: flex;
		flex-wrap: wrap;
		/* 	justify-content: space-between; */
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
		margin: 12rpx 5rpx;
		transition: background-color 0.3s, color 0.3s;
		min-height: 64rpx;
		box-sizing: border-box;
	}

	.custom-checkbox.selected {
		background-color:#1fc7d6;
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

	.requirements-textarea {
		margin-top: 20rpx;
	}

	.textarea-label {
		font-size: 16px;
		color: #545454;
		margin-bottom: 10rpx;
		display: block;
	}

	textarea {
		width: auto;
		min-height: 120rpx;
		padding: 15rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		font-size: 15px;
		line-height: 1.5;
	}

	.textarea-placeholder {
		color: #b3b3b3;
	}

	.char-count {
		display: block;
		text-align: right;
		font-size: 14px;
		color: #999;
		margin-top: 8rpx;
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
		color: #1fc7d6;
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
		color:#1fc7d6;
	}

	.date-item.active .week {
		color:#1fc7d6;
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