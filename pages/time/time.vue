<template>
	<view class="page">
		<view class="custom-nav">
			<custom-nav title="时间管理表" :isHomePage="false"></custom-nav>
		</view>
		<view class="date-row">
			<block v-for="(item, index) in days" :key="index">
				<view class="date-col">
					<text class="weekday">{{ item.weekday }}</text>
				</view>
			</block>
		</view>
		<view class="date-colunm">
			<view class="time" v-for="(item, index) in time" :key="index">
				<text class="inner">{{ item.time }}</text>
			</view>
		</view>
		<picker mode="multiSelector" :range="multiArray" @change="handleMultiChange" @columnchange="handleColumnChange"
			:value="multiIndex" v-if="showPicker" class="custom-picker">
			<view class="picker-mask" @tap="showPicker = true"></view>
			<view class="picker-content">
				<picker-view :value="multiIndex" @change="handleMultiChange" @pickstart="onPickStart">
					<picker-view-column>
						<view v-for="(item, index) in multiArray[0]" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column>
						<view v-for="(item, index) in multiArray[1]" :key="index">{{ item }}</view>
					</picker-view-column>
				</picker-view>
			</view>
		</picker>
		<view class="time-grid">
			<view class="grid-row" v-for="rowIndex in 2" :key="rowIndex">
				<view class="grid-cell" v-for="(colIndex, cellIndex) in 7" :key="cellIndex"
					@tap="showPickerOptions(rowIndex, cellIndex)"
					:style="{ backgroundColor: cellColors[rowIndex][cellIndex] }"> <!-- 修改样式绑定 -->
					<view v-for="(option, index) in cellOptions[rowIndex][cellIndex]" :key="index" class="option-tag">
						<text>{{ option }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="detail">
			<view class="square-one"></view>
			<view class="text">长期出诊</view>
			<view class="square-two"></view>
			<view class="text">长期不出诊</view>
		</view>
		<view class="save">
			<button class="save-button" @tap="comfirm">保存</button>
		</view>
	</view>
</template>

<script>
	// pages/health/health.js
	export default {
		data() {
			return {
				days: [{
					weekday: '周一'
				}, {
					weekday: '周二'
				}, {
					weekday: '周三'
				}, {
					weekday: '周四'
				}, {
					weekday: '周五'
				}, {
					weekday: '周六'
				}, {
					weekday: '周日'
				}],
				time: [{
					time: '上午'
				}, {
					time: '下午'
				}],
				multiArray: [
					['长期时间安排', '临时时间安排'],
					['长期出诊', '长期不出诊']
				],
				multiIndex: [0, 0],
				subOptions: {
					'长期时间安排': ['长期出诊', '长期不出诊'],
					'临时时间安排': ['本周临时出诊', '本周临时不出诊']
				},
				showPicker: false,
				cellOptions: Array.from({
					length: 2
				}, () => Array(7).fill(null).map(() => [])),
				cellColors: Array.from({
					length: 2
				}, () => Array(7).fill('transparent')), // 新增颜色数组
				rowIndex: 0,
				cellIndex: 0,
				optionColors: {
					'长期出诊': '#69fd75', // 绿色
					'长期不出诊': '#fbeded', // 浅白色
				},
				cachedLongTerm: null,
				cachedTemp: null,
				lastLoadTime: null, // 新增最后加载时间
				cache:{}
			};
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad(options) {
			this.initData();
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
			// 初始化数据
			async initData() {
				// 优先从缓存加载
				await this.loadFromCache();

				// 检查是否需要从数据库加载
				const needRefresh = this.checkNeedRefresh();
				if (needRefresh) {
					console.log("从数据库里加载数据")
					await this.loadSchedules();
				}

				// 清理过期临时安排
				uniCloud.callFunction({
					name: 'cleanupTempSchedules',
					success: (res) => console.log('清理临时安排:', res)
				});
			},
			// 从缓存加载数据
			async loadFromCache() {
				try {
					const cache = uni.getStorageSync('scheduleCache');
					this.cache=cache;
					console.log("从缓存加载数据",cache)
					if (cache) {
						const {
							longTermData,
							tempData,
							timestamp
						} = cache;

						// 应用缓存数据
						if (longTermData) {
							// console.log("longTermData",longTermData)
							this.applyLongTermData(longTermData);
							this.cachedLongTerm = true;
							console.log("更新后的值",this.cellColors)
						}

						if (tempData) {
							// console.log("tempData",tempData)
							this.applyTempData(tempData);
							this.cachedTemp = true;
						}

						this.lastLoadTime = timestamp;
						console.log('从缓存加载成功');
					}
				} catch (e) {
					console.error('读取缓存失败:', e);
				}
			},
			// 检查是否需要刷新数据
			checkNeedRefresh() {
				// 如果没有缓存，需要刷新
				if (!this.cachedLongTerm || !this.cachedTemp) return true;

				// 如果是周一且距离上次加载超过1小时，需要刷新
				const now = new Date();
				const isMonday = now.getDay() === 1;
				const oneHour = 3600000; // 1小时毫秒数

				if (isMonday && (!this.lastLoadTime || (now - new Date(this.lastLoadTime)) > oneHour)) {
						return true;
					}

					return false;
				},
				// 应用长期安排数据
				applyLongTermData(data) {
						data.forEach(item => {
							const row = item.time_period - 1;
							const col = item.day_of_week - 1;
							if (row >= 0 && row < 2 && col >= 0 && col < 7) {
								this.$set(this.cellColors[row], col,
									item.status === 1 ?
									this.optionColors['长期出诊'] :
									this.optionColors['长期不出诊']
								);
							}
						});
					},

					// 应用临时安排数据
					applyTempData(data) {
						data.forEach(item => {
							const row = item.time_period - 1;
							const col = item.day_of_week - 1;
							if (row >= 0 && row < 2 && col >= 0 && col < 7) {
								const option = item.status === 1 ?
									'本周临时出诊' :
									'本周临时不出诊';
								this.$set(this.cellOptions[row], col, [option]);
							}
						});
					},

					// 加载安排数据
					async loadSchedules() {
							const doctorInfo = uni.getStorageSync('userInfo');
							if (!doctorInfo || !doctorInfo.user_id){
								console.log('未获取到用户信息，跳过加载安排');
								return;
							}
							const user_id = doctorInfo.user_id;

							try {
								// 调用云函数获取长期安排
								const longTermRes = await uniCloud.callFunction({
									name: 'getLongTermSchedules',
									data: {
										user_id
									}
								});

								if (longTermRes.result.code === 200) {
									console.log("longTermRes.result.data",longTermRes.result.data)
									this.applyLongTermData(longTermRes.result.data);
									this.cachedLongTerm = true;
								}

								// 调用云函数获取临时安排
								const tempRes = await uniCloud.callFunction({
									name: 'getTempSchedules',
									data: {
										user_id
									}
								});

								if (tempRes.result.code === 200) {
									console.log("tempRes.result.data",tempRes.result.data)
									this.applyTempData(tempRes.result.data);
									this.cachedTemp = true;
								}

								// 更新缓存
								this.updateCache(longTermRes.result.data, tempRes.result.data);

								await this.generateScheduleLog();
							} catch (error) {
								console.error('加载安排失败:', error);
							}
						},

						// 更新缓存
						updateCache(longTermData, tempData) {
							console.log("更新缓存前参数检测",longTermData, tempData)
							const cache = {
								longTermData: longTermData,
								tempData: tempData,
								timestamp: new Date().getTime()
							};
							uni.setStorageSync('scheduleCache', cache);
							console.log("更新缓存",uni.getStorageSync('scheduleCache'));
							this.lastLoadTime = cache.timestamp;
						},

						// 保存长期安排
						async saveLongTermSchedules(user_id) {
								const longTermData = this.prepareLongTermData(user_id);

								try {
									const res = await uniCloud.callFunction({
										name: "saveLongTermSchedules",
										data: {
											user_id,
											longTermData
										}
									});

									if (res.result.code === 200) {
										// 更新缓存
										const tempData=uni.getStorageSync('scheduleCache').tempData
										this.updateCache(longTermData, tempData);
										
										return true;
									}
									return false;
								} catch (e) {
									console.error('保存长期安排失败:', e);
									return false;
								}
							},

							// 准备长期安排数据
							prepareLongTermData(user_id) {
								const longTermData = [];
								const timestamp = Math.floor(Date.now() / 1000);

								for (let row = 0; row < 2; row++) {
									for (let col = 0; col < 7; col++) {
										const day_of_week = col + 1;
										const time_period = row + 1;
										let status = 0;

										if (this.cellColors[row][col] === this.optionColors['长期出诊']) {
											status = 1;
										}

										longTermData.push({
											
											day_of_week,
											time_period,
											status,
											created_at: timestamp,
											updated_at: timestamp
										});
									}
								}
								console.log("longTermData",longTermData)
								return longTermData;
							},

							// 保存临时安排
							async saveTemporarySchedules(user_id) {
									const tempData = this.prepareTempData();

									try {
										const res = await uniCloud.callFunction({
											name: "saveTemporarySchedules",
											data: {
												user_id,
												tempData
											}
										});
console.log("res",res)
										if (res.result.code === 200) {
											// 更新缓存
											const longTermData=uni.getStorageSync('scheduleCache').longTermData
											this.updateCache(longTermData, tempData);
											return true;
										}
										return false;
									} catch (e) {
										console.error('保存临时安排失败:', e);
										return false;
									}
								},

								// 准备临时安排数据
								prepareTempData() {
									const currentDate = new Date();
									const dayOfWeek = currentDate.getDay() || 7;
									const monday = new Date(currentDate);
									monday.setDate(currentDate.getDate() - (dayOfWeek - 1));
									monday.setHours(0, 0, 0, 0);
									const timestamp = Math.floor(Date.now() / 1000);
									const weekStartTimestamp = monday.getTime();

									const tempData = [];

									for (let row = 0; row < 2; row++) {
										for (let col = 0; col < 7; col++) {
											const options = this.cellOptions[row][col];

											if (options && options.length > 0) {
												const day_of_week = col + 1;
												const time_period = row + 1;
												const option = options[0];

												tempData.push({
													
													day_of_week,
													time_period,
													status: option === '本周临时出诊' ? 1 : 0,
													week_start_date: weekStartTimestamp,
													created_at: timestamp,
													updated_at: timestamp
												});
											}
										}
									}
									return tempData;
								},
								// 点击时间块显示picker
								showPickerOptions(rowIndex, cellIndex) {
									this.rowIndex = rowIndex;
									this.cellIndex = cellIndex;
									this.showPicker = true;
									// 重置为初始状态
									this.multiIndex = [0, 0];
									this.multiArray = [
										['长期时间安排', '临时时间安排'],
										this.subOptions['长期时间安排'] // 强制第二列为长期子选项
									];
								},
								handleColumnChange(e) {
									const column = e.detail.column;
									const value = e.detail.value;
									if (column === 0) {
										const main = this.multiArray[0][value];
										this.multiArray.splice(1, 1, this.subOptions[main]);
										this.multiIndex = [value, 0];
									}
								},
								handleMultiChange(e) {
									const value = e.detail.value;
									const main = this.multiArray[0][value[0]];
									const sub = this.multiArray[1][value[1]];


									if (main === '临时时间安排') {
										// 临时选项：替换选项数组的第一个元素（如果存在）或添加新元素
										if (this.cellOptions[this.rowIndex][this.cellIndex].length > 0) {
											this.$set(this.cellOptions[this.rowIndex][this.cellIndex], 0, sub);
										} else {
											this.$set(this.cellOptions[this.rowIndex][this.cellIndex], this.cellOptions[
												this.rowIndex][this.cellIndex].length, sub);
										}
									} else {
										// 长期选项：设置颜色并清空文本
										this.$set(this.cellColors[this.rowIndex], this.cellIndex, this.optionColors[sub]);
										this.cellOptions[this.rowIndex][this.cellIndex] = [];
									}
									this.showPicker = false;
								},
								async comfirm() {
										// 检查所有单元格，将未设置的设置为"长期不出诊"
										for (let row = 0; row < 2; row++) {
											for (let col = 0; col < 7; col++) {
												if (this.cellColors[row][col] === 'transparent') {
													this.$set(this.cellColors[row], col, this.optionColors['长期不出诊']);
												}
											}
										}

										// 获取当前用户ID - 修改为从本地存储获取医生信息
										const userInfo = uni.getStorageSync('userInfo');
										if (!userInfo || !userInfo.user_id) {
											uni.showToast({
												title: '请先登录',
												icon: 'error',
												duration: 2000
											});
											return;
										}
										const user_id = userInfo.user_id;

										try {
											// 保存长期安排
											await this.saveLongTermSchedules(user_id);

											// 保存临时安排
											await this.saveTemporarySchedules(user_id);

											uni.showToast({
												title: '保存成功',
												icon: 'success',
												duration: 2000
											});

											setTimeout(() => {
												uni.navigateBack();
											}, 2000);
										} catch (error) {
											console.error('保存失败:', error);
											uni.showToast({
												title: '保存失败: ' + (error.message || error.errMsg || '未知错误'),
												icon: 'error',
												duration: 2000
											});
										}
									},
									generateScheduleLog() {
										const logEntries = [];
										const periodMap = ['上午', '下午'];
										const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

										for (let row = 0; row < 2; row++) {
											for (let col = 0; col < 7; col++) {
												const timePeriod = periodMap[row];
												const weekday = weekdays[col];

												// 获取临时安排
												const tempOptions = this.cellOptions[row][col];
												const hasTemp = tempOptions && tempOptions.length > 0;

												// 获取长期安排颜色
												const longTermColor = this.cellColors[row][col];
												const isLongTerm = longTermColor === this.optionColors['长期出诊'];

												// 判断逻辑
												let status = '不出诊';
												let reason = '';

												if (hasTemp) {
													status = tempOptions[0].includes('出诊') ? '出诊' : '不出诊';
													reason = `临时安排：${tempOptions[0]}`;
												} else {
													status = isLongTerm ? '出诊' : '不出诊';
													reason = `长期安排：${isLongTerm ? '长期出诊' : '长期不出诊'}`;
												}

												logEntries.push(`${weekday}${timePeriod}：${status}（${reason}）`);
											}
										}

										// 输出日志（控制台和页面提示）
										console.log('==== 出诊状态日志 ====');
										logEntries.forEach(entry => console.log(entry));
									}
			}
		};
</script>

<style>
	.date-row {
		display: flex;
		background: #99efe9;
		padding: 20rpx 0;
		margin-top: 200rpx;
		margin-left: 100rpx;
		margin-right: 20rpx;
		border-radius: 12rpx;
	}

	.date-col {
		flex: 1;
		text-align: center;
	}

	.weekday {
		display: block;
		font-size: 28rpx;
		color: #333;
	}

	.date-colunm {
		width: fit-content;
		border-radius: 12rpx;
		float: left;
		margin-top: 20rpx;
		background: #99efe9;
	}

	.time {
		border-bottom: 6rpx solid #eee;
		padding: 130rpx 20rpx;
	}

	.time:last-child {
		border-bottom: none;
	}

	.time-grid {
		margin: 20rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		margin-left: 100rpx;
	}

	.grid-row {
		display: flex;
		height: 300rpx;
		border-bottom: 6rpx solid #cac8c8;
	}

	.grid-row:last-child {
		border-bottom: none;
	}

	.grid-cell {
		flex: 1;
		border-right: 6rpx solid #cac8c8;
		padding: 10rpx;
	}

	.grid-cell:last-child {
		border-right: none;
	}

	.custom-picker {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 1000;
	}

	.picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.picker-content {
		background: white;
		padding: 20rpx;
	}

	.page {
		overflow: visible;
		/* 确保父元素不会限制子元素的显示 */
	}

	.option-tag {
		background: rgb(255, 255, 255, 0.8);
		border-radius: 10rpx;
		padding: 20rpx 0rpx;
		margin-top: 50rpx;
	}

	.detail {
		display: flex;
		margin-top: 40rpx;
		justify-content: center;
		/* 水平居中 */
	}

	.square-one {
		width: 40rpx;
		height: 40rpx;
		background: #69fd75;
		margin: 10rpx;
	}

	.square-two {
		width: 40rpx;
		height: 40rpx;
		background: #fbeded;
		margin: 10rpx;
		margin-left: 40rpx;
	}

	.text {
		margin: 10rpx;
	}

	.inner {
		font-size: 28rpx;
		color: #333;
	}

	.save {
		display: flex;
		justify-content: center;
		margin-top: 50rpx;
	}

	.save-button {
		width: 500rpx;
		height: 80rpx;
		background: #99efe9;
		border-radius: 40rpx;
		font-size: 40rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		align-items: center;
		/* 垂直居中 */
	}
</style>