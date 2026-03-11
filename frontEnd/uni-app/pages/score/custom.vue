<template>
  <view class="page-container">
    <!-- 基础选项 -->
    <view class="config-section">
      <text class="section-title">基础选项</text>
      <view class="option-tags">
        <!-- 弓种选择 -->
        <view class="option-tag" @click="showBowPicker = true">
          <text class="tag-icon">🏹</text>
          <text class="tag-text">{{ getBowLabel(config.bowType) }}</text>
        </view>

        <!-- 分组设置 -->
        <view class="option-tag" @click="showGroupPicker = true">
          <text class="tag-icon">📊</text>
          <text class="tag-text">设置分组</text>
        </view>

        <!-- 距离（仅单靶时显示） -->
        <view
          class="option-tag"
          @click="showDistancePicker = true"
          v-if="!isMultiTarget"
        >
          <text class="tag-icon">📏</text>
          <text class="tag-text">{{ config.distance }}</text>
        </view>
      </view>
      <view class="group-info">
        <text>分组: {{ config.groupNum }}组</text>
      </view>
    </view>

    <!-- 高级选项 -->
    <view class="config-section">
      <text class="section-title">高级选项</text>

      <view class="switch-row">
        <text class="switch-label">是否11分:</text>
        <switch
          :checked="config.is11Score"
          @change="(e) => (config.is11Score = e.detail.value)"
          :color="themeColor"
        />
      </view>

      <view class="switch-row">
        <text class="switch-label">是否照相:</text>
        <switch
          :checked="config.isTakePhoto"
          @change="(e) => (config.isTakePhoto = e.detail.value)"
          :color="themeColor"
        />
      </view>

      <view class="switch-row">
        <text class="switch-label">是否报时:</text>
        <switch
          :checked="config.isTiming"
          @change="(e) => (config.isTiming = e.detail.value)"
          :color="themeColor"
        />
      </view>

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

    <!-- 靶子选项 -->
    <view class="config-section">
      <text class="section-title">靶子选项</text>

      <view class="target-type-tabs">
        <view
          class="tab-item"
          :class="{ active: !isMultiTarget }"
          @click="isMultiTarget = false"
        >
          <text>单个靶子</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: isMultiTarget }"
          @click="isMultiTarget = true"
        >
          <text>多个靶子</text>
        </view>
      </view>

      <!-- 单靶配置 -->
      <view class="single-target" v-if="!isMultiTarget">
        <view class="target-row">
          <text class="target-label">靶面:</text>
          <view class="target-select" @click="showTargetPicker = true">
            <text>{{ getTargetLabel(config.targetType) }}</text>
            <text class="select-icon">▼</text>
          </view>
        </view>
        <view class="target-row">
          <text class="target-label">单靶箭数:</text>
          <input class="target-input" type="number" v-model="config.arrowNum" />
        </view>
      </view>

      <!-- 多靶配置 -->
      <view class="multi-target" v-else>
        <view class="target-list">
          <TargetConfigItem
            v-for="(target, index) in targetList"
            :key="index"
            :index="index + 1"
            :config="target"
            :showCopy="targetList.length < 6"
            :showDelete="targetList.length > 1"
            @change="(data) => updateTarget(index, data)"
            @copy="copyTarget"
            @delete="deleteTarget"
          />
        </view>

        <view
          class="add-target-btn"
          @click="addTarget"
          v-if="targetList.length < 6"
        >
          <text>+ 添加靶子</text>
        </view>

        <view class="view-detail-btn" @click="showTargetDetail = true">
          <text>查看各个靶子信息 ></text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn btn-primary" @click="startScoring">
        <text>开始计分</text>
      </view>
      <view class="btn btn-outline" @click="savePreset">
        <text>保存预设</text>
      </view>
      <view class="btn btn-outline" @click="showPresetList = true">
        <text>加载预设</text>
      </view>
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
          @click="
            config.bowType = bow.value;
            showBowPicker = false;
          "
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
      @confirm="showDistancePicker = false"
    >
      <view class="picker-options">
        <view
          class="picker-option"
          :class="{ active: config.distance === d.value }"
          v-for="d in distances"
          :key="d.value"
          @click="config.distance = d.value"
        >
          <text>{{ d.label }}</text>
        </view>
      </view>
    </Popup>

    <!-- 靶面选择弹窗 -->
    <Popup
      v-model:visible="showTargetPicker"
      title="选择靶面"
      position="bottom"
      :showFooter="false"
    >
      <view class="picker-options">
        <view
          class="picker-option"
          :class="{ active: config.targetType === t.value }"
          v-for="t in targetTypes"
          :key="t.value"
          @click="
            config.targetType = t.value;
            showTargetPicker = false;
          "
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

    <!-- 预设列表弹窗 -->
    <Popup
      v-model:visible="showPresetList"
      title="加载预设"
      position="bottom"
      :showFooter="false"
    >
      <view class="preset-list" v-if="customPresets.length > 0">
        <view
          class="preset-item"
          v-for="preset in customPresets"
          :key="preset.presetId"
          @click="loadPreset(preset)"
        >
          <view class="preset-info">
            <text class="preset-name">{{ preset.name }}</text>
            <text class="preset-desc">{{ preset.description }}</text>
          </view>
          <view
            class="preset-delete"
            @click.stop="deletePreset(preset.presetId)"
          >
            <text>删除</text>
          </view>
        </view>
      </view>
      <view class="empty-preset" v-else>
        <text>暂无预设</text>
      </view>
    </Popup>

    <!-- 保存预设弹窗 -->
    <Popup
      v-model:visible="showSavePreset"
      title="保存预设"
      @confirm="doSavePreset"
    >
      <view class="preset-form">
        <input
          class="preset-name-input"
          v-model="presetName"
          placeholder="请输入预设名称"
        />
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { BOW_TYPES, DISTANCES, TARGET_TYPES } from "@/utils/constants.js";
import { generateId } from "@/utils/score.js";
import {
  getCustomPresets,
  addCustomPreset,
  deleteCustomPreset,
  addScoreRecord,
  clearScoringCache,
  setScoringCache,
} from "@/utils/storage.js";
import { getThemeColor } from "@/utils/theme.js";
import Popup from "@/components/common/Popup.vue";
import GroupPicker from "@/components/business/GroupPicker.vue";
import TargetConfigItem from "@/components/business/TargetConfigItem.vue";

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

