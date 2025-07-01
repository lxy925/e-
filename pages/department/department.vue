<template>
  <view class="page">
    <view class="custom-nav">
      <view class="nav-title">选择科室</view>
      <view class="nav-right" @tap="onManageTap">
        <text class="manage-text">管理</text>
      </view>
    </view>
    <view class="search-container">
      <input
        class="search-input"
        placeholder="搜索科室"
        v-model="searchQuery"
        @input="filterDepartments"
      />
    </view>
    <view class="department-container">
      <!-- 左边科室大类 -->
      <scroll-view class="department-major" scroll-y>
        <view
          v-for="(major, index) in filteredMajors"
          :key="index"
          :class="['major-item', { active: selectedMajorIndex === index }]"
          @tap="selectMajor(index)"
        >
          {{ major.name }}
        </view>
      </scroll-view>
      <!-- 右边细分科室 -->
      <scroll-view class="department-sub" scroll-y>
        <view
          v-for="(sub, subIndex) in selectedSubDepartments"
          :key="subIndex"
          :class="['sub-item', { selected: selectedSubDepartment === sub.name }]"
          @tap="selectSubDepartment(sub)"
        >
          {{ sub.name }}
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>export default {
  data() {
    return {
      departmentMajors: [
        { name: '内科', subs: ['心血管内科', '消化内科', '呼吸内科', '内分泌科', '肾内科', '血液内科'] },
        { name: '外科', subs: ['普外科', '骨科', '神经外科', '泌尿外科', '胸外科', '心脏外科'] },
        { name: '妇产科', subs: ['产科', '妇科', '生殖医学科', '计划生育科'] },
        { name: '儿科', subs: ['新生儿科', '儿童保健科', '小儿内科', '小儿外科'] },
        { name: '精神科', subs: ['心理科', '精神康复科', '睡眠障碍科', '焦虑障碍科'] },
        { name: '心胸外科', subs: ['心脏外科', '胸外科', '食管外科', '纵隔外科'] },
        { name: '耳鼻喉科', subs: ['耳科', '鼻科', '喉科', '头颈外科'] },
        { name: '中医科', subs: ['针灸科', '推拿科', '中医内科', '中医外科'] },
        { name: '眼科', subs: ['白内障科', '视光科', '青光眼科', '眼底病科'] },
        { name: '口腔科', subs: ['牙体牙髓科', '牙周科', '口腔颌面外科', '口腔修复科'] },
        { name: '皮肤科', subs: ['皮肤内科', '皮肤外科', '美容皮肤科'] },
        { name: '肿瘤科', subs: ['肿瘤内科', '肿瘤外科', '肿瘤放疗科'] },
        { name: '康复科', subs: ['物理治疗科', '作业治疗科', '言语治疗科'] },
        { name: '急诊科', subs: ['急诊内科', '急诊外科'] },
        { name: '麻醉科', subs: ['临床麻醉科', '疼痛科'] },
        { name: '检验科', subs: ['临床检验科', '生化检验科', '免疫检验科'] },
        { name: '放射科', subs: ['X线诊断科', 'CT诊断科', 'MRI诊断科'] },
        { name: '超声科', subs: ['腹部超声科', '心脏超声科', '妇产超声科'] },
        { name: '病理科', subs: ['临床病理科', '细胞病理科'] },
        { name: '药剂科', subs: ['临床药学科', '药剂调配科'] },
        { name: '营养科', subs: ['临床营养科', '营养治疗科'] },
        { name: '输血科', subs: ['临床输血科', '血液治疗科'] },
        { name: '感染科', subs: ['传染病科', '感染内科'] },
        { name: '风湿免疫科', subs: ['风湿内科', '免疫内科'] },
        { name: '老年医学科', subs: ['老年内科', '老年康复科'] },
        { name: '疼痛科', subs: ['疼痛治疗科', '疼痛康复科'] },
        { name: '全科医学科', subs: ['全科内科', '全科外科'] },
        { name: '其他', subs: ['其他科室'] }
      ],
      selectedMajorIndex: 0, // 当前选中的大类索引
      selectedSubDepartment: null, // 当前选中的细分科室
      searchQuery: '', // 搜索框内容
      filteredMajors: [], // 过滤后的大类列表
  initialSelected: '' // 用于存储从order页面传递过来的已选科室
    };
  },
  computed: {
    // 根据选中的大类索引获取对应的细分科室
    selectedSubDepartments() {
      return this.departmentMajors[this.selectedMajorIndex].subs.map(sub => ({ name: sub }));
    }
  },
  methods: {
    // 选择科室大类
    selectMajor(index) {
      this.selectedMajorIndex = index;
    },
    // 选择细分科室
    selectSubDepartment(sub) {
      this.selectedSubDepartment = sub.name;
     // 1. 存储到本地缓存
          uni.setStorageSync('selectedDepartment', sub.name);
          
          // 2. 返回数据到order页面
          const pages = getCurrentPages();
          if (pages.length > 1) {
            // 获取上一个页面实例
            const prevPage = pages[pages.length - 2];
            // 调用上一个页面的方法更新数据
            prevPage.$vm.selectedDepartment = sub.name;}
			 // 3. 返回上一页
			      uni.navigateBack();
    },
    // 搜索科室
    filterDepartments() {
        if (!this.searchQuery) {
             this.filteredMajors = this.departmentMajors;
             return;}
			   this.filteredMajors = this.departmentMajors.filter(major => {
			         return major.name.includes(this.searchQuery) || 
			                major.subs.some(sub => sub.includes(this.searchQuery));
			       });
				      // 如果有搜索结果，自动选中第一个大类
				         if (this.filteredMajors.length > 0) {
				           this.selectedMajorIndex = 0;
				         }
    },
    // 管理按钮点击事件
    onManageTap() {
      // 跳转到地址管理页面
      uni.navigateTo({
        url: '/pages/manageAddresses/manageAddresses'
      });
    },
	 // 初始化已选科室
	    initSelectedDepartment() {
	      if (this.initialSelected) {
	        // 查找并选中对应的科室
	        for (let i = 0; i < this.departmentMajors.length; i++) {
	          const subs = this.departmentMajors[i].subs;
	          if (subs.includes(this.initialSelected)) {
	            this.selectedMajorIndex = i;
	            this.selectedSubDepartment = this.initialSelected;
	            break;
	          }
	        }
	      }
	    },onLoad(options) {
 // 接收从order页面传递过来的已选科室
     if (options && options.selected) {
       this.initialSelected = options.selected;
     }
  },

}, onReady() {
      this.filteredMajors = this.departmentMajors;
      this.initSelectedDepartment();
    },
  watch: {
    // 监听 searchQuery 的变化，自动调用 filterDepartments
    searchQuery() {
      this.filterDepartments();
    }
  },
  created() {
    // 初始化时加载所有科室
    this.filteredMajors = this.departmentMajors;
  }
};</script>
<style>
	.page {
	  background-color: white;
	  padding: 0 20rpx;
	  padding-top: 180rpx;
	}
	
	.search-container {
	  width: 100%;
	  position: fixed;
	  margin-bottom: 20rpx;
	  z-index: 1000;
	}
	
	.search-input {
	  width: 100%;
	  padding: 20rpx;
	  font-size: 28rpx;
	  color: #333;
	  border: 1rpx solid #e0e0e0;
	  border-radius: 12rpx;
	  background-color: #f9f9f9;
	}
	
	.department-container {
	  margin-top: 120rpx;
	  display: flex;
	  height: calc(100vh - 120rpx);
	}
	
	.department-major,
	.department-sub {
	  flex: 1;
	  height: 100%;
	  border-radius: 12rpx;
	  background-color: #ffffff;
	  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	  margin: 10rpx;
	}
	
	.major-item,
	.sub-item {
	  padding: 20rpx;
	  text-align: center;
	  border-bottom: 1rpx solid #e0e0e0;
	  font-size: 28rpx;
	  color: #333;
	}
	
	.major-item.active {
	  background-color: #f0f9f8;
	  color: #18d1c2;
	}
	
	.sub-item {
	  border-bottom: 1rpx solid #e0e0e0;
	}
	
	.sub-item:last-child {
	  border-bottom: none;
	}
	
	.custom-nav {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  padding: 20rpx;
	  background-color: #ffffff;
	  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
	
	.nav-title {
	  font-size: 32rpx;
	  font-weight: bold;
	  color: #333;
	}
	
	.nav-right {
	  display: flex;
	  align-items: center;
	}
	
	.manage-text {
	  font-size: 28rpx;
	  color: #18d1c2;
	  margin-left: 10rpx;
	}
</style>