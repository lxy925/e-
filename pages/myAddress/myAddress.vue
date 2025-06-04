<template>
  <view class="root-container">
    <view class="container">
      <!-- 页面标题 -->
      <custom-nav title="我的地址" :isHomePage="false"></custom-nav>
      <!-- 地址列表 -->
      <view class="address-list" v-if="addresses.length > 0">
        <view class="address-item" v-for="(address, index) in addresses" :key="index" @click="selectAddress(address)">
          <!-- 编辑按钮 -->
          <image
            src="../../static/images/address/edit.png"
            class="edit-btn"
            @click="editAddress(index)"
          />
          <!-- 原有地址信息 -->
          <view class="address-district">{{ address.district }}</view>
          <view class="address-detail">{{ address.detail }}</view>
          <view class="addressNameAndNumber">{{ address.name }} {{ address.phone }}</view>
        </view>
      </view>
      <!-- 无地址提示 -->
      <view class="no-address" v-else>
        <view class="image-item" v-if="displayImage">
          <image :src="displayImage.image" mode="aspectFit" />
        </view>
        暂时还没有任何地址
        <button @click="refreshLocation">刷新定位</button>
      </view>
      <!-- 添加地址按钮 -->
      <button class="add-address-btn" @click="showAddAddressModal">新增地址</button>
    </view>

    <!-- 弹出层 -->
    <view class="modal" :class="{ show: showModal }" @click="hideAddAddressModal">
      <view class="modal-content" @click.stop>
        <scroll-view class="scroll-content" scroll-y>
          <!-- 地图 -->
          <map
            id="map"
            :longitude="longitude"
            :latitude="latitude"
            :markers="markers"
            scale="16"
          ></map>
          <!-- 搜索框 -->
          <view class="search-box">
            <button @click="chooseLocation">
              <img src="../../static/images/address/search.png" class="search-icon" style="width: 50rpx;height: 50rpx; justify-content: center;" />搜索地址，更快填写
            </button>
          </view>
          <view class="modal-body">
            <view class="input-group">
              <picker mode="region" @change="handleRegionChange">
                <view class="street">{{ location.province }} {{ location.city }} {{ location.district }}</view>
              </picker>
            </view>
            <view class="input-group">
              <text class="label">详细地址：</text>
              <input class="input-field" type="text" v-model="newAddress.detail" placeholder="请输入详细地址" />
            </view>
            <view class="input-group">
              <text class="label">姓名：</text>
              <input class="input-field" type="text" v-model="newAddress.name" placeholder="请输入姓名" />
            </view>
            <view class="input-group">
              <text class="label">手机号：</text>
              <input class="input-field" type="text" v-model="newAddress.phone" placeholder="请输入手机号" />
            </view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button @click="saveAddress">{{ currentEditIndex !== null ? '保存修改' : '保存地址' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  setup() {
    // 省
    const provinceArr = Object.keys(areaObj);
    const province = ref(provinceArr[0]); // 默认选中第一个省份

    // 市
    const cityArr = computed(() => {
      return Object.keys(areaObj[province.value]);
    });
    const city = ref(cityArr.value[0]); // 默认选中第一个城市

    // 区
    const areaArr = computed(() => {
      return areaObj[province.value][city.value];
    });
    const area = ref(areaArr.value[0]); // 默认选中第一个区

    // 监听省份变化
    watch(province, (newVal) => {
      city.value = cityArr.value[0]; // 更新城市为新省份的第一个城市
      area.value = areaArr.value[0]; // 更新区为新城市的第一个区
    });

    // 监听城市变化
    watch(city, (newVal) => {
      area.value = areaArr.value[0]; // 更新区为新城市的第一个区
    });

    // 是否显示省市区选择器弹窗
    const showRegionModal = ref(false);

    // 显示省市区选择器弹窗
    const showRegionPicker = () => {
      showRegionModal.value = true;
    };

    // 隐藏省市区选择器弹窗
    const hideRegionPicker = () => {
      showRegionModal.value = false;
    };

    // 保存省市区选择结果
    const location = ref({
      province: '',
      city: '',
      district: ''
    });
    const saveRegionSelection = () => {
      location.value.province = province.value;
      location.value.city = city.value;
      location.value.district = area.value;
      hideRegionPicker(); // 关闭弹窗
    };

    return {
      provinceArr,
      province,
      cityArr,
      city,
      areaArr,
      area,
      showRegionModal,
      showRegionPicker,
      hideRegionPicker,
      saveRegionSelection,
      location
    };
  },
  data() {
    return {
      currentEditIndex: null, // 当前编辑的地址索引
      isManualLocation: false, // 新增状态变量，标记是否手动选择地址
      allImages: [], // 存储所有图片数据
      displayImage: null, // 存储符合条件的图片数据
      location: {
        province: '',
        city: '',
        district: ''
      },
      longitude: 113.324520, // 默认经度
      latitude: 23.099994, // 默认纬度
      markers: [
        {
          id: 1,
          latitude: 23.099994, // 纬度，必须是数字
          longitude: 113.324520, // 经度，必须是数字
          name: '我的位置',
          iconPath: '/static/iconfont/location.png', // 标记图标路径
          width: 30, // 图标宽度
          height: 30 // 图标高度
        }
      ], // 初始化为空数组
      addresses: [
        { name: '张三', phone: '138xxxxxxxx', district: '北京市朝阳区', detail: 'XX 路 XX 号' },
        { name: '李四', phone: '139xxxxxxxx', district: '上海市浦东新区', detail: 'XX 小区 XX 栋 XX 室' }
      ],
      showModal: false,
      newAddress: {
        name: '',
        phone: '',
        detail: ''
      }
    };
  },
  methods: {
    editAddress(index) {
      this.showModal = true; // 显示弹窗
      this.currentEditIndex = index; // 记录当前编辑的地址索引
      const address = this.addresses[index]; // 获取当前地址信息
      this.newAddress = {
        name: address.name,
        phone: address.phone,
        detail: address.detail
      };
      this.location = {
        province: address.district.split(' ')[0],
        city: address.district.split(' ')[1],
        district: address.district.split(' ')[2]
      };
    },
    showAddAddressModal() {
      this.showModal = true;
      this.currentEditIndex = null; // 重置编辑索引
      this.newAddress = { name: '', phone: '', detail: '' }; // 清空表单数据
      this.location = { province: '', city: '', district: '' }; // 清空位置信息
    },
    hideAddAddressModal() {
      this.showModal = false;
    },
    saveAddress() {
      const { province, city, district } = this.location;
      this.newAddress.detail = `${province} ${city} ${district} ${this.newAddress.detail}`;
      if (this.currentEditIndex !== null) {
        // 编辑地址
        this.addresses[this.currentEditIndex] = this.newAddress;
      } else {
        // 新增地址
        this.addresses.push(this.newAddress);
      }
      this.newAddress = { name: '', phone: '', detail: '' };
      this.location = { province: '', city: '', district: '' };
      this.showModal = false;
    },
    handleRegionChange(e) {
      const [province, city, district] = e.detail.value;
      this.location.province = province;
      this.location.city = city;
      this.location.district = district;
    },
    refreshLocation() {
      this.getLocationInfo();
    },
    getLocationInfo() {
      if (this.isManualLocation) {
        return; // 如果已手动选择地址，跳过自动定位
      }
      uni.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userLocation']) {
            uni.authorize({
              scope: 'scope.userLocation',
              success: () => {
                console.log('用户已授权定位权限');
                this.getLocation(); // 重新获取位置
              },
              fail: (err) => {
                console.error('用户拒绝授权定位权限：', err);
                this.showLocationSettingModal(); // 提示用户开启定位
              }
            });
          } else {
            // 已有权限，直接获取位置
            this.getLocation();
          }
        }
      });
    },
    showLocationSettingModal() {
      uni.showModal({
        title: '提示',
        content: '请开启设备的定位功能，以获取位置信息',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，跳转到设置页面
            uni.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting['scope.userLocation']) {
                  // 用户已开启定位权限，重新获取位置
                  this.getLocation();
                }
              }
            });
          }
        }
      });
    },
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (res) => {
          console.log('获取位置成功：', res);
          this.getCity(res.latitude, res.longitude);
        },
        fail: (err) => {
          console.error('获取位置失败：', err);
          if (err.errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')) {
            uni.showModal({
              title: '提示',
              content: '请开启设备的 Wi-Fi 和基站定位功能，以获取更精确的位置信息',
              success: (res) => {
                if (res.confirm) {
                  console.log('用户已确认');
                }
              }
            });
          } else {
            uni.showToast({
              title: '获取位置失败，请检查设备定位功能',
              icon: 'none'
            });
          }
        }
      });
    },
    getCity(latitude, longitude) {
      latitude = parseFloat(latitude);
      longitude = parseFloat(longitude);

      uni.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          location: `${longitude},${latitude}`,
          key: '5781b7732ae9793dce03c709a9d0b0af',
          extensions: 'base'
        },
        success: (res) => {
          if (res.data.status === '1') {
            const addressComponent = res.data.regeocode.addressComponent;
            this.location.province = addressComponent.province;
            this.location.city = addressComponent.city;
            this.location.district = addressComponent.district;
            console.log(this.location);
            this.longitude = longitude;
            this.latitude = latitude;
            this.markers = [
              {
                id: 1,
                latitude: latitude,
                longitude: longitude,
                name: '我的位置',
                iconPath: '/static/iconfont/location.png',
                width: 30,
                height: 30
              }
            ];
            console.log('定位信息：', res.data.regeocode.addressComponent);
          } else {
            console.error('获取位置信息失败：', res.data.info);
          }
        },
        fail: (err) => {
          console.error('请求高德地图接口失败：', err);
        }
      });
    },
    chooseLocation() {
      wx.chooseLocation({
        success: (res) => {
          console.log('选择地址成功：', res);
          this.longitude = res.longitude;
          this.latitude = res.latitude;

          this.getCityFromCoordinates(res.latitude, res.longitude).then(region => {
            this.location.province = region.province;
            this.location.city = region.city;
            this.location.district = region.district;

            this.newAddress.detail = `${region.province}${region.city}${region.district}${res.address.replace(/^.+?(省|市|区)/, '')}`;
          }).catch(err => {
            console.error('解析地址失败，使用备用方案', err);
            this.parseAddressString(res.address);
          });

          this.markers = [
            {
              id: 1,
              latitude: res.latitude,
              longitude: res.longitude,
              name: res.name,
              iconPath: '/static/iconfont/location.png',
              width: 30,
              height: 30
            }
          ];

          this.isManualLocation = true;
        },
        fail: (err) => {
          console.error('选择地址失败：', err);
          uni.showToast({ title: '选择地址失败', icon: 'none' });
        }
      });
    },
    getCityFromCoordinates(lat, lng) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: 'https://restapi.amap.com/v3/geocode/regeo',
          data: {
            location: `${lng},${lat}`,
            key: '5781b7732ae9793dce03c709a9d0b0af',
            extensions: 'base'
          },
          success: (res) => {
            if (res.data.status === '1') {
              const address = res.data.regeocode.addressComponent;
              resolve({
                province: address.province,
                city: address.city || address.province, // 处理直辖市
                district: address.district
              });
            } else {
              reject(new Error(res.data.info));
            }
          },
          fail: (err) => reject(err)
        });
      });
    },
    parseAddressString(address) {
      const regex = /^(.*?省|.*?市)?(.*?市|.*?州|.*?区|.*?县)?(.*?区|.*?市|.*?县|.*?镇)?/;
      const matches = address.match(regex);

      this.location.province = matches[1] || '';
      this.location.city = matches[2] || this.location.province; // 处理直辖市
      this.location.district = matches[3] || '';

      const cleanAddress = address
        .replace(this.location.province, '')
        .replace(this.location.city, '')
        .replace(this.location.district, '');
      this.newAddress.detail = cleanAddress.trim();
    },
	selectAddress(address) {
	  // 将整个 patient 对象存储到本地
	  uni.setStorageSync('selectedAddress', address);
	  // 跳转到 order 页面
	  uni.navigateTo({
	    url: '/pages/order/order'
	  });
	},
  },
  created() {
    this.getLocationInfo();
  },
  onShow() {
    this.getLocationInfo();
  },
  onLoad() {
    this.loadImages();
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 170rpx;
}

