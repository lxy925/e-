<template>
	<view class="page">
		<custom-nav title="陪诊师入驻" :isHomePage="false"></custom-nav>

		<view class="container">
			<!-- 头像上传 -->
			<view class="custom-field custom-field1">
				<text class="label">头像</text>
				<view class="input" @click="chooseMedia('avatarList')">
					<view v-if="!(formData.avatarList)" class="placeholder">点击上传真实头像</view>
					<image v-else :src="formData.avatarList" class="avatar"></image>
				</view>
			</view>

			<!-- 姓名 -->
			<view class="custom-field">
				<text class="label">姓名</text>
				<input v-model="formData.name" placeholder="请输入姓名" class="input" />
			</view>

			<!-- 年龄 -->
			<view class="custom-field">
				<text class="label">年龄</text>
				<input v-model="formData.age" placeholder="请输入年龄" type="number" class="input" />
			</view>

			<!-- 性别 -->
			<view class="custom-field">
				<text class="label">性别</text>
				<view class="input">
					<radio-group class="gender" @change="onGenderChange">
						<label class="radio">
							<radio value="男" :checked="formData.gender === '男'" />男
						</label>
						<label class="radio">
							<radio value="女" :checked="formData.gender === '女'" />女
						</label>
					</radio-group>
				</view>
			</view>

			<!-- 手机号 -->
			<view class="custom-field">
				<text class="label">手机号</text>
				<input v-model="formData.phone" placeholder="请输入手机号" type="tel" class="input" />
			</view>

			<!-- 所在城市 -->
			<view class="custom-field" @click="showCityPicker = true">
				<text class="label">所在地区</text>
				<view class="input">{{ selectedAddress || "请选择城市" }}</view>
			</view>
			<view class="action-sheet" v-if="showCityPicker">
				<view class="picker-buttons">
					<button @click="closeCityPicker">取消</button>
					<button @click="confirmCityPicker" style="margin-right: 0rpx;">确定</button>
				</view>
				<picker-view class="picker-view" indicator-style="height: 50px;" @change="onCityChange">
					<picker-view-column>
						<view v-for="(province, index) in filteredProvinces" :key="index" class="picker-item">
							{{ province.provinceName }}
						</view>
					</picker-view-column>
					<picker-view-column>
						<view v-for="(city, index) in currentCityList" :key="index" class="picker-item">
							{{ city.cityName }}
						</view>
					</picker-view-column>
					<picker-view-column>
						<view v-for="(area, index) in currentAreaList" :key="index" class="picker-item">
							{{ area.areaName }}
						</view>
					</picker-view-column>
				</picker-view>
			</view>
			<!-- 身份证号码 -->
			<view class="custom-field">
				<text class="label">身份证号码</text>
				<input v-model="formData.idNumber" placeholder="请输入身份证号码" type="idcard" class="input" />
			</view>
			<!-- 资格证号 -->
			<view class="custom-field">
				<text class="label">资格证号 (选填)</text>
				<input v-model="formData.qualificationNumber" placeholder="请输入资格证号" class="input" />
			</view>

			<!-- 证书上传 -->
			<view class="custom-field custom-field1">
				<text class="label">证书 (选填)</text>
				<view class="input" @click="chooseMedia('certificateList')">
					<view v-if="!(formData.certificateList)" class="placeholder">点击上传证书</view>
					<image v-else :src="formData.certificateList" class="book"></image>
				</view>
			</view>



			<!-- 身份证正反面图片上传 -->
			<!-- 	<view class="custom-field custom-field1">
				<text class="label">身份证正面</text>
				<view class="input" @click="chooseMedia('idCardFrontList')">
					<view v-if="!(formData.idCardFrontList)" class="placeholder">点击上传身份证正面</view>
					<image v-else :src="formData.idCardFrontList" class="book"></image>
				</view>
			</view>
			<view class="custom-field custom-field1">
				<text class="label">身份证反面</text>
				<view class="input" @click="chooseMedia('idCardBackList')">
					<view v-if="!(formData.idCardBackList)" class="placeholder">点击上传身份证反面</view>
					<image v-else :src="formData.idCardBackList" class="book"></image>
				</view>
			</view> -->
			<!-- 语言能力 -->
			<view class="custom-field">
				<text class="label">语言能力</text>
				<input v-model="formData.language" placeholder="请输入语言能力" class="input" />
			</view>

			<!-- 是否提供接送 -->
			<view class="custom-field">
				<text class="label">是否提供接送</text>
				<view class="input">
					<radio-group class="provide-transport" @change="onProvideTransportChange">
						<label class="radio">
							<radio value=true :checked="formData.provide_transport === true" />是
						</label>
						<label class="radio">
							<radio value=false :checked="formData.provide_transport === false" />否
						</label>
					</radio-group>
				</view>
			</view>

			<!-- 熟悉的医院 -->
			<view class="custom-field custom-field2" @click="goToSelectHospitals" style="height: auto;">
				<text class="label">熟悉的医院</text>
				<view class="input input2">
					<view class="placeholder" style="text-align: left;margin-bottom: 10rpx;">点击添加熟悉的医院</view>
					<view class="selected-hospitals">
						<view v-for="(hospital, index) in formData.familiar_hospitals" :key="hospital.id"
							class="hospital-item">
							<text>{{ hospital}}</text>
							<view class="remove-btn" @click.stop="removeHospital(index)">×</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 熟悉的科室 -->
			<view class="custom-field custom-field2" style="height: 430rpx;">
				<text class="label">熟悉的科室</text>
				<view class="input input2">
					<view class="tags">
						<view v-for="(department, index) in departments" :key="index" class="tag"
							:class="{ selected: formData.familiar_departments.includes(department) }"
							@click="toggleDepartmentSelection(department)">
							{{ department }}
						</view>
					</view>
				</view>
			</view>

			<!-- 自我介绍 -->
			<view class="custom-field custom-field2">
				<text class="label">自我介绍</text>
				<textarea v-model="formData.self_introduction" placeholder="请输入自我介绍" class="input input1" />
			</view>
			<!-- 用户协议 -->
			<view class="deal">
				<checkbox :checked="agreeTerms" class="checkbox" @click="onCheckboxChange" />我已阅读并同意
				<text class="user_deal" @click="goToUser_deal">用户协议</text>和
				<text class="service_deal" @click="goToService_deal">服务协议</text>
			</view>

			<!-- 注册按钮 -->
			<button type="primary" block @click="submitForm" :disabled="!agreeTerms" class="button">
				注册陪诊师
			</button>
		</view>
	</view>
