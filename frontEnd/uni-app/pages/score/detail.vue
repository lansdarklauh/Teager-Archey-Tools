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

    <!-- 环数分布图表 - 使用 ucharts -->
    <view
      class="chart-section"
      v-if="record.scoreMode !== 'custom' && hasRingData"
    >
      <view class="section-header">
        <text class="section-title">环数分布</text>
        <view class="chart-type-tabs">
          <view
            class="tab"
            :class="{ active: chartType === 'bar' }"
            @click="chartType = 'bar'"
          >
            <text>条形图</text>
          </view>
          <view
            class="tab"
            :class="{ active: chartType === 'pie' }"
            @click="chartType = 'pie'"
          >
            <text>饼图</text>
          </view>
        </view>
      </view>
      <view class="ucharts-container" v-if="chartType === 'bar'">
        <qiun-data-charts
          type="column"
          :chartData="ringColumnChartData"
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

    <!-- 组分变化 - 使用 ucharts 折线图 -->
    <view
      class="chart-section"
      v-if="record.scoreMode !== 'custom' && hasGroupData"
    >
      <view class="section-header">
        <text class="section-title">组分变化</text>
      </view>
      <view class="ucharts-container">
        <qiun-data-charts
          type="line"
          :chartData="groupLineChartData"
          :opts="groupLineOpts"
        />
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
import { RING_COLORS } from "@/utils/constants.js";
import { formatDecimal2 } from "@/utils/number.js";

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
    record.value.totalArrowNum,
  );
});

const totalGroupScore = computed(() => {
  const list = record.value.groupScoreList;
  if (!list || list.length === 0) return "0.00";
  const sum = list.reduce((s, g) => s + (g.groupTotalScore || 0), 0);
  return formatDecimal2(sum / list.length);
});

const totalX = computed(() => {
  return record.value.groupScoreList.reduce(
    (sum, g) => sum + (g.xCount || 0),
    0,
  );
});

const totalXTen = computed(() => {
  return record.value.groupScoreList.reduce(
    (sum, g) => sum + (g.xCount || 0) + (g.tenCount || 0),
    0,
  );
});

const ringDistribution = computed(() => {
  return generateRingDistribution(record.value);
});

const totalArrows = computed(() => {
  return ringDistribution.value.reduce((sum, item) => sum + item.count, 0);
});

// ucharts 环数柱状图数据（每柱应用对应环数颜色）
const ringColumnChartData = computed(() => {
  const dist = ringDistribution.value;
  const categories = dist.map((d) => d.ring);
  const data = dist.map((d) => ({
    value: d.count,
    color: RING_COLORS[d.ring] || "#999",
  }));
  return {
    categories,
    series: [{ name: "环数", data }],
  };
});

// ucharts 环数饼图数据（每块应用对应环数颜色）
const ringPieChartData = computed(() => {
  const dist = ringDistribution.value.filter((d) => d.count > 0);
  return {
    categories: [],
    series: [
      {
        name: "环数",
        data: dist.map((d) => ({
          name: d.ring,
          value: d.count,
          color: RING_COLORS[d.ring] || "#999",
        })),
      },
    ],
  };
});

// ucharts 组分折线图数据
const groupLineChartData = computed(() => {
  const groups = record.value.groupScoreList || [];
  const categories = groups.map((_, i) => String(i + 1));
  const data = groups.map((g) => g.groupTotalScore || 0);
  return {
    categories,
    series: [{ name: "组分", data }],
  };
});

const hasRingData = computed(() => totalArrows.value > 0);

const hasGroupData = computed(
  () => record.value.groupScoreList && record.value.groupScoreList.length > 0,
);

// ucharts 配置（柱子间1px间隙）
const ringColumnOpts = {
  color: ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"].map(
    (r) => RING_COLORS[r],
  ),
  padding: [15, 10, 0, 15],
  dataLabel: true,
  xAxis: { disableGrid: true },
  yAxis: { gridType: "dash" },
  extra: {
    column: {
      type: "group",
      width: 20,
      meterBorder: 1,
      meterFillColor: "#FFFFFF",
    },
  },
};

const ringPieOpts = {
  color: ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"].map(
    (r) => RING_COLORS[r],
  ),
  padding: [5, 5, 5, 5],
  dataLabel: true,
  legend: { show: true, position: "right" },
};

const groupLineOpts = {
  color: ["#00c853"],
  padding: [15, 10, 0, 15],
  dataLabel: true,
  xAxis: { disableGrid: true },
  yAxis: { gridType: "dash" },
  extra: { line: { type: "curve", width: 2 } },
};

// 方法
const getModeLabel = (mode) => {
  const modes = { normal: "普通模式", simple: "简易模式", custom: "自定义" };
  return modes[mode] || mode;
};

const getBowLabel = (value) => getBowTypeName(value);
const getTargetLabel = (value) => getTargetTypeName(value);

// X/10/9黄 8/7红 6/5蓝 4/3黑白字 2/1白黑字黑边框 M灰黑字
const getScoreClass = (score) => {
  if (score === "X" || score === "10" || score === "9") return "score-gold";
  if (score === "8" || score === "7") return "score-red";
  if (score === "6" || score === "5") return "score-blue";
  if (score === "4" || score === "3") return "score-black";
  if (score === "2" || score === "1") return "score-white";
  if (score === "M") return "score-miss";
  return "score-default";
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
  text-align: center;
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

.score-black {
  background-color: #000;
  text {
    color: #fff;
  }
}

.score-white {
  background-color: #fff;
  border: 1px solid #000;
  text {
    color: #000;
  }
}

.score-miss {
  background-color: #9e9e9e;
  text {
    color: #000;
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

.ucharts-container {
  height: 400rpx;
  width: 100%;
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
