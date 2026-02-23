<template>
  <view class="page-container">
    <!-- 顶部信息卡片 -->
    <view class="info-card">
      <view class="score-total">
        <text class="total-value">{{ record.totalScore }}</text>
      </view>
      <view class="info-details">
        <view class="info-row">
          <text class="info-time">{{ formatTime(record.createTime) }}</text>
          <text class="info-mode">{{ getModeLabel(record.scoreMode) }}</text>
        </view>
        <view class="info-row">
          <text class="info-item">🏹 {{ getBowLabel(record.bowType) }}</text>
          <text class="info-item">📏 {{ record.distance }}</text>
          <text class="info-item"
            >🎯 {{ getTargetLabel(record.targetType) }}</text
          >
          <text class="info-item">{{
            record.is11Score ? "11分" : "10分"
          }}</text>
        </view>
      </view>
    </view>

    <!-- 分数统计表格 -->
    <view class="score-table">
      <view class="table-header">
        <text class="col-stat">统计</text>
        <text class="col-score">局分</text>
        <text class="col-acc">累计</text>
        <text class="col-x">X+10</text>
        <text class="col-x">X</text>
      </view>

      <view class="table-body">
        <view
          class="table-row"
          v-for="(group, index) in record.groupScoreList"
          :key="index"
        >
          <view class="col-scores">
            <view
              class="score-badge"
              :class="getScoreClass(score)"
              v-for="(score, sIndex) in group.arrowScoreList"
              :key="sIndex"
            >
              <text>{{ score }}</text>
            </view>
          </view>
          <text class="col-score">{{ group.groupTotalScore }}</text>
          <text class="col-acc">{{ group.accumulateScore }}</text>
          <text class="col-x">{{ group.xCount + group.tenCount }}</text>
          <text class="col-x">{{ group.xCount }}</text>
        </view>

        <!-- 总计行 -->
        <view class="table-row row-total">
          <view class="col-scores">
            <text class="avg-label">箭均: {{ arrowAverage }}</text>
          </view>
          <text class="col-score">{{ totalGroupScore }}</text>
          <text class="col-acc">{{ record.totalScore }}</text>
          <text class="col-x">{{ totalXTen }}</text>
          <text class="col-x">{{ totalX }}</text>
        </view>
      </view>
    </view>

    <!-- 环数分布图表 -->
    <view class="chart-section" v-if="record.scoreMode !== 'custom'">
      <view class="section-header">
        <text class="section-title">环数分布</text>
        <view class="chart-type-tabs">
          <view
            class="tab"
            :class="{ active: chartType === 'bar' }"
            @click="chartType = 'bar'"
          >
            <text>● 条形图</text>
          </view>
          <view
            class="tab"
            :class="{ active: chartType === 'pie' }"
            @click="chartType = 'pie'"
          >
            <text>○ 饼图</text>
          </view>
        </view>
      </view>

      <!-- 条形图 -->
      <view class="bar-chart" v-if="chartType === 'bar'">
        <view class="chart-container">
          <view class="y-axis">
            <text v-for="y in yAxisLabels" :key="y">{{ y }}</text>
          </view>
          <view class="bars">
            <view
              class="bar-item"
              v-for="item in ringDistribution"
              :key="item.ring"
            >
              <view
                class="bar"
                :class="getBarClass(item.ring)"
                :style="{ height: getBarHeight(item.count) + 'rpx' }"
              >
                <text class="bar-value" v-if="item.count > 0">{{
                  item.count
                }}</text>
              </view>
              <text class="bar-label">{{ item.ring }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 饼图占位 -->
      <view class="pie-chart" v-else>
        <view class="pie-container">
          <view class="pie-legend">
            <view
              class="legend-item"
              v-for="item in ringDistribution"
              :key="item.ring"
              v-show="item.count > 0"
            >
              <view class="legend-color" :class="getBarClass(item.ring)"></view>
              <text
                >{{ item.ring }}: {{ item.count }} ({{
                  getPercent(item.count)
                }}%)</text
              >
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 组分变化 -->
    <view class="chart-section" v-if="record.scoreMode !== 'custom'">
      <view class="section-header">
        <text class="section-title">组分变化</text>
      </view>
      <view class="line-chart">
        <view class="chart-container">
          <view class="line-points">
            <view
              class="point-item"
              v-for="(group, index) in record.groupScoreList"
              :key="index"
            >
              <view
                class="point"
                :style="{
                  bottom: getPointPosition(group.groupTotalScore) + 'rpx',
                }"
              >
                <text class="point-value">{{ group.groupTotalScore }}</text>
              </view>
              <text class="point-label">{{ index + 1 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="action-buttons">
      <view class="btn btn-outline" @click="onShare">
        <text>分享</text>
      </view>
      <view class="btn btn-danger" @click="onDelete">
        <text>删除</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getScoreRecordById, deleteScoreRecord } from "@/utils/storage.js";
import {
  getBowTypeName,
  getTargetTypeName,
  formatTime,
  calculateArrowAverage,
} from "@/utils/score.js";
import { generateRingDistribution } from "@/utils/statistics.js";

// 记录数据
const record = ref({
  scoreRecordId: "",
  bowType: "",
  distance: "",
  targetType: "",
  groupNum: 0,
  arrowNum: 0,
  totalArrowNum: 0,
  is11Score: false,
  scoreMode: "normal",
  createTime: 0,
  groupScoreList: [],
  totalScore: 0,
});

const chartType = ref("bar");

// 计算属性
const arrowAverage = computed(() => {
  return calculateArrowAverage(
    record.value.totalScore,
    record.value.totalArrowNum
  );
});

const totalGroupScore = computed(() => {
  return (
    record.value.groupScoreList.reduce((sum, g) => sum + g.groupTotalScore, 0) /
      record.value.groupScoreList.length || 0
  );
});

const totalX = computed(() => {
  return record.value.groupScoreList.reduce(
    (sum, g) => sum + (g.xCount || 0),
    0
  );
});

const totalXTen = computed(() => {
  return record.value.groupScoreList.reduce(
    (sum, g) => sum + (g.xCount || 0) + (g.tenCount || 0),
    0
  );
});

const ringDistribution = computed(() => {
  return generateRingDistribution(record.value);
});

const totalArrows = computed(() => {
  return ringDistribution.value.reduce((sum, item) => sum + item.count, 0);
});

const maxCount = computed(() => {
  return Math.max(...ringDistribution.value.map((item) => item.count), 1);
});

const yAxisLabels = computed(() => {
  const max = maxCount.value;
  const step = Math.ceil(max / 5);
  return [
    max,
    Math.round(max * 0.75),
    Math.round(max * 0.5),
    Math.round(max * 0.25),
    0,
  ].reverse();
});

// 方法
const getModeLabel = (mode) => {
  const modes = { normal: "普通模式", simple: "简易模式", custom: "自定义" };
  return modes[mode] || mode;
};

const getBowLabel = (value) => getBowTypeName(value);
const getTargetLabel = (value) => getTargetTypeName(value);

const getScoreClass = (score) => {
  if (score === "X" || score === "10") return "score-gold";
  if (score === "9" || score === "8") return "score-red";
  if (score === "7" || score === "6") return "score-blue";
  if (score === "M") return "score-miss";
  return "score-default";
};

const getBarClass = (ring) => {
  if (ring === "X" || ring === "10" || ring === "9") return "bar-gold";
  if (ring === "8" || ring === "7") return "bar-red";
  if (ring === "6" || ring === "5") return "bar-blue";
  if (ring === "M") return "bar-miss";
  return "bar-default";
};

const getBarHeight = (count) => {
  if (count === 0) return 0;
  return Math.max((count / maxCount.value) * 200, 10);
};

const getPercent = (count) => {
  if (totalArrows.value === 0) return 0;
  return Math.round((count / totalArrows.value) * 100);
};

const getPointPosition = (score) => {
  const maxScore = Math.max(
    ...record.value.groupScoreList.map((g) => g.groupTotalScore),
    60
  );
  return (score / maxScore) * 150;
};

// 分享
const onShare = () => {
  uni.showToast({ title: "分享功能开发中", icon: "none" });
};

// 删除
const onDelete = () => {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除这条计分记录吗？删除后无法恢复。",
    success: (res) => {
      if (res.confirm) {
        deleteScoreRecord(record.value.scoreRecordId).then(() => {
          uni.showToast({ title: "已删除", icon: "success" });
          setTimeout(() => {
            uni.navigateBack();
            uni.$emit("refreshScoreList");
          }, 1500);
        });
      }
    },
  });
};