</template>

<script>
	import {
		ref
	} from 'vue';
	import citys from '../../Utils/citys.js'; // 引入外部文件

	export default {
		data() {
			return {
				formData: {
					user_id: "",
					name: "",
					age: "",
					gender: "",
					phone: "",
					city: {
						provinceName: "",
						cityName: "",
						areaName: "",
					},
					qualificationNumber: "",
					idNumber: "",
					avatarList: "",
					certificateList: "",
					self_introduction: "", // 自我介绍
					language: "", // 语言能力
					provide_transport: "", // 是否提供接送
					familiar_hospitals: "", // 熟悉的医院
					familiar_departments: [], // 熟悉的科室（改为数组存储）
				},
				selectedHospital: null, // 用于存储选中的医院信息
				selectedHospitalList: [],
				avatarList: "",
				certificateList: "",
				idCardFrontList: "",
				idCardBackList: "",
				showCityPicker: false,
				agreeTerms: false,
				selectedProvince: null,
				selectedCity: null,
				selectedArea: null,
				selectedAddress: null,
				citys: citys, // 加载外部文件数据
				currentCityList: [],
				currentAreaList: [],
				departments: [
					"内科", "外科", "妇产科", "儿科", "五官科", "肿瘤科", "神经内科", "神经外科",
					"心血管内科", "心血管外科", "呼吸内科", "消化内科", "泌尿外科", "骨科",
					"皮肤科", "眼科", "耳鼻喉科", "口腔科", "中医科", "康复科", "急诊科",
					"麻醉科", "感染科", "精神科", "老年医学科", "全科医学科", "其他"
				], // 完整的科室列表
				userInfo:{}
			};
		},
		onLoad(options) {
			this.userInfo = uni.getStorageSync('userInfo');
			console.log(this.userInfo)
			if (this.userInfo) {
				this.formData.user_id = this.userInfo.ID,
					this.formData.name = this.userInfo.realName,
					this.formData.phone = this.userInfo.phone,
					this.formData.idNumber = this.userInfo.idNumber
			} else {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 2000,
				});
				uni.navigateTo({
					url: '/pages/userInfoDetail/userInfoDetail?from=mine'
				});
			}
			if (options.familiarHospitals) {
				try {
					// 确保传入的是数组
					const hospitals = JSON.parse(options.familiarHospitals);
					if (Array.isArray(hospitals)) {
						this.formData.familiar_hospitals = hospitals.name;
					} else {
						console.error('familiarHospitals is not an array:', hospitals);
					}
				} catch (error) {
					console.error('Error parsing familiarHospitals:', error);
				}
			}

			uni.$on('select-hospital', (hospital) => {
								// 确保 formData.familiar_hospitals 是数组
								if (!Array.isArray(this.formData.familiar_hospitals)) {
									this.formData.familiar_hospitals = [];
								}
								this.formData.familiar_hospitals.push(hospital.name);
								console.log('选中的医院信息：', hospital.name);
							});

		},
		onUnload() {
			// 页面卸载时移除监听事件
			uni.$off('select-hospital');
		},
		computed: {
			// 过滤出广东省
			filteredProvinces() {
				return this.citys.filter(province => province.provinceCode === '440000');
			},
		},
		watch: {
			selectedProvince(newVal) {
				if (newVal) {
					const province = this.citys.find(province => province.provinceCode === newVal);
					if (province) {
						this.currentCityList = province.mallCityList || [];
					} else {
						console.error('Province not found:', newVal);
						this.currentCityList = [];
					}
				}
			},
			selectedCity(newVal) {
				if (newVal) {
					const city = this.currentCityList.find(city => city.cityCode === newVal);
					if (city) {
						this.currentAreaList = city.mallAreaList || [];
					} else {
						console.error('City not found:', newVal);
						this.currentAreaList = [];
					}
				}
			},
		},
		methods: {
			onCheckboxChange(event) {
				// 更新 agreeTerms 的值
				this.agreeTerms = !this.agreeTerms;
				console.log('Checkbox changed:', this.agreeTerms);
			},
			chooseMedia(listName) {
				uni.chooseMedia({
					count: 1,
					mediaType: ['image'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const filePath = res.tempFiles[0].tempFilePath;

						this.formData[listName] = filePath;
						console.log(this.formData[listName])

						// this.uploadImage(filePath, listName);
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
						uni.showToast({
							title: '选择图片失败',
							icon: 'none',
							duration: 2000,
						});
					},
				});
			},


			// async uploadImage() {
			// 	if (!(this.avatarList && this.certificateList && this.idCardFrontList && this.idCardBackList)) {
			// 		uni.showToast({
			// 			title: '请先选择图片',
			// 			icon: 'none',
			// 			duration: 2000,
			// 		});
			// 		return;
			// 	}

			// 	const uploadTask = uniCloud.uploadFile({
			// 		filePath: this.imagePath,
			// 		cloudPath: `escorts/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.png`, // 云端路径
			// 		onUploadProgress: (progress) => {
			// 			console.log('上传进度:', progress);
			// 		},
			// 	});

			// 	try {
			// 		const result = await uploadTask;
			// 		this.formData.avatarUrl = result.fileID; // 获取上传后的文件 ID
			// 		uni.showToast({
			// 			title: '上传成功',
			// 			icon: 'success',
			// 			duration: 2000,
			// 		});
			// 	} catch (err) {
			// 		console.error('上传失败:', err);
			// 		uni.showToast({
			// 			title: '上传失败',
			// 			icon: 'none',
			// 			duration: 2000,
			// 		});
			// 	}
			// },
			onCityChange(event) {
				const [provinceIndex, cityIndex, areaIndex] = event.detail.value;

				if (provinceIndex >= 0 && provinceIndex < this.filteredProvinces.length) {
					this.selectedProvince = this.filteredProvinces[provinceIndex].provinceCode;
				} else {
					console.error('Invalid province index:', provinceIndex);
					return;
				}

				if (cityIndex >= 0 && cityIndex < this.currentCityList.length) {
					this.selectedCity = this.currentCityList[cityIndex].cityCode;
				} else {
					console.error('Invalid city index:', cityIndex);
					return;
				}

				if (areaIndex >= 0 && areaIndex < this.currentAreaList.length) {
					this.selectedArea = this.currentAreaList[areaIndex].areaCode;
				} else {
					console.error('Invalid area index:', areaIndex);
					return;
				}
			},
			closeCityPicker() {
				this.showCityPicker = false;
			},
			confirmCityPicker() {
				const provinceName = this.filteredProvinces.find(province => province.provinceCode === this
					.selectedProvince)?.provinceName || '';
				const cityName = this.currentCityList.find(city => city.cityCode === this.selectedCity)?.cityName || this
					.currentCityList[0].cityName;
				const areaName = this.currentAreaList.find(area => area.areaCode === this.selectedArea)?.areaName || this
					.currentAreaList[0].areaName;

				if (provinceName && cityName && areaName) {
					this.formData.city = {
						provinceName: provinceName,
						cityName: cityName,
						areaName: areaName,
					}
					console.log(this.formData.city)
				}
				this.selectedAddress = `${provinceName} ${cityName} ${areaName}`;
				this.showCityPicker = false;
			},
			onGenderChange(event) {
				this.formData.gender = event.detail.value;
			},
			onOversize() {
				uni.showToast({
					title: "文件大小不能超过5MB",
					icon: "none",
				});
			},
			validateFormData() {
				const errors = [];
				if (!this.formData.name) {
					errors.push('姓名不能为空');
					return errors;
				}
				if (!this.formData.age || isNaN(this.formData.age)) {
					errors.push('年龄必须是有效的数字');
					return errors;
				}
				if (!this.formData.gender) {
					errors.push('性别不能为空');
					return errors;
				}
				if (!this.formData.phone || !/^\d{11}$/.test(this.formData.phone)) {
					errors.push('手机号码格式不正确');
					return errors;
				}
				if (!this.formData.city.areaName) {
					errors.push('所在地区不能为空');
					return errors;
				}
				if (!this.formData.qualificationNumber) {
					errors.push('资格证号不能为空');
					return errors;
				}
				if (!this.formData.certificateList) {
					errors.push('证书不能为空');
					return errors;
				}
				if (!this.formData.idNumber || !/^\d{18}$/.test(this.formData.idNumber)) {
					errors.push('身份证号码格式不正确');
					return errors;
				}


				//     if (!this.formData.idCardBackList) {
				//       errors.push('身份证反面不能为空');
				//     }
				return errors;
			},
			async submitForm() {
				if (!this.agreeTerms) {
					uni.showToast({
						title: "请先同意用户协议",
						icon: "none",
					});
					return;
				}
				// const errors = this.validateFormData();
				// if (errors.length > 0) {
				// 	// 如果有错误，显示错误提示
				// 	errors.forEach(error => {
				// 		uni.showToast({
				// 			title: error,
				// 			icon: 'none',
				// 			duration: 2000,
				// 		});
				// 	});
				// 	return;
				// }
				console.log("提交的表单数据：", this.formData);
				const {
					result
				} = await uniCloud.callFunction({
					name: 'addEscorts',
					data: this.formData,
				});

				if (result.code === 200) {
					uni.showToast({
						title: '注册成功',
						icon: 'success',
						duration: 2000,
					});
					this.userInfo.type="陪诊师",
					
					uni.setStorageSync('userInfo', this.userInfo); // 更新缓存中的 userInfo
					console.log("userInfo",uni.getStorageSync('userInfo'))
					uni.navigateBack({
						delta: 1
					});
				} else {
					uni.showToast({
						title: result.message || '注册失败',
						icon: 'none',
						duration: 2000,
					});
				}


			},
			goToSelectHospitals() {
				// 传递当前选中的医院列表
				uni.navigateTo({
					url: '/pages/more/more?familiarHospitals=' + JSON.stringify(this.formData.familiar_hospitals),
				});
			},
			toggleDepartmentSelection(department) {
				if (this.formData.familiar_departments.includes(department)) {
					// 如果已经选中，取消选中
					this.formData.familiar_departments = this.formData.familiar_departments.filter(
						(item) => item !== department
					);
				} else {
					// 如果未选中，添加到选中列表
					this.formData.familiar_departments.push(department);
					console.log(this.formData.familiar_departments)
				}
			},
			onProvideTransportChange(event) {
				this.formData.provide_transport = event.detail.value;
			},
			onDepartmentChange(event) {
				this.formData.familiar_departments = this.departments[event.detail.value];
			},

			// 移除选中的医院
			removeHospital(index) {
				this.formData.familiar_hospitals.splice(index, 1);
			},
			goToUser_deal() {
				// 跳转到用户协议页面
			},
			goToService_deal() {
				// 跳转到服务协议页面
			},

		},
		mounted() {
			if (this.filteredProvinces.length > 0) {
				this.selectedProvince = this.filteredProvinces[0].provinceCode;

				this.currentCityList = this.filteredProvinces[0].mallCityList || [];
				this.currentAreaList = this.filteredProvinces[0].mallCityList[0].mallAreaList || [];
			}
		},
	};
