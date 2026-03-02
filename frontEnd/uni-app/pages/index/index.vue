<template>
  <view class="page-container">
    <!-- 顶部开始计分按钮 -->
    <view class="start-btn" @click="showModeSelector = true">
      <text>开始计分</text>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-bar">
      <view class="filter-btn" @click="showFilterPanel = true">
        <text>筛选</text>
      </view>
      <view class="sort-btn" @click="showSortPanel = true">
        <text>排序</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="record-list" v-if="records.length > 0">
      <ScoreRecordCard
        v-for="record in filteredRecords"
        :key="record.scoreRecordId"
        :record="record"
        @click="onRecordClick"
        @detail="onDetailClick"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <view class="empty-icon">🎯</view>
      <text class="empty-text">暂无计分记录</text>
      <text class="empty-hint">点击上方按钮开始计分</text>
    </view>

    <!-- 模式选择弹窗 -->
    <Popup
      v-model:visible="showModeSelector"
      title=""
      :showHeader="false"
      :showFooter="false"
      position="center"
    >
      <ModeSelector @select="onModeSelect" @close="showModeSelector = false" />
    </Popup>

    <!-- 筛选弹窗 -->
    <Popup
      v-model:visible="showFilterPanel"
      title=""
      :showHeader="false"
      :showFooter="false"
      position="center"
    >
      <FilterPanel
        :filter="filterCondition"
        @apply="onFilterApply"
        @reset="onFilterReset"
        @close="showFilterPanel = false"
      />
    </Popup>

    <!-- 排序弹窗 -->
    <Popup
      v-model:visible="showSortPanel"
      title="排序方式"
      position="bottom"
      @confirm="onSortConfirm"
    >
      <view class="sort-options">
        <view
          class="sort-option"
          :class="{
            active:
              sortCondition.sortType === 'time' &&
              sortCondition.sortOrder === 'desc',
          }"
          @click="setSortCondition('time', 'desc')"
        >
          <text>按时间（最新优先）</text>
        </view>
        <view
          class="sort-option"
          :class="{
            active:
              sortCondition.sortType === 'time' &&
              sortCondition.sortOrder === 'asc',
          }"
          @click="setSortCondition('time', 'asc')"
        >
          <text>按时间（最早优先）</text>
        </view>
        <view
          class="sort-option"
          :class="{
            active:
              sortCondition.sortType === 'score' &&
              sortCondition.sortOrder === 'desc',
          }"
          @click="setSortCondition('score', 'desc')"
        >
          <text>按分数（高分优先）</text>
        </view>
        <view
          class="sort-option"
          :class="{
            active:
              sortCondition.sortType === 'score' &&
              sortCondition.sortOrder === 'asc',
          }"
          @click="setSortCondition('score', 'asc')"
        >
          <text>按分数（低分优先）</text>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getScoreRecords } from "@/utils/storage.js";
import { filterRecords, sortRecords } from "@/utils/statistics.js";
import { getThemeColor } from "@/utils/theme.js";
import Popup from "@/components/common/Popup.vue";
import ModeSelector from "@/components/business/ModeSelector.vue";
import FilterPanel from "@/components/business/FilterPanel.vue";
import ScoreRecordCard from "@/components/business/ScoreRecordCard.vue";

// 主题色
const themeColor = ref(getThemeColor());

// 数据
const records = ref([]);
const showModeSelector = ref(false);
const showFilterPanel = ref(false);
const showSortPanel = ref(false);

// 筛选和排序条件
const filterCondition = ref({});
const sortCondition = ref({
  sortType: "time",
  sortOrder: "desc",
});

// 过滤和排序后的记录
const filteredRecords = computed(() => {
  let result = [...records.value];

  // 应用筛选
  if (Object.keys(filterCondition.value).length > 0) {
    result = filterRecords(result, filterCondition.value);
  }

  // 应用排序
  result = sortRecords(
    result,
    sortCondition.value.sortType,
    sortCondition.value.sortOrder
  );

  return result;
});

// 加载数据
const loadRecords = () => {
  records.value = getScoreRecords();
};

// 模式选择
const onModeSelect = (mode) => {
  showModeSelector.value = false;

  // 跳转到对应的计分配置页面
  if (mode.value === "simple") {
    uni.navigateTo({ url: "/pages/score/simple" });
  } else if (mode.value === "normal") {
    uni.navigateTo({ url: "/pages/score/normal" });
  } else if (mode.value === "custom") {
    uni.navigateTo({ url: "/pages/score/custom" });
  }
};

// 点击记录
const onRecordClick = (record) => {
  // 可以展开详情或跳转
};

// 点击详情
const onDetailClick = (record) => {
  uni.navigateTo({
    url: `/pages/score/detail?id=${record.scoreRecordId}`,
  });
};

// 筛选应用
const onFilterApply = (filter) => {
  filterCondition.value = filter;
  showFilterPanel.value = false;
};

// 筛选重置
const onFilterReset = () => {
  filterCondition.value = {};
};

// 设置排序条件
const setSortCondition = (type, order) => {
  sortCondition.value = { sortType: type, sortOrder: order };
};

// 排序确认
const onSortConfirm = () => {
  showSortPanel.value = false;
};

// 初次加载
onMounted(() => {
  loadRecords();
  // 监听主题色变化
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

// 每次进入页面时刷新列表（如计分完成后返回）
onShow(() => {
  loadRecords();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.start-btn {
  width: 100%;
  height: 96rpx;
  background-color: v-bind(themeColor);
  border-radius: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx v-bind('themeColor + "4D"');

  text {
    font-size: 34rpx;
    color: #fff;
    font-weight: 500;
  }
}

.filter-bar {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.filter-btn,
.sort-btn {
  flex: 1;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2rpx solid #ddd;

  text {
    font-size: 28rpx;
    color: #666;
  }
}

.record-list {
  // 列表样式
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}

.sort-options {
  padding: 16rpx 0;
}

.sort-option {
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background-color: v-bind('themeColor + "1A"');

    text {
      color: v-bind(themeColor);
      font-weight: 500;
    }
  }

  text {
    font-size: 28rpx;
    color: #333;
  }
}
</style>
