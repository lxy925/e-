<template>
	<view class="all">
		<view class="title">当前第{{ current }} 题 / 共{{ total }} 道错题</view>
		<progress :percent="percent" show-info border-radius="20" stroke-width="18" class="progress" />
		<view class="page-section-title">{{ subject.title }}</view>
			<radio-group @change="radioChange" :key="current">
				<view class="radio-item" v-for="(item, index) in subject.options" :key="index">
					<radio 
    :value="item.code" 
    :checked="showAnswer ? item.code === subject.answer : item.code === select"
    :color="showAnswer ? (item.code === subject.answer ? 'green' : 'red') : '#333'"
/>
					<text :class="{
						'red': showAnswer && item.code === select && item.code !== subject.answer,
						'green': showAnswer && item.code === subject.answer
					}">{{ item.option }}</text>
				</view>
			</radio-group>
			<view class="answer" v-if="showAnswer">
				<text>正确答案：{{ subject.answer }}</text>
			</view>
			<view class="button-group">
				<button @click="prev" class="prev">上一题</button>
				<button @click="next" class="next">下一题</button>
			</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				errorOptions:[],
				subject:{},
				current:1,
				total:0,
				percent:0,
				showAnswer:false,
				select:''
			}
		},
		onLoad(options) {
    let arr = uni.getStorageSync('errorOptions');
    if (arr && arr.length > 0) {
        this.errorOptions = arr.map(item => ({
            ...item,
            answered: false, // 添加 answered 字段，默认为 false
            userSelect: '' // 添加 userSelect 字段，用于记录用户的选择
        }));
    }
    this.subject = this.errorOptions[0];
    this.total = this.errorOptions.length;
},
		methods: {
			radioChange(e) {
				let select = e.detail.value;
				this.select = select;
				this.showAnswer = true;
				
				// 判断答案是否正确
				if (select === this.subject.answer) {
					uni.showToast({
						title: '答对了！',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: '答错了！',
						icon: 'error'
					});
				}
				 // 更新当前题目的答题状态
				 this.errorOptions[this.current - 1].answered = true;
    this.errorOptions[this.current - 1].userSelect = select;


				// 3秒后进入下一题
				setTimeout(() => {
					this.showAnswer = false;
					let num = this.current + 1;
					this.percent = ((num-1) / this.errorOptions.length * 100).toFixed(2);
					
					if (num > this.errorOptions.length) {
						uni.showToast({
							title: '已经是最后一题了！',
							icon: 'none'
						});
						console.log(this.errorOptions);
						return;
					}
					
					this.current = num;
					this.subject = this.errorOptions[num-1];
					this.select = this.subject.answered ? this.subject.userSelect : ''; // 如果已答题，恢复之前的选中状态
				}, 2000);
			},
			prev(){
				if(this.current==1){
					uni.showToast({
						title: '已经是第一题了！',
						icon: 'none'
					});
					return;
				}
				this.current--;
				this.subject=this.errorOptions[this.current-1];
				this.select = this.subject.answered ? this.subject.userSelect : ''; // 如果已答题，恢复之前的选中状态
				this.showAnswer = this.subject.answered; // 如果已答题，显示答案
			},
			next(){
				if(this.current==this.errorOptions.length){
					uni.showToast({
						title: '已经是最后一题了！',
						icon: 'none'
					});
					return;
				}
				this.current++;
				this.subject=this.errorOptions[this.current-1];
				this.select = this.subject.answered ? this.subject.userSelect : ''; // 如果已答题，恢复之前的选中状态
    this.showAnswer = this.subject.answered; // 如果已答题，显示答案
			}
		}
	}
</script>

<style>
.all {
	margin-top: 300rpx;
}
.title{
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	text-align: center;
	color:rgb(246, 109, 109);
}
.progress{
	margin-bottom: 20rpx;
	margin-left: 50rpx;
	margin-right: 30rpx;
}
.page-section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	margin-top: 20rpx;
	margin-left: 30rpx;
	margin-right: 30rpx;
}

.radio-item{
	color: #000;
	margin-left: 30rpx;
	margin-right: 30rpx;
	margin-top: 20rpx;
}
.red {
	color: red;
}
.green {
	color: green;
	font-weight: bold;
}
.answer{
	margin-left: 30rpx;
	margin-right: 30rpx;
	margin-top: 20rpx;
	color:green;
	font-size: 32rpx;
	font-weight: bold;
}
.score{
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	margin-top: 50rpx;
	color:green;
}
/* 将按钮组放置在页面底部 */
.button-group {
    position: fixed; /* 固定定位 */
    bottom: 0;       /* 置于页面底部 */
    left: 0;         /* 置于页面左侧 */
    width: 100%;     /* 宽度占满整个页面 */
    display: flex;   /* 使用弹性布局 */
    justify-content: space-between; /* 子元素在主轴上均匀分布 */
    padding: 10px;   /* 添加内边距，避免内容紧贴边缘 */
    background-color: #f9f9f9; /* 添加背景色（可选） */
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* 添加阴影（可选） */
}

/* 为按钮添加样式 */
.button-group button {
    padding: 10px 20px; /* 按钮内边距 */
    font-size: 16px;    /* 字体大小 */
    border: none;       /* 去掉边框 */
    border-radius: 5px; /* 圆角边框 */
    color:darkturquoise;       /* 文字颜色 */
    cursor: pointer;    /* 鼠标悬停时显示手型 */
}

/* 按钮悬停效果 */
.button-group button:hover {
    background-color:rgb(203, 251, 235); /* 悬停时背景色变深 */
}
</style>
