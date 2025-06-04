<template>
<view>
        <!-- 顶部导航栏 -->
    <custom-nav title="订单详情" :isHomePage="false"></custom-nav>
            <view class="order-detail">
        <!-- 订单支付状态 -->
        <view class="payment-status">
            <view class="status-content">
                <text class="status-text">订单待支付</text>
                <text class="payment-tip">请在{{timeLeft}}内进行支付，超时将取消</text>
            </view>
            <view class="button-group">
                <button class="btn cancel" @click="cancelOrder">取消订单</button>
                <button class="btn pay" @click="proceedPayment">进行支付</button>
            </view>
        </view>

        <!-- 服务信息 -->
        <view class="service-info">
            <view class="service-item">
                <image :src="serviceImage" mode="aspectFill" class="service-image"></image>
                <view class="service-detail">
                    <text class="service-name">{{orderInfo.service_name}}</text>
                    <text class="service-price price-align">¥{{orderInfo.service_price}}</text>
                </view>
            </view>
            
            <!-- 费用明细 -->
            <view class="fee-details">
               <!-- <view class="fee-item">
                    <text>服务费</text>
                    <text class="price-align">¥{{orderInfo.service_price}}</text>
                </view>
                <view class="fee-item">
                    <text>接送费</text>
                    <text class="price-align">¥{{deliveryFee}}</text>
                </view>-->
                <view class="fee-item total">
                    <text>共{{quantity}}件，实付</text>
                    <text class="total-price price-align">¥{{totalAmount}}</text>
                </view>
            </view>
        </view>

        <!-- 订单信息 -->
        <view class="order-info">
            <view class="info-title">订单信息</view>
            <view class="info-item">
                <text>预约时间</text>
                <text>{{formatDate(orderInfo.create_time)}}</text>
            </view>
            <view class="info-item">
                <text>接送地址</text>
                <text>{{deliveryAddress}}</text>
            </view>
            <view class="info-item">
                <text>陪诊服务</text>
            </view>
            <view class="info-item">
                <text>订单编号</text>
                <text>{{orderInfo._id}}</text>
            </view>
            <view class="info-item">
                <text>下单时间</text>
                <text>{{formatDate(orderInfo.create_time)}}</text>
            </view>
            <view class="info-item">
                <text>备注信息</text>
                <text>{{orderInfo.service_details}}</text>
            </view>
        </view>
    </view>
	</view>
</template>

<script>
// pages/health/health.js
export default {
    data() {
        return {
            orderInfo: {
                _id: '',
                service_id: '',
                service_name: '按小时全程陪诊（包接送）',
                service_price: 60,
                service_details: '',
                create_time: '',
            },
            timeLeft: '00:15:00',
            quantity: 2,
            //deliveryFee: 50,
            deliveryAddress: '火箭联邦学府华夏学院黄龙公寓101',
            serviceImage: '/static/service-default.png'
        };
    },
    computed: {
        totalAmount() {
            return this.orderInfo.service_price * this.quantity;
        }
    },
    onLoad() {
        this.getOrderDetails();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {},
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {},
    methods: {
        async getOrderDetails() {
            try {
                const db = uniCloud.database();
                // 这里需要传入实际的订单ID
                const result = await db.collection('services').doc('67a48a54b9fb2371a7515115').get();
                if (result.data && result.data.length > 0) {
                    this.orderInfo = result.data[0];
                }
            } catch (e) {
                uni.showToast({
                    title: '获取订单信息失败',
                    icon: 'none'
                });
            }
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        },
        cancelOrder() {
            uni.showModal({
                title: '提示',
                content: '确定要取消订单吗？',
                success: (res) => {
                    if (res.confirm) {
                        // 处理取消订单逻辑
                    }
                }
            });
        },
        proceedPayment() {
            // 处理支付逻辑
            uni.showLoading({
                title: '正在处理支付'
            });
        }
    }
};
</script>

<style>

/* pages/health/health.wxss */
.order-detail {
	margin-top:160rpx ;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.header {
    background-color: #fff;
    padding: 20rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: bold;
    border-bottom: 1rpx solid #eee;
}

.payment-status {
    background-color: #fff;
    padding: 30rpx;
    margin: 20rpx 0;
	padding:  70rpx 0;
}

.status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
}

.status-text {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
}

.payment-tip {
    font-size: 24rpx;
    color: #999;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 30rpx;
}

.btn {
    padding: 15rpx 40rpx;
    border-radius: 30rpx;
    font-size: 28rpx;
}

.btn.cancel {
    background-color: #fff;
    border: 1rpx solid #ddd;
}

.btn.pay {
    background-color: #15cbbc;
    color: #fff;
}

.price-align {
    min-width: 120rpx;
    text-align: right;
}

.service-info {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
}

.service-item {
    display: flex;
    padding: 20rpx 0;
   /* border-bottom: 1rpx solid #eee;*/
}

.service-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
}

.service-detail {
    flex: 1;
    margin-left: 20rpx;
}

.service-name {
    font-size: 28rpx;
}

.service-price {
    color: #ff0000;
    margin-top: 10rpx;
	display: flex;
	justify-content: space-between;
	margin: 10rpx 0;
}

.fee-details {
    padding: 20rpx 0;
}

.fee-item {
    display: flex;
    justify-content: space-between;
    margin: 10rpx 0;
    font-size: 28rpx;
}

.total {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
}

.total-price {
    color: #ff0000;
    font-weight: bold;
}

.order-info {
    background-color: #fff;
    padding: 20rpx;
}

.info-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 15rpx 0;
    font-size: 28rpx;
    color: #666;
}
</style>
