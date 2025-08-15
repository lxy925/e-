<template>
  <view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
	      paddingTop: navHeight + 'px',
	      height: 'calc(100vh - ' + navHeight + 'px)'
	    }" :scroll-top="scrollTop":show-scrollbar="false">
  	<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" />
  
    <view class="content">
    	
  
    <!-- 筛选条件 -->
    <view class="filter-container">
      <picker mode="selector" :range="filterOptions" range-key="text" @change="handleFilterChange">
        <view class="filter-item">
          <text class="filter-text">{{filterOptions[currentFilter].text}}</text>
          <uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
        </view>
      </picker>
    </view>

    <!-- 记录列表 -->
    <scroll-view 
      scroll-y 
      class="record-scroll" 
      @scrolltolower="loadMore"
      :style="{height: `calc(100vh - ${navHeight + 100}px)`}"
    >
      <view class="record-list">
        <view v-for="(item, index) in records" :key="index" class="record-item">
          <view class="record-header">
            <view class="amount-container">
              <text class="amount-symbol">¥</text>
              <text class="amount">{{ (item.amount / 100).toFixed(2) }}</text>
            </view>
            <text class="status-badge" :class="statusClassMap[item.status]">
              {{ statusTextMap[item.status] }}
            </text>
          </view>

          <view class="record-body">
            <view class="info-row">
              <uni-icons type="calendar" size="16" color="#999"></uni-icons>
              <text class="time">{{ formatTime(item.create_time) }}</text>
            </view>
            <view class="info-row">
              <uni-icons type="paperclip" size="16" color="#999"></uni-icons>
              <text class="order-no">订单号: {{ item.out_bill_no }}</text>
            </view>
          </view>

          <view class="record-footer" v-if="item.status === 'PROCESSING'">
            <button 
              class="cancel-btn" 
              @click="handleCancel(item)" 
              :disabled="item.cancelLoading"
              :loading="item.cancelLoading"
            >
              <text v-if="!item.cancelLoading">撤销申请</text>
            </button>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-status">
          <uni-load-more 
            :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" 
            :contentText="{
              contentdown: '上拉加载更多',
              contentrefresh: '正在加载...',
              contentnomore: '没有更多数据了'
            }" 
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="records.length === 0 && !loading">
        <image src="/static/images/empty-order.png" mode="aspectFit"></image>
        <text class="empty-text">暂无提现记录</text>
        <text class="empty-tip">您还没有提现记录哦~</text>
      </view>
    </scroll-view>
  </view>
    </view>
</template>

