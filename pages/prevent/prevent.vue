<template>
	<view class="more-container">
		<!-- 顶部搜索和切换区域 -->
		<view class="header">
			<view class="search-box">
				<view class="filter-btn" @tap="showFilter">
					<text class="filter-text">筛选</text>
					<text class="filter-icon">▼</text>
				</view>
				<input type="text" 
					class="search-input"
					:placeholder="currentType === 'hospital' ? '搜索医院' : '搜索疾病'" 
					v-model="searchText"
					@input="onSearch"/>
				
			</view>
			<!-- <view class="type-switch">
				<view :class="['switch-item', currentType === 'hospital' ? 'active' : '']" 
					  @tap="switchType('hospital')">医院</view>
				<view :class="['switch-item', currentType === 'disease' ? 'active' : '']" 
					  @tap="switchType('disease')">疾病</view>
			</view> -->
		</view>

		<!-- 筛选弹出层 -->
		<view class="filter-mask" v-if="showFilterPanel" @tap="hideFilter">
			<view class="filter-panel" @tap.stop>
				<view class="filter-header">
					<text>筛选条件</text>
					<text class="close-btn" @tap="hideFilter">×</text>
				</view>
				
				
				
				<!-- 疾病筛选条件 -->
				<view v-if="currentType === 'disease'" class="filter-content">
					<view class="filter-section">
						<view class="section-title">就医人群</view>
						<view class="filter-options">
							<view 
								v-for="group in patientGroups" 
								:key="group"
								:class="['filter-option', selectedGroup === group ? 'active' : '']"
								@tap="selectGroup(group)">
								{{group}}
							</view>
						</view>
					</view>
				</view>
				
				<!-- 筛选按钮 -->
				<view class="filter-buttons">
					<view class="reset-btn" @tap="resetFilter">重置</view>
					<view class="confirm-btn" @tap="confirmFilter">确定</view>
				</view>
			</view>
		</view>

		

		<!-- 疾病列表内容 -->
		<view class="disease-content" v-if="currentType === 'disease'">
			<scroll-view class="disease-categories" scroll-y>
				<view 
					v-for="category in diseaseCategories" 
					:key="category.id"
					:class="['category-item', selectedCategory === category.id ? 'active' : '']"
					@tap="selectCategory(category.id)">
					{{category.name}}
				</view>
			</scroll-view>
			<scroll-view class="disease-list" scroll-y>
				<view 
					class="disease-item"
					v-for="disease in diseases" 
					:key="disease.id"
					v-if="disease.categoryId==selectedCategory"
					@tap="goToDiseaseDetail(disease.id)">
					{{disease.name}}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentType: 'disease', // 当前选择的类型：hospital/disease
				searchText: '', // 搜索文本
				selectedCategory: null, // 选中的疾病分类
				
				diseaseCategories: [
					{ id: 1, name: '内科' },
					{ id: 2, name: '外科' },
					{ id: 3, name: '妇产科' },
					{ id: 4, name: '儿科' },
					// ... 更多科室
				],
				diseases: [
					{ id: 1, categoryId: 1, name: '高血压' },
					{ id: 2, categoryId: 1, name: '糖尿病' },
					// ... 更多疾病
				],
				showFilterPanel: false,
				

				patientGroups: ['儿童', '老年人', '孕妇', '慢性病患者'],
				selectedLevel: '',
				selectedType: '',
				selectedGroup: '',
				filterConditions: {
					hospital: {
						level: '',
						type: ''
					},
					disease: {
						group: ''
					}
				},
				
			}
		},
		
		methods: {
			switchType(type) {
				this.currentType = type
			},
			onSearch(e) {
				// 实现搜索逻辑
				console.log('搜索:', this.searchText)
			},
			selectCategory(categoryId) {
				this.selectedCategory = categoryId
				// 根据分类筛选疾病
				// this.diseases = ... 筛选逻辑
			},
		
			goToDiseaseDetail(diseaseId) {
				uni.navigateTo({
					url: `/pages/disease/detail?id=${diseaseId}`
				})
			},
			showFilter() {
				this.showFilterPanel = true
			},
			hideFilter() {
				this.showFilterPanel = false
			},
			selectLevel(level) {
				this.selectedLevel = this.selectedLevel === level ? '' : level
			},
			selectType(type) {
				this.selectedType = this.selectedType === type ? '' : type
			},
			selectGroup(group) {
				this.selectedGroup = this.selectedGroup === group ? '' : group
			},
			resetFilter() {
				this.selectedLevel = ''
				this.selectedType = ''
				this.selectedGroup = ''
				
			},
			confirmFilter() {
				// 保存筛选条件
				if (this.currentType === 'hospital') {
					this.filterConditions.hospital = {
						province: this.selectedProvince,
						city: this.selectedCity,
						district: this.selectedDistrict,
						level: this.selectedLevel,
						type: this.selectedType,
					}
					// 执行医院筛选
					this.filterHospitals()
				} else {
					this.filterConditions.disease = {
						group: this.selectedGroup
					}
					// 执行疾病筛选
					this.filterDiseases()
				}
				this.hideFilter()
			},
			// filterHospitals() {
			// 	// 实现医院筛选逻辑
			// 	console.log('筛选条件：', this.filterConditions.hospital)
			// },
			filterDiseases() {
				// 实现疾病筛选逻辑
				console.log('筛选条件：', this.filterConditions.disease)
			},
			// selectProvince(province) {
			// 	if (this.selectedProvince === province) {
			// 		this.selectedProvince = ''
			// 		this.selectedCity = ''
			// 		this.selectedDistrict = ''
			// 	} else {
			// 		this.selectedProvince = province
			// 		this.selectedCity = ''
			// 		this.selectedDistrict = ''
			// 	}
			// },
			// selectCity(city) {
			// 	if (this.selectedCity === city) {
			// 		this.selectedCity = ''
			// 		this.selectedDistrict = ''
			// 	} else {
			// 		this.selectedCity = city
			// 		this.selectedDistrict = ''
			// 	}
			// },
			// selectDistrict(district) {
			// 	this.selectedDistrict = this.selectedDistrict === district ? '' : district
			// },
		}
	}
