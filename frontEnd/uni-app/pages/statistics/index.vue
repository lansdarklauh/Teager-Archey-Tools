<template>
  <view class="page-container">
    <!-- 统计概览 -->
    <view class="stat-overview">
      <view class="stat-item">
        <text class="stat-value">{{ statistics.totalRecords }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.avgScore }}</text>
        <text class="stat-label">平均分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.maxScore }}</text>
        <text class="stat-label">最高分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.arrowAvg }}</text>
        <text class="stat-label">箭均分</text>
      </view>
    </view>

    <!-- 时间筛选 -->
    <view class="filter-tabs">
      <view
        class="tab-item"
        :class="{ active: timeRange === 'all' }"
        @click="timeRange = 'all'"
      >
        <text>全部</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: timeRange === 'today' }"
        @click="timeRange = 'today'"
      >
        <text>今天</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: timeRange === 'week' }"
        @click="timeRange = 'week'"
      >
        <text>本周</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: timeRange === 'month' }"
        @click="timeRange = 'month'"
      >
        <text>本月</text>
      </view>
    </view>

    <!-- 详细统计 -->
    <view class="stat-details">
      <view class="detail-card">
        <text class="card-title">统计数据</text>
        <view class="detail-grid">
          <view class="detail-item">
            <text class="detail-label">总分数</text>
            <text class="detail-value">{{ statistics.totalScore }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">中位数</text>
            <text class="detail-value">{{ statistics.medianScore }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">众数</text>
            <text class="detail-value">{{ statistics.modeScore }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">最低分</text>
            <text class="detail-value">{{ statistics.minScore }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">总箭数</text>
            <text class="detail-value">{{ statistics.totalArrows }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">总X数</text>
            <text class="detail-value">{{ statistics.xTotal }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">总10环</text>
            <text class="detail-value">{{ statistics.tenTotal }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">X+10率</text>
            <text class="detail-value">{{ xTenRate }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 环数分布 -->
    <view class="chart-card">
      <text class="card-title">环数分布</text>
      <view class="ring-distribution">
        <view
          class="ring-item"
          v-for="(item, key) in statistics.ringDistribution"
          :key="key"
          v-show="item > 0"
        >
          <view class="ring-bar" :style="{ width: getRingWidth(item) + '%' }">
            <text class="ring-label">{{ key }}</text>
            <text class="ring-count">{{ item }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-records">
      <text class="card-title">最近记录</text>
      <view class="record-list">
        <view
          class="record-item"
          v-for="record in recentRecords"
          :key="record.scoreRecordId"
          @click="goToDetail(record)"
        >
          <view class="record-info">
            <text class="record-score">{{ record.totalScore }}分</text>
            <text class="record-time">{{ formatTime(record.createTime) }}</text>
          </view>
          <view class="record-meta">
            <text>{{ getBowLabel(record.bowType) }}</text>
            <text>{{ record.distance }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { getScoreRecords } from "@/utils/storage.js";
import {
  calculateStatistics,
  getRecordsByTimeRange,
} from "@/utils/statistics.js";
import { getBowTypeName, formatTime } from "@/utils/score.js";
import { getThemeColor } from "@/utils/theme.js";

// 主题色
const themeColor = ref(getThemeColor());

// 数据
const records = ref([]);
const timeRange = ref("all");

// 计算统计数据
const filteredRecords = computed(() => {
  return getRecordsByTimeRange(records.value, timeRange.value);
});

const statistics = computed(() => {
  return calculateStatistics(filteredRecords.value);
});

const xTenRate = computed(() => {
  if (statistics.value.totalArrows === 0) return 0;
  return Math.round(
    ((statistics.value.xTotal + statistics.value.tenTotal) /
      statistics.value.totalArrows) *
      100
  );
});

const recentRecords = computed(() => {
  return filteredRecords.value.slice(0, 5);
});

const maxRingCount = computed(() => {
  return Math.max(...Object.values(statistics.value.ringDistribution || {}), 1);
});

// 方法
const getBowLabel = (value) => getBowTypeName(value);

const getRingWidth = (count) => {
  return Math.max((count / maxRingCount.value) * 100, 10);
};

const goToDetail = (record) => {
  uni.navigateTo({
    url: `/pages/score/detail?id=${record.scoreRecordId}`,
  });
};

// 加载数据
const loadRecords = () => {
  records.value = getScoreRecords();
};

onMounted(() => {
  loadRecords();
  // 监听主题色变化
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

onUnmounted(() => {
  uni.$off("themeColorChange");
});

// 监听时间范围变化
watch(timeRange, () => {
  // 重新计算统计数据
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.stat-overview {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx 16rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f0f0f0;

  &:last-child {
    border-right: none;
  }
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: v-bind(themeColor);
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.filter-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  height: 64rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12rpx;

  &.active {
    background-color: v-bind(themeColor);

    text {
      color: #fff;
    }
  }

  text {
    font-size: 26rpx;
    color: #666;
  }
}

.stat-details {
  margin-bottom: 24rpx;
}

.detail-card,
.chart-card,
.recent-records {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.ring-distribution {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ring-item {
  display: flex;
  align-items: center;
}

.ring-bar {
  height: 48rpx;
  background-color: v-bind(themeColor);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
  min-width: 80rpx;
}

.ring-label {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.ring-count {
  font-size: 24rpx;
  color: #fff;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.record-score {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.record-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.record-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  text {
    font-size: 24rpx;
    color: #666;
  }
}
</style>
