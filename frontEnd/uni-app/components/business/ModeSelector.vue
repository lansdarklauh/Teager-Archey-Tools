<template>
  <view class="mode-selector">
    <view class="selector-header">
      <text class="header-title">请选择计分模式</text>
      <view class="close-btn" @click="onClose">
        <text class="close-icon">×</text>
      </view>
    </view>

    <view class="mode-list">
      <view
        class="mode-item"
        v-for="mode in modes"
        :key="mode.value"
        @click="onSelect(mode)"
      >
        <view class="mode-content">
          <text class="mode-label">{{ mode.label }}</text>
          <text class="mode-desc">（{{ mode.desc }}）</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { SCORE_MODES } from "@/utils/constants.js";
import { getThemeColor } from "@/utils/theme.js";

const emit = defineEmits(["select", "close"]);

const themeColor = ref(getThemeColor());
const modes = ref(SCORE_MODES);

const onSelect = (mode) => {
  emit("select", mode);
};

const onClose = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.mode-selector {
  padding: 24rpx;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  font-size: 40rpx;
  color: #ff5252;
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.mode-item {
  padding: 32rpx;
  border: 2rpx solid v-bind(themeColor);
  border-radius: 12rpx;
  background-color: #fff;

  &:active {
    background-color: v-bind('themeColor + "1A"');
  }
}

.mode-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-label {
  font-size: 32rpx;
  color: v-bind(themeColor);
  font-weight: 500;
}

.mode-desc {
  font-size: 26rpx;
  color: v-bind(themeColor);
  margin-left: 8rpx;
}
</style>
