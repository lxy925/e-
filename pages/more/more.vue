<template>
	<view class="more-container">
		<custom-nav title="e陪无忧"></custom-nav>
		<!-- 顶部搜索和切换区域 -->
		<view class="header">
			<view class="search-box">
				<view class="filter-btn" @tap="showFilter">
					<text class="filter-text">筛选</text>
					<text class="filter-icon">▼</text>
				</view>
				<input type="text" 
					class="search-input"
					:placeholder="'搜索医院'" 
					v-model="searchText"
					@input="onSearch"/>
				
			</view>
		
		</view>

		<!-- 筛选弹出层 -->
		<view class="filter-mask" v-if="showFilterPanel" @tap="hideFilter">
			<view class="filter-panel" @tap.stop>
				<view class="filter-header">
					<text>筛选条件</text>
					<text class="close-btn" @tap="hideFilter">×</text>
				</view>
				
				<!-- 医院筛选条件 -->
				<view v-if="currentType === 'hospital'" class="filter-content">
					<view class="filter-section location-section">
						<view class="section-title">地理位置</view>
						<view class="location-container">
							<!-- 省份列表 -->
							<scroll-view class="location-column" scroll-y>
								<view 
									v-for="province in locations.provinces" 
									:key="province"
									:class="['location-item', selectedProvince === province ? 'active' : '']"
									@tap="selectProvince(province)">
									{{province}}
								</view>
							</scroll-view>
							
							<!-- 城市列表 -->
							<scroll-view class="location-column" scroll-y>
								<view 
									v-for="city in availableCities" 
									:key="city"
									:class="['location-item', selectedCity === city ? 'active' : '']"
									@tap="selectCity(city)">
									{{city}}
								</view>
							</scroll-view>
							
							<!-- 区域列表 -->
							<scroll-view class="location-column" scroll-y>
								<view 
									v-for="district in availableDistricts" 
									:key="district"
									:class="['location-item', selectedDistrict === district ? 'active' : '']"
									@tap="selectDistrict(district)">
									{{district}}
								</view>
							</scroll-view>
						</view>
					</view>
					<view class="filter-section">
						<view class="section-title">医院等级</view>
						<view class="filter-options">
							<view 
								v-for="level in hospitalLevels" 
								:key="level"
								:class="['filter-option', selectedLevel === level ? 'active' : '']"
								@tap="selectLevel(level)">
								{{level}}
							</view>
						</view>
					</view>
					<view class="filter-section">
						<view class="section-title">医院类型</view>
						<view class="filter-options">
							<view 
								v-for="type in hospitalTypes" 
								:key="type"
								:class="['filter-option', selectedType === type ? 'active' : '']"
								@tap="selectType(type)">
								{{type}}
							</view>
						</view>
					</view>
					
				</view>
				
				<!-- 疾病筛选条件 -->
				<view v-else class="filter-content">
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

		<!-- 医院列表内容 -->
		<view class="hospital-content" v-if="currentType === 'hospital'">
			<view class="hospital-grid">
				<view class="hospital-card" v-for="hospital in hospitals" :key="hospital.id" @tap="goToHospitalDetail(hospital.id)">
					<image :src="hospital.image" mode="aspectFill"></image>
					<view class="hospital-info">
						<text class="hospital-name">{{hospital.name}}</text>
						<text class="hospital-level">{{hospital.level}}</text>
						<text class="hospital-address">{{hospital.address}}</text>
					</view>
				</view>
			</view>
		</view>

		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentType: 'hospital', // 当前选择的类型：hospital/disease
				searchText: '', // 搜索文本
				
				hospitals: [
					{
						id: 1,
						name: '北京协和医院',
						level: '三级甲等',
						address: '北京市东城区帅府园1号',
						image: '/static/images/hospital1.jpg'
					},
					// ... 更多医院数据
				],
			
				showFilterPanel: false,
				hospitalLevels: ['三级甲等', '三级乙等', '二级甲等', '二级乙等'],
				hospitalTypes: ['综合医院', '专科医院', '中医医院', '民营医院'],

				
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
				locations: {
					provinces: ['北京', '上海', '广东', '江苏'], // 示例省份
					cities: {
						'北京': ['北京市'],
						'上海': ['上海市'],
						'广东': ['广州市', '深圳市', '珠海市'],
						'江苏': ['南京市', '苏州市', '无锡市'],
					},
					districts: {
						'北京市': ['东城区', '西城区', '朝阳区', '海淀区'],
						'广州市': ['天河区', '越秀区', '海珠区', '白云区'],
						// ... 其他城市的区域
					}
				},
				selectedProvince: '',
				selectedCity: '',
				selectedDistrict: '',
			}
		},
		computed: {
			availableCities() {
				return this.selectedProvince ? this.locations.cities[this.selectedProvince] : []
			},
			availableDistricts() {
				return this.selectedCity ? this.locations.districts[this.selectedCity] : []
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
			
			goToHospitalDetail(hospitalId) {
				uni.navigateTo({
					url: `/pages/hospital/detail?id=${hospitalId}`
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
				this.selectedProvince = ''
				this.selectedCity = ''
				this.selectedDistrict = ''
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
				}
				this.hideFilter()
			},
			filterHospitals() {
				// 实现医院筛选逻辑
				console.log('筛选条件：', this.filterConditions.hospital)
			},
			
			selectProvince(province) {
				if (this.selectedProvince === province) {
					this.selectedProvince = ''
					this.selectedCity = ''
					this.selectedDistrict = ''
				} else {
					this.selectedProvince = province
					this.selectedCity = ''
					this.selectedDistrict = ''
				}
			},
			selectCity(city) {
				if (this.selectedCity === city) {
					this.selectedCity = ''
					this.selectedDistrict = ''
				} else {
					this.selectedCity = city
					this.selectedDistrict = ''
				}
			},
			selectDistrict(district) {
				this.selectedDistrict = this.selectedDistrict === district ? '' : district
			},
		}
	}
</script>

<style scoped>
.more-container {
	width: 100%;
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-top: 200rpx;
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
	top: 180rpx;
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