</script>

<style>
	.page {
		padding-top: 190rpx;
		height: 100%;

		background: linear-gradient(to bottom, #0bd6c8, #99efe9, #ddf5f4, rgb(226, 226, 226));
	}

	.container {
		background-color: #fff;
		margin: 25rpx;
		margin-top: 0rpx;
		padding: 20rpx 30rpx;
		padding-bottom: 50rpx;
		border-radius: 50rpx;
		height: min-content;

	}

	.custom-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1px solid #eee;
		width: 100%;
		border: none;
		height: 50rpx;
	}

	.custom-field1 {
		height: 200rpx;
	}

	.custom-field2 {
		flex-direction: column;
		align-items: start;
		height: 300rpx;
	}

	.label {
		margin-left: 20rpx;
	}

	.input {
		flex: 1;
		text-align: right;
		margin-right: 20rpx;
	}

	.input1 {
		display: block;
		background-color: #eee;
		margin-top: 20rpx;
		width: 100%;
		height: 250rpx;
		border-radius: 20rpx;
		text-align: left;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.input2 {
		margin-top: 20rpx;
		width: 100%;
		height: 250rpx;
		padding: 20rpx;

	}

	.input .placeholder {
		color: #ccc;
	}

	.placeholder {
		color: #ccc;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: #ccc;
	}

	.book {
		width: 200rpx;
		height: 100rpx;
		border-radius: 10%;
		background-color: #ccc;
	}

	.gender {
		display: flex;
		justify-content: flex-end;
	}

	.radio {
		margin-left: 20rpx;
	}

	.button {
		margin-top: 60rpx;
		width: 500rpx;
		border-radius: 20rpx;
		background-color:  #0bd6c8;
		color: white;
		text-align: center;
		padding: 20rpx 0;
	}

	.deal {
		margin-top: 22rpx;
		color: #ccc;
		font-size: 25rpx;
	}

	.user_deal,
	.service_deal {
		display: inline;
		color: #1b67ff;
	}

	.action-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: white;
		z-index: 1000;
		border-radius: 50rpx;
		box-shadow: #ccc;
	}

	.picker-view {
		height: 500rpx;
	}

	.picker-item {
		text-align: center;
		line-height: 50px;
	}

	.picker-buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 10rpx 0rpx;
		width: 100%;
	}

	.picker-buttons button {
		flex: 1;
		display: block;
		margin-right: 150rpx;
		font-size: 25rpx;
		text-align: center;
		color: #999;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.tag {
		padding: 5rpx 10rpx;
		background-color: #f5f5f5;
		color: #333;
		border-radius: 5rpx;
		font-size: 26rpx;

		border-radius: 10rpx;
		cursor: pointer;
	}

	.tag.selected {
		background-color: #0bd6c8;
		color: white;
	}

	.selected-hospitals {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.hospital-item {
		background-color: #ddf5f4;
		color: #0bd6c8;
		padding: 10rpx;
		border-radius: 10rpx;
		display: flex;
		justify-content: space-between;
		width: 40%;
		
	}

	.hospital-item text {
		font-size: 26rpx;
		color: #333;
		text-align: left;
		color: #0bd6c8;
		margin-left: 5rpx;
	}

	.remove-btn {
		/* position: absolute;
		top: 20%;
		right: 0; */
		font-size: 30rpx;
		border-radius: 50%;
		width: 40rpx;
		height: 40rpx;
		background-color: #ccc;
		cursor: pointer;
		text-align: center;
		color: white;
	}
</style>