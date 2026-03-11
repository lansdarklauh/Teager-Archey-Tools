<template>
  <view class="score-record-card" @click="onCardClick">
    <view class="card-header">
      <text class="record-time">{{ formatTime(record.createTime) }}</text>
      <text class="record-mode">{{ getModeLabel(record.scoreMode) }}</text>
    </view>

    <view class="card-body">
      <view class="record-info">
        <view class="info-row">
          <text class="info-label">弓种:</text>
          <text class="info-value">{{ getBowTypeName(record.bowType) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">距离:</text>
          <text class="info-value">{{ record.distance }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">靶面:</text>
          <text class="info-value">{{
            getTargetTypeName(record.targetType)
          }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">组箭:</text>
          <text class="info-value"
            >{{ record.groupNum }}/{{ record.arrowNum }}</text
          >
        </view>
      </view>

      <view class="record-score">
        <text class="score-label">总分:</text>
        <text class="score-value">{{ record.totalScore }}</text>
      </view>
    </view>

    <!-- 展开的分数详情 -->
    <view class="card-detail" v-if="expanded && record.scoreMode !== 'custom'">
      <view class="detail-groups">
        <view
          class="group-row"
          v-for="(group, index) in record.groupScoreList"
          :key="index"
        >
          <view class="group-scores">
            <view
              class="score-item"
              v-for="(score, sIndex) in group.arrowScoreList"
              :key="sIndex"
              :class="getScoreClass(score)"
            >
              <text>{{ score }}</text>
            </view>
          </view>
          <view class="group-total">
            <text>{{ group.groupTotalScore }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card-footer">
      <view
        class="expand-btn"
        @click.stop="toggleExpand"
        v-if="record.scoreMode !== 'custom'"
      >
        <text>{{ expanded ? "收起" : "展开" }}</text>
        <text class="expand-icon">{{ expanded ? "▲" : "▼" }}</text>
      </view>
      <view class="detail-btn" @click.stop="onDetailClick">
        <text>详情</text>
        <text class="detail-icon">→</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import {
  getBowTypeName,
  getTargetTypeName,
  formatTime,
} from "@/utils/score.js";
import { getThemeColor } from "@/utils/theme.js";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click", "detail"]);

const themeColor = ref(getThemeColor());
const expanded = ref(false);

const getModeLabel = (mode) => {
  const modes = {
    normal: "普通模式",
    simple: "简易模式",
    custom: "自定义",
  };
  return modes[mode] || mode;
};

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

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const onCardClick = () => {
  emit("click", props.record);
};

const onDetailClick = () => {
  emit("detail", props.record);
};
</script>

<style lang="scss" scoped>
.score-record-card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.record-time {
  font-size: 26rpx;
  color: #666;
}

.record-mode {
  font-size: 24rpx;
  color: v-bind(themeColor);
  padding: 4rpx 16rpx;
  background-color: v-bind('themeColor + "1A"');
  border-radius: 20rpx;
}

.card-body {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0 60rpx;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 26rpx;
  color: #999;
  width: 80rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
}

.record-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-left: 40rpx;
}

.score-label {
  font-size: 24rpx;
  color: #999;
}

.score-value {
  font-size: 48rpx;
  font-weight: bold;
  color: v-bind(themeColor);
}

.card-detail {
  padding: 0 24rpx 24rpx;
}

.detail-groups {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
}

.group-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px solid #eee;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.group-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  flex: 1;
}

.score-item {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 22rpx;
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

.group-total {
  margin-left: 16rpx;

  text {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16rpx 24rpx;
  border-top: 1px solid #f0f0f0;
  gap: 32rpx;
}

.expand-btn,
.detail-btn {
  display: flex;
  align-items: center;

  text {
    font-size: 26rpx;
    color: #666;
  }
}

.expand-icon,
.detail-icon {
  margin-left: 8rpx;
  font-size: 20rpx;
}

.detail-btn {
  text {
    color: v-bind(themeColor);
  }
}
</style>
