<template>
    <view class="container">
        <!-- 顶部搜索和切换区域 -->
        <view class="header">
            <view class="search-box">
                <input type="text" 
                    :placeholder="currentType === 'hospital' ? '搜索医院' : '搜索疾病'" 
                    v-model="searchText"
                    @input="onSearch"/>
                <text class="iconfont icon-search"></text>
            </view>
            <view class="type-switch">
                <text :class="['switch-item', currentType === 'hospital' ? 'active' : '']" 
                      @tap="switchType('hospital')">医院</text>
                <text :class="['switch-item', currentType === 'disease' ? 'active' : '']" 
                      @tap="switchType('disease')">疾病</text>
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
            currentType: 'hospital', // 当前选择的类型：hospital/disease
            searchText: '', // 搜索文本
            selectedCategory: null, // 选中的疾病分类
            hospitals: [
                {
                    id: 1,
                    name: '北京协和医院',
                    level: '三级甲等',
                    address: '北京市东城区帅府园1号',
                    image: '/static/images/hospital1.jpg'
                },
				{
					id: 2,
                    name: '北京协和医院',
                    level: '三级甲等',
                    address: '北京市东城区帅府园1号',
                    image: '/static/images/hospital1.jpg'
				}
                // ... 更多医院数据
            ],
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
            ]
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
        goToHospitalDetail(hospitalId) {
            uni.navigateTo({
                url: `/pages/hospital/detail?id=${hospitalId}`
            })
        },
        goToDiseaseDetail(diseaseId) {
            uni.navigateTo({
                url: `/pages/disease/detail?id=${diseaseId}`
            })
        }
    }
}
</script>

<style>
.container {
    padding: 20rpx;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.search-box {
    flex: 1;
    position: relative;
    margin-right: 20rpx;
	

}

.search-box input {
    width: 100%;
    height: 70rpx;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    padding: 0 60rpx;
    font-size: 28rpx;
}

.icon-search {
    position: absolute;
    left: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.type-switch {
    display: flex;
    background-color: #f5f5f5;
    border-radius: 35rpx;
    padding: 5rpx;
}

.switch-item {
    padding: 10rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 30rpx;
}

.switch-item.active {
    background-color: #02D4C6;
    color: #fff;
}

/* 医院列表样式 */
.hospital-content {
    margin-top: 120rpx;
}

.hospital-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
}

.hospital-card {
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
}

.hospital-card image {
    width: 100%;
    height: 200rpx;
}

.hospital-info {
    padding: 20rpx;
}

.hospital-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.hospital-level {
    font-size: 24rpx;
    color: #02D4C6;
    margin: 10rpx 0;
}

.hospital-address {
    font-size: 24rpx;
    color: #999;
}

/* 疾病列表样式 */
.disease-content {
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
    padding: 30rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    text-align: center;
    border-left: 6rpx solid transparent;
}

.category-item.active {
    color: #02D4C6;
    background-color: #fff;
    border-left-color: #02D4C6;
}

.disease-list {
    flex: 1;
    background-color: #fff;
    height: 100%;
}

.disease-item {
    padding: 30rpx;
    font-size: 28rpx;
    color: #333;
    border-bottom: 1rpx solid #eee;
}
</style>