<template>
  <view class="page-container">
    <!-- 基础选项 -->
    <view class="config-section">
      <text class="section-title">基础选项</text>
      <view class="option-row">
        <view class="option-tags">
          <!-- 弓种选择 -->
          <view
            class="option-tag"
            :class="{ active: showBowPicker }"
            @click="showBowPicker = true"
          >
            <text class="tag-icon">🏹</text>
            <text class="tag-text">{{ getBowLabel(config.bowType) }}</text>
          </view>

          <!-- 距离选择 -->
          <view
            class="option-tag"
            :class="{ active: showDistancePicker }"
            @click="showDistancePicker = true"
          >
            <text class="tag-icon">📏</text>
            <text class="tag-text">{{ config.distance }}</text>
          </view>

          <!-- 靶面选择 -->
          <view
            class="option-tag"
            :class="{ active: showTargetPicker }"
            @click="showTargetPicker = true"
          >
            <text class="tag-icon">🎯</text>
            <text class="tag-text">{{
              getTargetLabel(config.targetType)
            }}</text>
          </view>

          <!-- 分组设置 -->
          <view
            class="option-tag"
            :class="{ active: showGroupPicker }"
            @click="showGroupPicker = true"
          >
            <text class="tag-icon">📊</text>
            <text class="tag-text">设置分组</text>
          </view>
        </view>
      </view>
      <view class="group-info">
        <text
          >分组: {{ config.groupNum }}组 * {{ config.arrowNum }}箭（共{{
            config.groupNum * config.arrowNum
          }}箭）</text
        >
      </view>
    </view>

    <!-- 高级选项 -->
    <view class="config-section">
      <text class="section-title">高级选项</text>

      <view class="switch-row">
        <text class="switch-label">是否11分:</text>
        <switch
          :checked="config.is11Score"
          @change="onIs11ScoreChange"
          :color="themeColor"
        />
      </view>

      <view class="switch-row">
        <text class="switch-label">是否照相:</text>
        <switch
          :checked="config.isTakePhoto"
          @change="onIsTakePhotoChange"
          :color="themeColor"
        />
      </view>

      <view class="switch-row">
        <text class="switch-label">是否报时:</text>
        <switch
          :checked="config.isTiming"
          @change="onIsTimingChange"
          :color="themeColor"
        />
      </view>

      <!-- 计时设置 -->
      <view class="timing-row" v-if="config.isTiming">
        <view class="timing-input">
          <text class="timing-label">准备时间:</text>
          <input
            class="timing-field"
            type="number"
            v-model="config.prepareTime"
          />
          <text class="timing-unit">秒</text>
        </view>
        <view class="timing-input">
          <text class="timing-label">倒计时:</text>
          <input
            class="timing-field"
            type="number"
            v-model="config.formalTime"
          />
          <text class="timing-unit">秒</text>
        </view>
      </view>
    </view>

    <!-- 开始计分按钮 -->
    <view class="start-btn" @click="startScoring">
      <text>开始计分</text>
    </view>

    <!-- 弓种选择弹窗 -->
    <Popup
      v-model:visible="showBowPicker"
      title="选择弓种"
      position="bottom"
      :showFooter="false"
    >
      <view class="picker-options">
        <view
          class="picker-option"
          :class="{ active: config.bowType === bow.value }"
          v-for="bow in bowTypes"
          :key="bow.value"
          @click="selectBow(bow)"
        >
          <text>{{ bow.label }}</text>
        </view>
      </view>
    </Popup>

    <!-- 距离选择弹窗 -->
    <Popup
      v-model:visible="showDistancePicker"
      title="选择距离"
      position="bottom"
      @confirm="onDistanceConfirm"
    >
      <view class="picker-options">
        <view
          class="picker-option"
          :class="{ active: config.distance === d.value }"
          v-for="d in distances"
          :key="d.value"
          @click="selectDistance(d)"
        >
          <text>{{ d.label }}</text>
        </view>
      </view>
      <view class="custom-input-row">
        <input
          class="custom-input"
          type="number"
          v-model="customDistance"
          placeholder="自定义距离"
        />
        <text class="custom-unit">米</text>
      </view>
    </Popup>

    <!-- 靶面选择弹窗 -->
    <Popup
      v-model:visible="showTargetPicker"
      title="选择靶面"
      position="bottom"
      :showFooter="false"
    >
      <view class="picker-options target-grid">
        <view
          class="picker-option"
          :class="{ active: config.targetType === t.value }"
          v-for="t in targetTypes"
          :key="t.value"
          @click="selectTarget(t)"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>
    </Popup>

    <!-- 分组选择弹窗 -->
    <Popup
      v-model:visible="showGroupPicker"
      title=""
      :showHeader="false"
      :showFooter="false"
      position="center"
    >
      <GroupPicker
        :defaultGroupNum="config.groupNum"
        :defaultArrowNum="config.arrowNum"
        @confirm="onGroupConfirm"
        @close="showGroupPicker = false"
      />
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { BOW_TYPES, DISTANCES, TARGET_TYPES } from "@/utils/constants.js";
import { createScoreRecord } from "@/utils/score.js";
import { addScoreRecord } from "@/utils/storage.js";
import { getThemeColor } from "@/utils/theme.js";
import Popup from "@/components/common/Popup.vue";
import GroupPicker from "@/components/business/GroupPicker.vue";