</script>

<style scoped>
.more-container {
	width: 100%;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.header {
	width: 100%;
	height: 120rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	box-sizing: border-box;
}

.search-box {
	flex: 1;
	height: 70rpx;
	margin-right: 20rpx;
	position: relative;
}

.search-input {
	width: 100%;
	height: 70rpx;
	background-color: #f5f5f5;
	border-radius: 35rpx;
	padding: 0 120rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.search-icon {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	color: #999;
	font-size: 28rpx;
}

.type-switch {
	display: flex;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 35rpx;
	padding: 5rpx;
}

.switch-item {
	min-width: 120rpx;
	height: 60rpx;
	line-height: 60rpx;
	text-align: center;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #666;
	border-radius: 30rpx;
}

.switch-item.active {
	background-color: #02D4C6;
	color: #ffffff;
}

/* 医院列表样式 */
.hospital-content {
	width: 100%;
	padding: 20rpx;
	margin-top: 120rpx;
	box-sizing: border-box;
}

.hospital-grid {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.hospital-card {
	width: 48%;
	background-color: #ffffff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
}

.hospital-card image {
	width: 100%;
	height: 200rpx;
	text-align: center;
}

.hospital-info {
	padding: 20rpx;
}

.hospital-name {
	display: block;
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.hospital-level {
	display: block;
	font-size: 24rpx;
	color: #02D4C6;
	margin-bottom: 10rpx;
}

.hospital-address {
	display: block;
	font-size: 24rpx;
	color: #999;
}

/* 疾病列表样式 */
.disease-content {
	width: 100%;
	margin-top: 120rpx;
	display: flex;
	height: calc(100vh - 120rpx);
}

.disease-categories {
	width: 200rpx;
	background-color: #f5f5f5;
	height: 100%;
}

.category-item {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	font-size: 28rpx;
	color: #666;
	text-align: center;
	border-left: 6rpx solid transparent;
	box-sizing: border-box;
}

.category-item.active {
	color: #02D4C6;
	background-color: #ffffff;
	border-left-color: #02D4C6;
}

.disease-list {
	flex: 1;
	background-color: #ffffff;
	height: 100%;
}

.disease-item {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
	color: #333;
	border-bottom: 1rpx solid #eee;
	box-sizing: border-box;
}

.filter-btn {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	z-index: 1;
}

.filter-text {
	font-size: 28rpx;
	color: #666;
	margin-right: 6rpx;
}

.filter-icon {
	font-size: 24rpx;
	color: #666;
}

.filter-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
}

.filter-panel {
	position: absolute;
	top: 0;
	left: 0;
	width: 85%;
	height: 100%;
	background-color: #fff;
	padding: 40rpx 30rpx;
	box-sizing: border-box;
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 30rpx;
	border-bottom: 1rpx solid #eee;
}

.close-btn {
	font-size: 40rpx;
	color: #999;
	padding: 10rpx;
}

.filter-section {
	margin-top: 30rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 24rpx;
}

.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.filter-option {
	padding: 10rpx 30rpx;
	border-radius: 30rpx;
	background-color: #f5f5f5;
	font-size: 26rpx;
	color: #666;
}

.filter-option.active {
	background-color: #02D4C6;
	color: #fff;
}

.filter-buttons {
	position: absolute;
	bottom: 30rpx;
	left: 30rpx;
	right: 30rpx;
	display: flex;
	gap: 20rpx;
}

.reset-btn, .confirm-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	border-radius: 40rpx;
	font-size: 28rpx;
}

.reset-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #02D4C6;
	color: #fff;
}

.location-section {
	margin-bottom: 40rpx;
}

.location-container {
	display: flex;
	height: 500rpx;
	background: #fff;
	border-radius: 12rpx;
	margin-top: 20rpx;
}

.location-column {
	flex: 1;
	height: 100%;
	border-right: 1px solid #eee;
}

.location-column:last-child {
	border-right: none;
}

.location-item {
	padding: 24rpx 20rpx;
	font-size: 28rpx;
	color: #333;
	text-align: center;
	position: relative;
}

.location-item.active {
	color: #02D4C6;
	background-color: #f8f8f8;
}

.location-item.active::after {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 6rpx;
	height: 32rpx;
	background-color: #02D4C6;
}
</style>
