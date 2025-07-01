<template>
  <view class="countdown-box">
    <text v-if="isTimeout" class="timeout-text">已超时</text>
    <view v-else class="countdown-text">
      <text class="label">剩余支付时间：</text>
      <text class="time">{{ formattedTime }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    endTime: { type: Number, required: true }
  },

  data() {
    return {
      remaining: 0,
      timer: null,
      isTimeout: false
    }
  },

  computed: {
    formattedTime() {
      const mins = Math.floor(this.remaining / 60)
      const secs = this.remaining % 60
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
  },

  watch: {
    endTime: {
      immediate: true,
      handler(newVal) {
        this.calculateRemaining(newVal)
        this.startCountdown()
      }
    }
  },

  beforeDestroy() {
    this.clearTimer()
  },

  methods: {
    calculateRemaining(endTime) {
      this.remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      this.isTimeout = this.remaining <= 0
    },

    startCountdown() {
      this.clearTimer()
      if (this.isTimeout) return

      this.timer = setInterval(() => {
        this.remaining--
        if (this.remaining <= 0) {
          this.isTimeout = true
          this.clearTimer()
          this.$emit('timeout')
        }
      }, 1000)
    },

    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
.countdown-box {
  padding: 10rpx 20rpx;
  background: #fffbe6;
  border-radius: 8rpx;
}
.countdown-text {
  color: #faad14;
  font-size: 28rpx;
}
.timeout-text {
  color: #ff4d4f;
  font-size: 28rpx;
}
.time {
  font-family: monospace;
}
</style>