// 多靶配置
const isMultiTarget = ref(false);
const targetList = ref([
  { arrowNum: 6, distance: "30m", targetType: "80Full" },
]);

// 选项数据
const bowTypes = ref(BOW_TYPES);
const distances = ref(DISTANCES);
const targetTypes = ref(TARGET_TYPES);

// 弹窗状态
const showBowPicker = ref(false);
const showDistancePicker = ref(false);
const showTargetPicker = ref(false);
const showGroupPicker = ref(false);
const showTargetDetail = ref(false);
const showPresetList = ref(false);
const showSavePreset = ref(false);

// 预设相关
const customPresets = ref([]);
const presetName = ref("");

// 获取名称方法
const getBowLabel = (value) => {
  const bow = bowTypes.value.find((b) => b.value === value);
  return bow ? bow.label : value;
};

const getTargetLabel = (value) => {
  const target = targetTypes.value.find((t) => t.value === value);
  return target ? target.label : value;
};

// 分组确认
const onGroupConfirm = (data) => {
  config.groupNum = data.groupNum;
  config.arrowNum = data.arrowNum;
  showGroupPicker.value = false;
};

// 靶子管理
const addTarget = () => {
  if (targetList.value.length < 6) {
    targetList.value.push({
      arrowNum: 6,
      distance: "30m",
      targetType: "80Full",
    });
  }
};

const updateTarget = (index, data) => {
  targetList.value[index] = data;
};

const copyTarget = (index) => {
  if (targetList.value.length < 6) {
    targetList.value.push({ ...targetList.value[index] });
  }
};

const deleteTarget = (index) => {
  if (targetList.value.length > 1) {
    targetList.value.splice(index, 1);
  }
};

// 预设管理
const loadPresets = () => {
  customPresets.value = getCustomPresets();
};

const loadPreset = (preset) => {
  Object.assign(config, preset.config);
  if (preset.config.targetList) {
    targetList.value = [...preset.config.targetList];
    isMultiTarget.value = targetList.value.length > 1;
  }
  showPresetList.value = false;
  uni.showToast({ title: "预设已加载", icon: "success" });
};

const savePreset = () => {
  if (customPresets.value.length >= 3) {
    uni.showToast({ title: "预设数量已达上限", icon: "none" });
    return;
  }
  presetName.value = "";
  showSavePreset.value = true;
};

const doSavePreset = () => {
  if (!presetName.value.trim()) {
    uni.showToast({ title: "请输入预设名称", icon: "none" });
    return;
  }

  const preset = {
    presetId: generateId(),
    name: presetName.value,
    description: `${config.groupNum}组/${config.arrowNum}箭`,
    config: {
      ...config,
      targetList: isMultiTarget.value ? [...targetList.value] : [],
    },
  };

  addCustomPreset(preset)
    .then(() => {
      loadPresets();
      showSavePreset.value = false;
      uni.showToast({ title: "预设已保存", icon: "success" });
    })
    .catch((err) => {
      uni.showToast({ title: err.message, icon: "none" });
    });
};