<script>
  export default {
    data() {
      return {
        navHeight: 0,
        scrollTop: 0,
        pageTitle: '提现记录',
        records: [], // 提现记录列表
        accountInfo: {},
        loading: false,
        currentPage: 1,
        pageSize: 10,
        noMore: false,
        currentFilter: 0, // 当前筛选条件索引
        filterOptions: [
          { text: '全部', value: '' },
          { text: '处理中', value: 'PROCESSING' },
          { text: '成功', value: 'SUCCESS' },
          { text: '失败', value: 'FAILED' },
          { text: '已撤销', value: 'CANCELED' }
        ],
        statusTextMap: {
          'PROCESSING': '处理中',
          'SUCCESS': '提现成功',
          'FAILED': '提现失败',
          'CANCELED': '已撤销'
        },
        statusClassMap: {
          'PROCESSING': 'status-processing',
          'SUCCESS': 'status-success',
          'FAILED': 'status-failed',
          'CANCELED': 'status-canceled'
        }
      }
    },
    onLoad(options) {
      // 获取导航栏高度
      const systemInfo = uni.getSystemInfoSync()
      this.navHeight = systemInfo.statusBarHeight + 44
      
      if (options.accountInfo) {
        this.accountInfo = JSON.parse(decodeURIComponent(options.accountInfo));
      }

      this.loadRecords()
    },
    methods: {
		handleScroll(e) {
			// 直接赋值scrollTop（不需要节流，因为custom-nav内部已经做了立即切换的处理）
			this.scrollTop = e.detail.scrollTop;
			
		},
      // 加载提现记录
      async loadRecords() {
        if (this.loading || this.noMore) return;
        
        this.loading = true;
        try {
          const res = await uniCloud.callFunction({
            name: 'withdraw-records',
            data: {
              accountInfo: this.accountInfo,
              page: this.currentPage,
              pageSize: this.pageSize,
              status: this.filterOptions[this.currentFilter].value
            }
          });
          
          if (res.result.code === 200) {
            const data = res.result.data;
            // 如果是第一页，直接替换数据
            if (this.currentPage === 1) {
              this.records = data.list;
            } else {
              // 否则追加数据
              this.records = [...this.records, ...data.list];
            }
            
            // 判断是否还有更多数据
            this.noMore = data.list.length < this.pageSize;
            this.currentPage++;
          }
        } catch (error) {
          console.error('加载记录失败:', error);
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          });
        } finally {
          this.loading = false;
        }
      },

      // 加载更多
      loadMore() {
        if (!this.noMore) {
          this.loadRecords();
        }
      },

      // 筛选条件变化
      handleFilterChange(e) {
        this.currentFilter = e.detail.value;
        this.resetList();
        this.loadRecords();
      },

      // 重置列表
      resetList() {
        this.records = [];
        this.currentPage = 1;
        this.noMore = false;
      },

      // 格式化时间
      formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${this.padZero(date.getMonth()+1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
      },

      // 补零
      padZero(num) {
        return num < 10 ? `0${num}` : num;
      },

      // 处理撤销
      async handleCancel(item) {
        uni.showModal({
          title: '提示',
          content: '确定要撤销此提现申请吗？',
          success: async (res) => {
            if (res.confirm) {
              this.$set(item, 'cancelLoading', true);

              try {
                const result = await uniCloud.callFunction({
                  name: 'withdraw-action',
                  data: {
                    action: 'cancelTransfer',
                    out_bill_no: item.out_bill_no,
                    accountInfo: {
                      _id: item.account_id,
                      frozen_amount: item.frozen_amount,
                      withdrawable_amount: item.withdrawable_amount
                    }
                  }
                });

                if (result.result.code === 200) {
                  uni.showToast({
                    title: '撤销成功',
                    icon: 'success'
                  });
                  item.status = 'CANCELED';
                } else {
                  uni.showToast({
                    title: result.result.message || '撤销失败',
                    icon: 'none'
                  });
                }
              } catch (error) {
                uni.showToast({
                  title: '撤销失败',
                  icon: 'none'
                });
              } finally {
                this.$set(item, 'cancelLoading', false);
              }
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss">
 .page-container {
 	min-height: 100vh;
 	position: relative;
 	padding: 0 rpx;
 	padding-left: 25rpx;
 	padding-right: 25rpx;
 	margin: 0;
 	width: 100%;
 	box-sizing: border-box; /* 关键：让 width 包含 padding */		
 }
 
 .content {
 	width: 100%;
 	  max-width: 100%; /* 限制最大宽度（可选） */
 	  margin: 0 ; /* 水平居中 */
 	  padding:0;
 	  box-sizing: border-box;
 }

  .filter-container {
    // background-color: #fff;
    padding: 20rpx 0rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .filter-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15rpx 20rpx;
      background-color: #f7f7f7;
      border-radius: 50rpx;
      
      .filter-text {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }

  .record-scroll {
    padding: 0 x;
    box-sizing: border-box;
  }

  .record-list {
    .record-item {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;

        .amount-container {
          display: flex;
          align-items: baseline;
          
          .amount-symbol {
            font-size: 28rpx;
            color: #ff6b00;
            margin-right: 6rpx;
          }
          
          .amount {
            font-size: 40rpx;
            font-weight: bold;
            color: #ff6b00;
          }
        }

        .status-badge {
          font-size: 24rpx;
          padding: 6rpx 16rpx;
          border-radius: 30rpx;
          
          &.status-processing {
            background-color: #fff8e6;
            color: #ff9500;
          }
          
          &.status-success {
            background-color: #e6f7ee;
            color: #07C160;
          }
          
          &.status-failed {
            background-color: #ffebee;
            color: #FF2D55;
          }
          
          &.status-canceled {
            background-color: #f5f5f5;
            color: #999;
          }
        }
      }

      .record-body {
        .info-row {
          display: flex;
          align-items: center;
          margin-bottom: 15rpx;
          
          .time, .order-no {
            font-size: 26rpx;
            color: #999;
            margin-left: 10rpx;
          }
        }
      }

      .record-footer {
        margin-top: 30rpx;
        padding-top: 20rpx;
        border-top: 1rpx solid #f5f5f5;
        display: flex;
        justify-content: flex-end;

        .cancel-btn {
          background-color: #fff;
          border: 1rpx solid #FF2D55;
          color: #FF2D55;
          font-size: 26rpx;
          height: 60rpx;
          line-height: 60rpx;
          border-radius: 30rpx;
          padding: 0 30rpx;
          
          &[disabled] {
            opacity: 0.6;
          }
          
          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .loading-status {
    padding: 30rpx 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100rpx;
    
    image {
      width: 300rpx;
      height: 300rpx;
      margin-bottom: 30rpx;
      opacity: 0.6;
    }
    
    .empty-text {
      font-size: 30rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .empty-tip {
      font-size: 26rpx;
      color: #999;
    }
  }
</style>