<template>
	<view class="all">
		<custom-nav title="e-study" :isHomePage="false"></custom-nav>
		<view class="title">当前第 {{ current }} 题 / 共 {{ total }} 题</view>
		<progress :percent="percent" show-info border-radius="20" stroke-width="18" class="progress" />
		<view class="page-section-title">{{ subject.title }}</view>
			<radio-group @change="radioChange" :key="current">
				<view class="radio-item" v-for="(item, index) in subject.options" :key="index" >
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
			<view class="score">
				<text>总共答对{{ score }}题 / 答错{{ errorScore }}题</text>
			</view>
			<view class="button-group">
				<button @click="prev" class="prev">上一题</button>
				<button @click="showErrorOptions" class="error-button" >查看错题</button>
				<button @click="clear" class="clear">重新刷题</button>
				<button @click="next" class="next">下一题</button>
			</view>
	</view>
</template>

<script>
export default {
  data() {
    return {
      titles: [],
      total: 0,
      current: 1,
      select: '',
      subject: null,
      percent: 0,
      score: 0, // 答对题数
      errorScore: 0, // 答错题数
      showAnswer: false,
      answeredIndexes: [], // 已完成的题目索引
      errorOptions: [], // 错题记录
    };
  },
  onLoad() {
    // 从本地存储中读取答题记录
    const quizData = uni.getStorageSync('quizData') || {};
    this.score = quizData.score || 0;
    this.errorScore = quizData.errorScore || 0;
    this.answeredIndexes = Array.isArray(quizData.answeredIndexes) ? quizData.answeredIndexes : [];
    this.errorOptions = Array.isArray(quizData.errorOptions) ? quizData.errorOptions : [];

    uniCloud.database().collection('questions').get().then((res) => {
      console.log('数据库返回:', res);
      const data = res.result.data;

      if (!data || !data.length) {
        console.error('未获取到题目数据');
        return;
      }

      try {
        const questions = data[0].questions.map((q) => ({
          title: q.question,
          options: Object.entries(q.options).map(([code, option]) => ({
            code,
            option,
          })),
          answer: q.answer,
          answered: false,
          select: '',
        }));

        this.titles = questions;
        this.total = this.titles.length;

        // 找到第一道未完成的题目
        let firstUnansweredIndex = this.titles.findIndex((_, index) => !this.answeredIndexes.includes(index));
        if (firstUnansweredIndex === -1) {
          // 如果所有题目都已完成，跳转到第一题
          firstUnansweredIndex = 0;
        }

        this.current = firstUnansweredIndex + 1; // 更新当前题目索引
        this.subject = this.titles[firstUnansweredIndex];
        this.percent = ((firstUnansweredIndex) / this.titles.length * 100).toFixed(2);

        // 恢复之前答题的状态
        this.titles.forEach((item, index) => {
          if (this.answeredIndexes.includes(index)) {
            item.answered = true;
            item.select = quizData.selects?.[index] || ''; // 恢复用户之前的选择
          }
        });
      } catch (error) {
        console.error('数据处理错误:', error);
      }
    }).catch((err) => {
      console.error('获取题目失败:', err);
    });
  },
  methods: {
    radioChange(e) {
      let select = e.detail.value;
      this.select = select;
      this.showAnswer = true;

      if (select === this.subject.answer) {
        uni.showToast({
          title: '答对了！',
          icon: 'success',
        });
        this.score++;
      } else {
        uni.showToast({
          title: '答错了！',
          icon: 'error',
        });
        let subjectnow = { ...this.subject, select }; // 创建一个副本
        this.errorOptions.push(subjectnow); // 添加到错题记录
        this.errorScore++;
      }

      // 更新当前题目的答题状态
      this.titles[this.current - 1].answered = true;
      this.titles[this.current - 1].select = select;

      // 确保 answeredIndexes 是一个数组
      if (!Array.isArray(this.answeredIndexes)) {
        this.answeredIndexes = [];
      }
      this.answeredIndexes.push(this.current - 1);

      // 保存答题记录到本地存储
      const quizData = {
        score: this.score,
        errorScore: this.errorScore,
        answeredIndexes: this.answeredIndexes,
        errorOptions: this.errorOptions,
        selects: this.titles.map((item) => item.select), // 保存每题的选择
      };
      uni.setStorageSync('quizData', quizData);

      // 3秒后进入下一题
      setTimeout(() => {
        this.showAnswer = false;
        let num = this.current + 1;
        this.percent = ((num - 1) / this.titles.length * 100).toFixed(2);

        if (num > this.titles.length) {
          uni.showToast({
            title: '已经是最后一题了！',
            icon: 'none',
          });
          console.log(this.errorOptions);
          return;
        }

        this.current = num;
        this.subject = this.titles[num - 1];
        this.select = this.subject.answered ? this.subject.select : '';
      }, 2000);
    },
    showErrorOptions() {
      uni.setStorageSync('errorOptions', this.errorOptions);
      uni.navigateTo({
        url: '/pages/showerror/showerror',
      });
    },
    prev() {
      if (this.current == 1) {
        uni.showToast({
          title: '已经是第一题了！',
          icon: 'none',
        });
        return;
      }
      this.current--;
      this.subject = this.titles[this.current - 1];
      this.select = this.subject.answered ? this.subject.select : '';
      this.showAnswer = this.subject.answered;
    },
    next() {
      if (this.current == this.titles.length) {
        uni.showToast({
          title: '已经是最后一题了！',
          icon: 'none',
        });
        return;
      }
      this.current++;
      this.subject = this.titles[this.current - 1];
      this.select = this.subject.answered ? this.subject.select : '';
      this.showAnswer = this.subject.answered;
    },
	clear() {
      // 弹出确认框
      uni.showModal({
        title: '确认操作',
        content: '是否确认清空所有答题记录？',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            // 用户点击确认，清空所有答题记录并重置状态
            this.score = 0;
            this.errorScore = 0;
            this.answeredIndexes = [];
            this.errorOptions = [];
            this.titles.forEach((item) => {
              item.answered = false;
              item.select = '';
            });
            this.current = 1;
            this.subject = this.titles[0];
            this.percent = 0;
            this.select = '';
            this.showAnswer = false;

            // 清空本地存储的答题记录
            uni.removeStorageSync('quizData');
          }
        },
      });
    },
  },
};
</script>



<style>
.all {
	margin-top: 400rpx;
	background-color: #f9f9f9;
	border-radius: 20rpx;
	padding: 80rpx 20rpx ;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
	margin-left: 40rpx;
	margin-right: 40rpx;
	
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
    justify-content:space-around; /* 子元素在主轴上均匀分布 */
    padding: 10px 0px;   /* 添加内边距，避免内容紧贴边缘 */
    background-color: #f9f9f9; /* 添加背景色（可选） */
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* 添加阴影（可选） */
}

/* 为按钮添加样式 */
.button-group button {
    padding: 10px 10px; /* 按钮内边距 */
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