// 加载数据
const loadRecord = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options || currentPage.options || {};

  const id = options.id || "";
  if (id) {
    const data = getScoreRecordById(id);
    if (data) {
      record.value = data;
    }
  }
};

onMounted(() => {
  loadRecord();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 150rpx;
}

.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.score-total {
  width: 160rpx;
  height: 160rpx;
  border: 4rpx solid #00c853;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24rpx;
}

.total-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
}

.info-details {
  flex: 1;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-time {
  font-size: 26rpx;
  color: #666;
}

.info-mode {
  font-size: 24rpx;
  color: #00c853;
  padding: 4rpx 16rpx;
  background-color: rgba(0, 200, 83, 0.1);
  border-radius: 20rpx;
}

.info-item {
  font-size: 24rpx;
  color: #666;
}

.score-table {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.table-header {
  display: flex;
  background-color: #f9f9f9;
  padding: 16rpx;
  border-bottom: 1px solid #eee;

  text {
    font-size: 24rpx;
    color: #666;
    text-align: center;
  }
}

.col-stat {
  flex: 3;
  text-align: left !important;
}

.col-score,
.col-acc,
.col-x {
  width: 80rpx;
}

.table-body {
  padding: 0 16rpx;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.row-total {
  background-color: #f9f9f9;
  margin: 0 -16rpx;
  padding: 16rpx;
}

.col-scores {
  flex: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.score-badge {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 20rpx;
    font-weight: 500;
  }
}

.score-gold {
  background-color: #ffd700;
  text {
    color: #333;
  }
}

.score-red {
  background-color: #ff0000;
  text {
    color: #fff;
  }
}

.score-blue {
  background-color: #2196f3;
  text {
    color: #fff;
  }
}

.score-miss {
  background-color: #ccc;
  text {
    color: #fff;
  }
}

.score-default {
  background-color: #333;
  text {
    color: #fff;
  }
}

.avg-label {
  font-size: 24rpx;
  color: #666;
}

.chart-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.chart-type-tabs {
  display: flex;
  gap: 24rpx;
}

.tab {
  &.active {
    text {
      color: #00c853;
    }
  }

  text {
    font-size: 26rpx;
    color: #999;
  }
}

.bar-chart,
.pie-chart,
.line-chart {
  padding: 16rpx 0;
}

.chart-container {
  display: flex;
}

.y-axis {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  width: 60rpx;
  height: 250rpx;
  padding-bottom: 40rpx;

  text {
    font-size: 20rpx;
    color: #999;
    text-align: right;
  }
}

.bars {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250rpx;
  border-bottom: 1px solid #eee;
  padding-bottom: 40rpx;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar {
  width: 36rpx;
  border-radius: 4rpx 4rpx 0 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4rpx;
  min-height: 4rpx;
}

.bar-value {
  font-size: 18rpx;
  color: #fff;
}

.bar-label {
  font-size: 20rpx;
  color: #666;
  margin-top: 8rpx;
}

.bar-gold {
  background-color: #2196f3;
}

.bar-red {
  background-color: #ff0000;
}

.bar-blue {
  background-color: #2196f3;
}

.bar-miss {
  background-color: #ccc;
}

.bar-default {
  background-color: #333;
}

.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;

  text {
    font-size: 24rpx;
    color: #666;
  }
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
}

.line-points {
  flex: 1;
  display: flex;
  justify-content: space-around;
  height: 200rpx;
  border-bottom: 1px solid #eee;
  position: relative;
}

.point-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
}

.point {
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  background-color: #00c853;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.point-value {
  font-size: 18rpx;
  color: #fff;
}

.point-label {
  position: absolute;
  bottom: -40rpx;
  font-size: 20rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  position: fixed;
  bottom: 24rpx;
  left: 24rpx;
  right: 24rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 30rpx;
  }
}

.btn-outline {
  background-color: #fff;
  border: 2rpx solid #00c853;

  text {
    color: #00c853;
  }
}

.btn-danger {
  background-color: #ff5252;

  text {
    color: #fff;
  }
}
</style>