// 主题色
const themeColor = ref(getThemeColor());

// 配置数据
const config = reactive({
  bowType: "americanHuntingBow",
  distance: "30m",
  targetType: "80Full",
  groupNum: 6,
  arrowNum: 6,
  is11Score: false,
  isTakePhoto: false,
  isTiming: false,
  prepareTime: 10,
  formalTime: 120,
});

// 选项数据
const bowTypes = ref(BOW_TYPES);
const distances = ref(DISTANCES);
const targetTypes = ref(TARGET_TYPES);

// 弹窗状态
const showBowPicker = ref(false);
const showDistancePicker = ref(false);
const showTargetPicker = ref(false);
const showGroupPicker = ref(false);

// 自定义输入
const customDistance = ref("");

// 获取弓种名称
const getBowLabel = (value) => {
  const bow = bowTypes.value.find((b) => b.value === value);
  return bow ? bow.label : value;
};

// 获取靶面名称
const getTargetLabel = (value) => {
  const target = targetTypes.value.find((t) => t.value === value);
  return target ? target.label : value;
};

// 选择弓种
const selectBow = (bow) => {
  config.bowType = bow.value;
  showBowPicker.value = false;
};

// 选择距离
const selectDistance = (d) => {
  config.distance = d.value;
  customDistance.value = "";
};

// 距离确认
const onDistanceConfirm = () => {
  if (customDistance.value) {
    config.distance = customDistance.value + "m";
  }
  showDistancePicker.value = false;
};

// 选择靶面
const selectTarget = (t) => {
  config.targetType = t.value;
  showTargetPicker.value = false;
};

// 分组确认
const onGroupConfirm = (data) => {
  config.groupNum = data.groupNum;
  config.arrowNum = data.arrowNum;
  showGroupPicker.value = false;
};

// 开关切换
const onIs11ScoreChange = (e) => {
  config.is11Score = e.detail.value;
};

const onIsTakePhotoChange = (e) => {
  config.isTakePhoto = e.detail.value;
};

const onIsTimingChange = (e) => {
  config.isTiming = e.detail.value;
};

// 开始计分
const startScoring = () => {
  // 创建计分记录
  const record = createScoreRecord({
    ...config,
    scoreMode: "normal",
  });

  // 保存到本地
  addScoreRecord(record);

  // 跳转到计分输入页面
  uni.navigateTo({
    url: `/pages/score/scoring?id=${record.scoreRecordId}&mode=normal`,
  });
};

onMounted(() => {
  // 监听主题色变化
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

onUnmounted(() => {
  uni.$off("themeColorChange");
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
}

.config-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.option-row {
  margin-bottom: 16rpx;
}

.option-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-tag {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 40rpx;
  background-color: #fff;

  &.active,
  &:active {
    border-color: v-bind(themeColor);
    background-color: v-bind('themeColor + "0D"');
  }
}

.tag-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.tag-text {
  font-size: 26rpx;
  color: #333;
}

.group-info {
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;

  text {
    font-size: 26rpx;
    color: #666;
  }
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.switch-label {
  font-size: 28rpx;
  color: #333;
}

.timing-row {
  display: flex;
  gap: 32rpx;
  padding-top: 24rpx;
}

.timing-input {
  display: flex;
  align-items: center;
  flex: 1;
}

.timing-label {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
}

.timing-field {
  width: 100rpx;
  height: 60rpx;
  border-bottom: 2rpx solid #ddd;
  text-align: center;
  font-size: 28rpx;
  margin: 0 8rpx;
}

.timing-unit {
  font-size: 26rpx;
  color: #999;
}

.start-btn {
  width: 100%;
  height: 96rpx;
  background-color: v-bind(themeColor);
  border-radius: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 48rpx;
  box-shadow: 0 4rpx 12rpx v-bind('themeColor + "4D"');

  text {
    font-size: 34rpx;
    color: #fff;
    font-weight: 500;
  }
}

.picker-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
}

.target-grid {
  max-height: 400rpx;
  overflow-y: auto;
}

.picker-option {
  padding: 20rpx 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;

  &.active {
    border-color: #00c853;
    background-color: rgba(0, 200, 83, 0.1);

    text {
      color: #00c853;
    }
  }

  text {
    font-size: 28rpx;
    color: #333;
  }
}

.custom-input-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  margin-top: 16rpx;
  border-top: 1px solid #f0f0f0;
}

.custom-input {
  flex: 1;
  height: 64rpx;
  padding: 0 16rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.custom-unit {
  font-size: 26rpx;
  color: #999;
  margin-left: 12rpx;
}
</style>