const deletePreset = (presetId) => {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除该预设吗？",
    success: (res) => {
      if (res.confirm) {
        deleteCustomPreset(presetId).then(() => {
          loadPresets();
          uni.showToast({ title: "已删除", icon: "success" });
        });
      }
    },
  });
};

// 开始计分（非首页的“开始计分”一律清缓存重新开始；进入计分页用 reLaunch 清空堆栈）
const startScoring = () => {
  clearScoringCache();
  doStartScoring();
};

const doStartScoring = () => {
  const customTargetList = isMultiTarget.value
    ? targetList.value.map((t, i) => ({
        targetIndex: i + 1,
        targetArrowNum: t.arrowNum,
        targetDistance: t.distance,
        targetType: t.targetType,
        targetPosition: { x: 0, y: 0 },
        targetTotalScore: 0,
      }))
    : [];

  const record = {
    scoreRecordId: generateId(),
    bowType: config.bowType,
    bowName: "",
    distance: isMultiTarget.value ? "" : config.distance,
    targetType: isMultiTarget.value ? "" : config.targetType,
    groupNum: config.groupNum,
    arrowNum: isMultiTarget.value
      ? targetList.value.reduce((sum, t) => sum + parseInt(t.arrowNum), 0)
      : config.arrowNum,
    totalArrowNum:
      config.groupNum *
      (isMultiTarget.value
        ? targetList.value.reduce((sum, t) => sum + parseInt(t.arrowNum), 0)
        : config.arrowNum),
    is11Score: config.is11Score,
    isTakePhoto: config.isTakePhoto,
    photoList: [],
    isTiming: config.isTiming,
    prepareTime: config.prepareTime,
    formalTime: config.formalTime,
    scoreMode: "custom",
    createTime: Date.now(),
    updateTime: Date.now(),
    groupScoreList: [],
    totalScore: 0,
    customTargetList,
    isSimpleMode: false,
    presetName: "",
    isCompleted: false,
    currentGroupIndex: 0,
  };

  // 不加入首页列表，只写入缓存；完成计分时再 addScoreRecord
  setScoringCache({
    scoreRecordId: record.scoreRecordId,
    mode: "custom",
    record: { ...record, groupScoreList: [], currentGroupIndex: 0 },
  });

  uni.reLaunch({
    url: `/pages/score/scoring?id=${record.scoreRecordId}&mode=custom`,
  });
};

// 初始化
loadPresets();

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
  padding-bottom: 300rpx;
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

.option-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.option-tag {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 40rpx;
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

.target-type-tabs {
  display: flex;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2rpx solid #ddd;
  background-color: #fff;

  &:first-child {
    border-radius: 36rpx 0 0 36rpx;
  }

  &:last-child {
    border-radius: 0 36rpx 36rpx 0;
  }

  &.active {
    background-color: v-bind(themeColor);
    border-color: v-bind(themeColor);

    text {
      color: #fff;
    }
  }

  text {
    font-size: 28rpx;
    color: #666;
  }
}

.target-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.target-label {
  font-size: 26rpx;
  color: #666;
  width: 140rpx;
}

.target-select {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  text {
    font-size: 26rpx;
    color: #333;
  }
}

.select-icon {
  font-size: 20rpx;
  color: #999;
}

.target-input {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.add-target-btn {
  height: 80rpx;
  border: 2rpx dashed v-bind(themeColor);
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16rpx;

  text {
    font-size: 28rpx;
    color: v-bind(themeColor);
  }
}

.view-detail-btn {
  margin-top: 16rpx;

  text {
    font-size: 26rpx;
    color: #00c853;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn {
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 30rpx;
  }
}

.btn-primary {
  background-color: v-bind(themeColor);

  text {
    color: #fff;
  }
}

.btn-outline {
  background-color: #fff;
  border: 2rpx solid v-bind(themeColor);

  text {
    color: v-bind(themeColor);
  }
}

.picker-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
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

.preset-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.preset-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.preset-delete {
  text {
    font-size: 26rpx;
    color: #ff5252;
  }
}

.empty-preset {
  padding: 48rpx 0;
  text-align: center;

  text {
    font-size: 28rpx;
    color: #999;
  }
}

.preset-form {
  padding: 16rpx 0;
}

.preset-name-input {
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
