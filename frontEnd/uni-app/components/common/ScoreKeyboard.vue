<template>
  <view class="score-keyboard" v-if="visible" @click.stop>
    <view class="keyboard-header">
      <text class="header-title">{{ title }}</text>
      <view class="header-actions">
        <text class="header-delete" @click="onDelete">删除</text>
        <text class="header-done" @click="onDone">完成</text>
      </view>
    </view>
    <view class="keyboard-body">
      <view class="keyboard-row">
        <view
          class="keyboard-key"
          :class="key.colorClass"
          v-for="key in row1"
          :key="key.value"
          @click="onKeyPress(key)"
        >
          <text class="key-text">{{ key.label }}</text>
        </view>
      </view>
      <view class="keyboard-row">
        <view
          class="keyboard-key"
          :class="key.colorClass"
          v-for="key in row2"
          :key="key.value"
          @click="onKeyPress(key)"
        >
          <text class="key-text">{{ key.label }}</text>
        </view>
      </view>
      <view class="keyboard-row">
        <view
          class="keyboard-key"
          :class="key.colorClass"
          v-for="key in row3"
          :key="key.value"
          @click="onKeyPress(key)"
        >
          <text class="key-text">{{ key.label }}</text>
        </view>
      </view>
      <view class="keyboard-row">
        <view
          class="keyboard-key key-x"
          @click="onKeyPress({ value: 'X', label: 'X', score: 10 })"
        >
          <text class="key-text">X</text>
        </view>
        <view
          class="keyboard-key key-10"
          @click="onKeyPress({ value: '10', label: '10', score: 10 })"
        >
          <text class="key-text">10</text>
        </view>
        <view
          class="keyboard-key key-m"
          @click="onKeyPress({ value: 'M', label: 'M', score: 0 })"
        >
          <text class="key-text">M</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  maxScore: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["input", "delete", "done", "close"]);

// 键盘按键布局
const row1 = computed(() => [
  { value: "1", label: "1", score: 1, colorClass: "key-white" },
  { value: "2", label: "2", score: 2, colorClass: "key-white" },
  { value: "3", label: "3", score: 3, colorClass: "key-black" },
]);

const row2 = computed(() => [
  { value: "4", label: "4", score: 4, colorClass: "key-black" },
  { value: "5", label: "5", score: 5, colorClass: "key-blue" },
  { value: "6", label: "6", score: 6, colorClass: "key-blue" },
]);

const row3 = computed(() => [
  { value: "7", label: "7", score: 7, colorClass: "key-red" },
  { value: "8", label: "8", score: 8, colorClass: "key-red" },
  { value: "9", label: "9", score: 9, colorClass: "key-yellow" },
]);

// 按键点击
const onKeyPress = (key) => {
  emit("input", key);
};

// 删除
const onDelete = () => {
  emit("delete");
};

// 完成
const onDone = () => {
  emit("done");
  emit("close");
};
</script>

<style lang="scss" scoped>
.score-keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f5f5f5;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 28rpx;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.header-delete {
  font-size: 28rpx;
  color: #ff5252;
  padding: 10rpx 20rpx;
}

.header-done {
  font-size: 28rpx;
  color: #00c853;
  padding: 10rpx 20rpx;
}

.keyboard-body {
  padding: 10rpx;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  margin-bottom: 10rpx;
}

.keyboard-key {
  flex: 1;
  height: 100rpx;
  margin: 0 5rpx;
  background-color: #fff;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:active {
    background-color: #e0e0e0;
  }
}

.key-text {
  font-size: 40rpx;
  color: #333;
  font-weight: 500;
}

.key-white {
  background-color: #fff;
  border: 2rpx solid #333;

  .key-text {
    color: #333;
  }
}

.key-black {
  background-color: #333;

  .key-text {
    color: #fff;
  }
}

.key-blue {
  background-color: #2196f3;

  .key-text {
    color: #fff;
  }
}

.key-red {
  background-color: #ff0000;

  .key-text {
    color: #fff;
  }
}

.key-yellow {
  background-color: #ffd700;

  .key-text {
    color: #333;
  }
}

.key-x {
  background-color: #ffd700;

  .key-text {
    color: #333;
  }
}

.key-10 {
  background-color: #ffd700;

  .key-text {
    color: #333;
  }
}

.key-m {
  background-color: #ccc;

  .key-text {
    color: #666;
  }
}
</style>
