<template>
  <view class="page-container">
    <!-- 统计概览 -->
    <view class="stat-overview">
      <view class="stat-item">
        <text class="stat-value">{{ statistics.totalRecords }}</text>
        <text class="stat-label">总记录</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ formatDecimal2(statistics.avgScore) }}</text>
        <text class="stat-label">平均分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ statistics.maxScore }}</text>
        <text class="stat-label">最高分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ formatDecimal2(statistics.arrowAvg) }}</text>
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
            <text class="detail-value">{{ formatDecimal2(statistics.medianScore) }}</text>
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
            <text class="detail-value">{{ formatDecimal2(xTenRate) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 环数分布 - 使用 ucharts 组件 -->
    <view class="chart-card" v-if="hasRingData">
      <view class="chart-header">
        <text class="card-title">环数分布</text>
        <view class="chart-type-tabs">
          <view
            class="tab"
            :class="{ active: ringChartType === 'column' }"
            @click="ringChartType = 'column'"
          >
            <text>条形图</text>
          </view>
          <view
            class="tab"
            :class="{ active: ringChartType === 'pie' }"
            @click="ringChartType = 'pie'"
          >
            <text>饼图</text>
          </view>
        </view>
      </view>
      <view class="ucharts-container" v-if="ringChartType === 'column'">
        <qiun-data-charts
          type="column"
          :chartData="ringChartData"
          :opts="ringColumnOpts"
        />
      </view>
      <view class="ucharts-container" v-else>
        <qiun-data-charts
          type="pie"
          :chartData="ringPieChartData"
          :opts="ringPieOpts"
        />
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
import { RING_COLORS } from "@/utils/constants.js";
import { formatDecimal2 } from "@/utils/number.js";

// 主题色
const themeColor = ref(getThemeColor());

// 数据
const records = ref([]);
const timeRange = ref("all");
const ringChartType = ref("column");

// 计算统计数据
const filteredRecords = computed(() => {
  return getRecordsByTimeRange(records.value, timeRange.value);
});

const statistics = computed(() => {
  return calculateStatistics(filteredRecords.value);
});

const xTenRate = computed(() => {
  if (statistics.value.totalArrows === 0) return 0;
  const rate =
    ((statistics.value.xTotal + statistics.value.tenTotal) /
      statistics.value.totalArrows) *
    100;
  return Math.round(rate * 100) / 100; // 保留2位小数，避免浮点问题
});

const recentRecords = computed(() => {
  return filteredRecords.value.slice(0, 5);
});

// 环数分布图表数据 - ucharts 柱状图格式（每柱应用对应环数颜色）
const ringChartData = computed(() => {
  const dist = statistics.value.ringDistribution || {};
  const categories = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'];
  const data = categories.map((key) => ({
    value: dist[key] || 0,
    color: RING_COLORS[key] || '#999',
  }));
  return {
    categories,
    series: [{ name: '环数', data }],
  };
});

// 环数分布饼图数据 - ucharts 饼图格式（每块应用对应环数颜色）
const ringPieChartData = computed(() => {
  const dist = statistics.value.ringDistribution || {};
  const rings = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'];
  const pieData = rings
    .filter((key) => (dist[key] || 0) > 0)
    .map((key) => ({
      name: key,
      value: dist[key],
      color: RING_COLORS[key] || '#999',
    }));
  return {
    categories: [],
    series: [{ name: '环数', data: pieData }],
  };
});

const hasRingData = computed(() => {
  const dist = statistics.value.ringDistribution || {};
  return Object.values(dist).some((v) => v > 0);
});

// ucharts 配置（柱子间1px间隙）
const ringColumnOpts = computed(() => ({
  color: ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].map(
    (r) => RING_COLORS[r]
  ),
  padding: [15, 10, 0, 15],
  dataLabel: true,
  xAxis: { disableGrid: true },
  yAxis: { gridType: 'dash' },
  extra: {
    column: {
      type: 'group',
      width: 26,
      meterBorder: 1,
      meterFillColor: '#FFFFFF',
    },
  },
}));

const ringPieOpts = computed(() => ({
  color: ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].map(
    (r) => RING_COLORS[r]
  ),
  padding: [5, 5, 5, 5],
  dataLabel: true,
  legend: { show: true, position: 'right' },
}));

// 方法
const getBowLabel = (value) => getBowTypeName(value);

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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.chart-type-tabs {
  display: flex;
  gap: 24rpx;
}

.chart-type-tabs .tab {
  font-size: 26rpx;
  color: #999;

  &.active {
    color: v-bind(themeColor);
    font-weight: 500;
  }
}

.ucharts-container {
  height: 400rpx;
  width: 100%;
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
