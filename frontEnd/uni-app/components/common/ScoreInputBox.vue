<template>
  <view class="score-input-box" :class="{ active: isActive, filled: isFilled }">
    <view class="score-display" @click="onClick">
      <text class="score-text" :class="getScoreClass">{{ displayValue }}</text>
    </view>
    <view class="score-index" v-if="showIndex">
      <text>{{ index }}.</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  value: {
    type: [String, Number],
    default: "",
  },
  index: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  showIndex: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["click"]);

const isFilled = computed(() => {
  return (
    props.value !== "" && props.value !== null && props.value !== undefined
  );
});

const displayValue = computed(() => {
  if (props.value === "" || props.value === null || props.value === undefined) {
    return "";
  }
  return props.value;
});

const getScoreClass = computed(() => {
  const val = String(props.value);
  if (val === "X" || val === "10") return "score-gold";
  if (val === "9" || val === "8") return "score-red";
  if (val === "7" || val === "6") return "score-blue";
  if (val === "5" || val === "4" || val === "3") return "score-black";
  if (val === "M") return "score-miss";
  return "score-default";
});

const onClick = () => {
  emit("click", props.index);
};
</script>

<style lang="scss" scoped>
.score-input-box {
  position: relative;
  width: 100%;
}

.score-display {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  transition: all 0.2s;
}

.score-input-box.active {
  .score-display {
    border-color: #00c853;
    box-shadow: 0 0 0 2rpx rgba(0, 200, 83, 0.2);
  }
}

.score-input-box.filled {
  .score-display {
    background-color: #f9f9f9;
  }
}

.score-text {
  font-size: 32rpx;
  font-weight: 500;
}

.score-gold {
  color: #b8860b;
  background-color: #ffd700;
  padding: 4rpx 16rpx;
  border-radius: 50%;
}

.score-red {
  color: #fff;
  background-color: #ff0000;
  padding: 4rpx 16rpx;
  border-radius: 50%;
}

.score-blue {
  color: #fff;
  background-color: #2196f3;
  padding: 4rpx 16rpx;
  border-radius: 50%;
}

.score-black {
  color: #fff;
  background-color: #333;
  padding: 4rpx 16rpx;
  border-radius: 50%;
}

.score-miss {
  color: #999;
}

.score-default {
  color: #333;
}

.score-index {
  position: absolute;
  left: -30rpx;
  top: 50%;
  transform: translateY(-50%);

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