.address-list {
  margin-bottom: 40rpx;
}

.address-item {
  position: relative; /* 为绝对定位子元素提供参照 */
  padding-right: 80rpx; /* 给按钮留出空间 */
  background-color: white;
  border-radius: 8px;
  width: 600rpx;
  padding: 34rpx 60rpx;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.edit-btn {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 50rpx;
  height: 50rpx;
  padding: 15rpx;
  z-index: 1;
}
.address-district {
  color: #808692;
}
.address-detail {
  font-size: 34rpx;
  margin-bottom: 10rpx;
}

.no-address {
  margin-top: 300rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: #000;
}

.add-address-btn {
  position: fixed;
  bottom: 100rpx;
  width: 80%;
  display: block;
  justify-content: center;
  align-items: center;
  background-color: #c0ddfc;
  color: rgb(64, 102, 179);
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.modal {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100vh; /* 修改为 100vh，确保遮罩覆盖整个视口 */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  transition: opacity 0.3s ease; /* 添加透明度过渡动画 */
  opacity: 0; /* 默认不透明 */
  visibility: hidden; /* 默认不可见 */
}

.modal.show {
  opacity: 1; /* 显示时透明度为 1 */
  visibility: visible; /* 显示时可见 */
}

.modal-content {
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 18rpx 18rpx 0 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100rpx; /* 给底部按钮留出空间 */
}

.modal-body {
  padding: 20rpx;
}

.modal-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.modal-footer button {
  text-align: center;
  width: 100%;
  background: rgb(64, 102, 179);
  color: white;
  border-radius: 40rpx;
  height: 100rpx;
  line-height: 100rpx;
}
#map {
  width: 100%;
  height: 300px;
  border: none;
  box-shadow: none;
  background-color: transparent;
}

.input-group {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: left;
  margin-bottom: 15px;
}

.label {
  margin-bottom: 5rpx;
  font-size: 28rpx;
  color: #808792;
}

.input-field {
  padding: 5px;
  border: 1px solid #808792;
  border-radius: 4px;
  font-size: 14px;
  border: none;
}
.search-box {
  margin: 15rpx 15rpx;
  width: 80%;
  border-radius: 18rpx;
  background-color: #F2F6F9;
}
.search-icon {
  margin: 0 20rpx;
}
.search-box button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0 5rpx;
  border: none;
  cursor: pointer;
}
</style>