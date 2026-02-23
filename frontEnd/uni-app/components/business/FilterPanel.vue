<template>
  <view class="filter-panel">
    <view class="panel-header">
      <text class="header-title">筛选条件</text>
      <view class="close-btn" @click="onClose">
        <text class="close-icon">×</text>
      </view>
    </view>

    <!-- 时间筛选 -->
    <view class="filter-section">
      <view class="section-row">
        <view class="checkbox-wrapper" @click="toggleTimeFilter">
          <view class="checkbox" :class="{ checked: enableTimeFilter }">
            <text v-if="enableTimeFilter">✓</text>
          </view>
        </view>
        <text class="section-label">时间:</text>
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: timeType === 'single' }"
            @click="timeType = 'single'"
          >
            <view class="radio-dot"></view>
            <text>单日</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: timeType === 'range' }"
            @click="timeType = 'range'"
          >
            <view class="radio-dot"></view>
            <text>多日</text>
          </view>
        </view>
      </view>

      <view class="time-input" v-if="enableTimeFilter">
        <view
          class="date-picker"
          @click="pickDate('start')"
          v-if="timeType === 'single'"
        >
          <text class="date-text">{{ startDate || "选择时间" }}</text>
          <text class="date-icon">📅</text>
        </view>
        <view class="date-range" v-else>
          <text class="range-label">日期区间</text>
          <view class="date-picker" @click="pickDate('start')">
            <text class="date-text">{{ startDate || "开始日期" }}</text>
          </view>
          <text class="range-sep">-</text>
          <view class="date-picker" @click="pickDate('end')">
            <text class="date-text">{{ endDate || "结束日期" }}</text>
          </view>
          <text class="date-icon">📅</text>
        </view>
      </view>
    </view>

    <!-- 分数筛选 -->
    <view class="filter-section">
      <view class="section-row">
        <view class="checkbox-wrapper" @click="toggleScoreFilter">
          <view class="checkbox" :class="{ checked: enableScoreFilter }">
            <text v-if="enableScoreFilter">✓</text>
          </view>
        </view>
        <text class="section-label">分数:</text>
      </view>

      <view class="score-slider" v-if="enableScoreFilter">
        <view class="slider-track">
          <view
            class="slider-fill"
            :style="{
              left: minPercent + '%',
              width: maxPercent - minPercent + '%',
            }"
          ></view>
          <view
            class="slider-thumb thumb-min"
            :style="{ left: minPercent + '%' }"
            @touchmove.stop.prevent="onMinMove"
          ></view>
          <view
            class="slider-thumb thumb-max"
            :style="{ left: maxPercent + '%' }"
            @touchmove.stop.prevent="onMaxMove"
          >
            <view class="thumb-value">{{ scoreMax }}</view>
          </view>
        </view>
        <view class="slider-labels">
          <text>{{ scoreMin }}</text>
          <text>{{ scoreMax }}</text>
        </view>
      </view>
    </view>

    <!-- 按钮 -->
    <view class="filter-buttons">
      <view class="btn btn-reset" @click="onReset">
        <text>重置</text>
      </view>
      <view class="btn btn-apply" @click="onApply">
        <text>应用</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getThemeColor } from "@/utils/theme.js";

const props = defineProps({
  filter: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["apply", "reset", "close"]);

const themeColor = ref(getThemeColor());

const enableTimeFilter = ref(false);
const enableScoreFilter = ref(false);
const timeType = ref("single");
const startDate = ref("");
const endDate = ref("");
const scoreMin = ref(0);
const scoreMax = ref(720);

// 分数百分比
const minPercent = computed(() => (scoreMin.value / 720) * 100);
const maxPercent = computed(() => (scoreMax.value / 720) * 100);

const toggleTimeFilter = () => {
  enableTimeFilter.value = !enableTimeFilter.value;
};

const toggleScoreFilter = () => {
  enableScoreFilter.value = !enableScoreFilter.value;
};

const pickDate = (type) => {
  uni.showToast({ title: "请选择日期", icon: "none" });
  // 这里可以使用日期选择器
};

const onMinMove = (e) => {
  // 处理滑动
};

const onMaxMove = (e) => {
  // 处理滑动
};

const onReset = () => {
  enableTimeFilter.value = false;
  enableScoreFilter.value = false;
  timeType.value = "single";
  startDate.value = "";
  endDate.value = "";
  scoreMin.value = 0;
  scoreMax.value = 720;
  emit("reset");
};

const onApply = () => {
  const filter = {};

  if (enableTimeFilter.value) {
    if (timeType.value === "single" && startDate.value) {
      filter.startTime = new Date(startDate.value).getTime();
      filter.endTime = filter.startTime + 24 * 60 * 60 * 1000;
    } else if (timeType.value === "range") {
      if (startDate.value)
        filter.startTime = new Date(startDate.value).getTime();
      if (endDate.value)
        filter.endTime =
          new Date(endDate.value).getTime() + 24 * 60 * 60 * 1000;
    }
  }

  if (enableScoreFilter.value) {
    filter.scoreMin = scoreMin.value;
    filter.scoreMax = scoreMax.value;
  }

  emit("apply", filter);
};

const onClose = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.filter-panel {
  padding: 24rpx 32rpx;
}

.panel-header {
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

.filter-section {
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1px solid #eee;
}

.section-row {
  display: flex;
  align-items: center;
}

.checkbox-wrapper {
  margin-right: 16rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ddd;
  border-radius: 4rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  &.checked {
    background-color: v-bind(themeColor);
    border-color: v-bind(themeColor);

    text {
      color: #fff;
      font-size: 24rpx;
    }
  }
}

.section-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 24rpx;
}

.radio-group {
  display: flex;
  gap: 24rpx;
}

.radio-item {
  display: flex;
  align-items: center;

  &.active {
    .radio-dot {
      border-color: v-bind(themeColor);

      &::after {
        content: "";
        width: 16rpx;
        height: 16rpx;
        background-color: v-bind(themeColor);
        border-radius: 50%;
      }
    }

    text {
      color: v-bind(themeColor);
    }
  }
}

.radio-dot {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  margin-right: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-input {
  margin-top: 24rpx;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  background-color: #f9f9f9;
}

.date-text {
  font-size: 26rpx;
  color: #666;
}

.date-icon {
  font-size: 28rpx;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .date-picker {
    flex: 1;
  }
}

.range-label {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}

.range-sep {
  font-size: 26rpx;
  color: #999;
}

.score-slider {
  margin-top: 48rpx;
  padding: 0 24rpx;
}

.slider-track {
  position: relative;
  height: 8rpx;
  background-color: #eee;
  border-radius: 4rpx;
}

.slider-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: v-bind(themeColor);
  border-radius: 4rpx;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 32rpx;
  height: 32rpx;
  background-color: #fff;
  border: 4rpx solid v-bind(themeColor);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.thumb-value {
  position: absolute;
  top: -48rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: v-bind(themeColor);
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

.filter-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 28rpx;
  }
}

.btn-reset {
  background-color: #fff;
  border: 2rpx solid v-bind(themeColor);

  text {
    color: v-bind(themeColor);
  }
}

.btn-apply {
  background-color: v-bind(themeColor);

  text {
    color: #fff;
  }
}
</style>
