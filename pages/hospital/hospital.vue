<template>
  <view class="page" style="background-color: #ffffff;">
    <uni-nav-bar 
      title="Select Hospital" 
      left-icon="back"
      @clickLeft="goBack"
      fixed
      status-bar
    />
    
    <view class="search-bar">
      <input 
        v-model="searchKeyword" 
        placeholder="Search hospitals..." 
        class="search-input"
      />
      <button @click="searchHospitals" class="search-button">Search</button>
    </view>

    <view class="city-filter">
      <view 
        v-for="city in uniqueCities" 
        :key="city" 
        class="city-item" 
        @click="filterByCity(city)"
      >
        {{ city }}
      </view>
    </view>

    <view class="hospital-list">
      <view v-for="(hospital, index) in hospitals" :key="hospital._id" class="hospital-item">
        <view class="hospital-info">
          <view class="hospital-name">{{ hospital.name }}</view>
          <view class="hospital-address">{{ hospital.address }}</view>
          <view class="hospital-phone">{{ hospital.phone }}</view>
          <view class="hospital-level">{{ hospital.level }}</view>
          <view class="hospital-specialties">{{ hospital.specialties }}</view>
          <view class="hospital-website">{{ hospital.website }}</view>
        </view>
      </view>
    </view>

    <button @click="loadMore">Load More</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      hospitals: [],
      currentPage: 1,
      pageSize: 20, // 每页显示20条医院数据
      totalHospitals: 0,
      searchKeyword: '',
      selectedCity: null // 选中的城市
    };
  },
  computed: {
    uniqueCities() {
      const cities = this.hospitals.map(hospital => hospital.city);
      return [...new Set(cities)]; // 获取唯一城市列表
    }
  },
  methods: {
    async loadHospitals() {
      try {
        const { result } = await uniCloud.callFunction({
          name: 'getAllHospitals',
          data: {
            page: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.searchKeyword,
            city: this.selectedCity
          }
        });

        console.log('云函数返回结果:', result); // 记录云函数返回结果

        if (result.code === 0) {
          this.hospitals = result.data; // 更新医院列表
          this.totalHospitals = result.total; // 更新总数
        } else {
          uni.showToast({
            title: result.message || 'Failed to get hospital list',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('Error loading hospital data:', error);
        uni.showToast({
          title: 'Failed to load hospital data',
          icon: 'none'
        });
      }
    },
    
    goBack() {
      uni.navigateBack();
    },

    selectHospital(hospital) {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      if (prevPage) {
        prevPage.$vm.selectedHospital = hospital;
        uni.navigateBack({
          delta: 1
        });
      }
    },

    loadMore() {
      this.currentPage += 1; // 增加当前页数
      this.loadHospitals(); // 加载下一页数据
    },

    async searchHospitals() {
      this.currentPage = 1; // 重置当前页
      await this.loadHospitals(); // 加载搜索结果
    },

    filterByCity(city) {
      this.selectedCity = city; // 设置选中的城市
      this.currentPage = 1; // 重置当前页
      this.loadHospitals(); // 加载按城市过滤的医院
    },

    onScroll(event) {
      // 检查是否滚动到底部
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight) {
        this.loadMore(); // 加载更多医院
      }
    }
  },
  created() {
    this.loadHospitals(); // 创建时加载医院
  }
};
</script>

<style lang="scss" scoped>
.page {
  background-color: #ffffff; // 设置背景为白色
}

.search-bar {
  display: flex;
  padding: 10rpx;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10rpx;
  border: 1px solid #ccc;
  border-radius: 5rpx;
  margin-right: 10rpx;
}

.search-button {
  padding: 10rpx;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5rpx;
}

.city-filter {
  display: flex;
  flex-wrap: wrap;
  padding: 10rpx;

  .city-item {
    margin-right: 10rpx;
    padding: 5rpx 10rpx;
    background-color: #f0f0f0;
    border-radius: 5rpx;
    cursor: pointer;
  }
}

.hospital-list {
  padding: 30rpx;

  .hospital-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;

    .hospital-group-title {
      font-size: 32rpx;
      font-weight: bold;
      margin-top: 20rpx;
      margin-bottom: 10rpx;
      text-align: right; // 右对齐字母
    }

    .hospital-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      margin-bottom: 10rpx;
      background-color: #fff;
      border-radius: 8rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    }

    .hospital-info {
      flex: 1;
      margin-right: 20rpx;

      .hospital-name {
        font-size: 28rpx;
        font-weight: 600;
      }

      .hospital-address {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>