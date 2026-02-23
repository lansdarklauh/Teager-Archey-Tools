<template>
  <view class="page-container">
    <!-- 开始计时按钮 -->
    <view
      class="start-btn"
      :class="{ running: isRunning, paused: isPaused }"
      @click="toggleTimer"
    >
      <text class="btn-icon">{{
        isRunning ? (isPaused ? "▶" : "⏸") : "▶"
      }}</text>
      <text class="btn-text">{{ startBtnText }}</text>
    </view>

    <!-- 阶段显示 -->
    <view class="stage-display">
      <view class="stage-info">
        <text class="stage-icon">⚡</text>
        <text class="stage-label">阶段:</text>
        <text class="stage-name" :class="currentStage">{{ stageName }}</text>
        <text class="stage-time"
          >{{ formatTime(remainingTime) }} /
          {{ formatTime(totalStageTime) }}推</text
        >
      </view>
      <view class="progress-bar">
        <view
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
    </view>

    <!-- 预设配置 -->
    <view class="config-section">
      <text class="section-label">预 设 配</text>
      <view class="preset-select" @click="showPresetPicker = true">
        <text class="preset-name">{{
          currentPreset.name || "标准运动模式"
        }}</text>
        <text class="select-icon">▼</text>
      </view>
    </view>

    <!-- 时间参数设置 -->
    <view class="config-section">
      <view class="section-header">
        <text class="section-icon">⏱</text>
        <text class="section-title">时间参数设置</text>
      </view>

      <view class="time-inputs">
        <view class="input-row">
          <view class="input-group">
            <text class="input-label">容 错 时 间</text>
            <input
              class="input-field"
              type="number"
              v-model="config.faultToleranceTime"
              placeholder="0"
              :disabled="isRunning"
            />
          </view>
          <view class="input-group">
            <text class="input-label">准 备 时 间</text>
            <input
              class="input-field"
              type="number"
              v-model="config.prepareTime"
              placeholder="10"
              :disabled="isRunning"
            />
          </view>
        </view>

        <view class="input-row">
          <view class="input-group full">
            <text class="input-label required">正式时间 (min)</text>
            <input
              class="input-field highlight"
              type="number"
              v-model="config.formalTime"
              placeholder="180"
              :disabled="isRunning"
            />
          </view>
        </view>

        <view class="input-row">
          <view class="input-group">
            <text class="input-label">休 息 时 间</text>
            <input
              class="input-field"
              type="number"
              v-model="config.restTime"
              placeholder="30"
              :disabled="isRunning"
            />
          </view>
          <view class="cycle-toggle">
            <text class="toggle-label">开启循环设置</text>
            <switch
              :checked="config.isCycle"
              @change="onCycleChange"
              :color="themeColor"
              :disabled="isRunning"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 提示音设置 -->
    <view class="config-section">
      <view class="section-header">
        <text class="section-icon">🔊</text>
        <text class="section-title">提示音设置</text>
      </view>

      <view class="sound-settings">
        <view class="sound-type">
          <text class="sound-label">提示音类型:</text>
          <view class="type-options">
            <view
              class="type-option"
              :class="{ active: config.tipSoundType === 'sound' }"
              @click="config.tipSoundType = 'sound'"
            >
              <text>音效</text>
            </view>
            <view
              class="type-option"
              :class="{ active: config.tipSoundType === 'voice' }"
              @click="config.tipSoundType = 'voice'"
            >
              <text>语音</text>
            </view>
          </view>
        </view>

        <view class="sound-points">
          <text class="sound-label">提示音关键点（正式时间内）:</text>
          <view class="points-list">
            <view
              class="point-tag"
              v-for="(point, index) in config.tipSoundPoints"
              :key="index"
            >
              <text>{{ point }}秒</text>
              <text class="remove-point" @click="removePoint(index)">×</text>
            </view>
            <view class="add-point" @click="showAddPoint = true">
              <text>+ 添加</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="control-buttons" v-if="isRunning">
      <view class="ctrl-btn btn-reset" @click="resetTimer">
        <text>重置</text>
      </view>
      <view class="ctrl-btn btn-stop" @click="stopTimer">
        <text>停止</text>
      </view>
    </view>

    <!-- 预设选择弹窗 -->
    <Popup
      v-model:visible="showPresetPicker"
      title="选择预设"
      position="bottom"
      :showFooter="false"
    >
      <view class="preset-list">
        <view
          class="preset-item"
          :class="{ active: currentPreset.presetId === preset.presetId }"
          v-for="preset in presets"
          :key="preset.presetId"
          @click="selectPreset(preset)"
        >
          <view class="preset-info">
            <text class="preset-name">{{ preset.name }}</text>
            <text class="preset-desc">{{ getPresetDesc(preset) }}</text>
          </view>
        </view>
      </view>
    </Popup>

    <!-- 添加提示音关键点弹窗 -->
    <Popup
      v-model:visible="showAddPoint"
      title="添加提示音关键点"
      @confirm="confirmAddPoint"
    >
      <view class="add-point-form">
        <input
          class="point-input"
          type="number"
          v-model="newPoint"
          placeholder="请输入秒数"
        />
        <text class="point-unit">秒</text>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { getTimingPresets } from "@/utils/storage.js";
import {
  formatSeconds,
  getStageName,
  getNextStage,
  getStageDuration,
  getInitialStage,
  TIMING_STAGES,
} from "@/utils/timer.js";
import { getThemeColor } from "@/utils/theme.js";
import Popup from "@/components/common/Popup.vue";

// 主题色
const themeColor = ref(getThemeColor());

// 计时配置
const config = reactive({
  faultToleranceTime: 0,
  prepareTime: 10,
  formalTime: 180,
  restTime: 30,
  isCycle: false,
  cycleTimes: 0,
  tipSoundType: "sound",
  tipSoundPoints: [30, 10, 5],
});

// 计时状态
const isRunning = ref(false);
const isPaused = ref(false);
const currentStage = ref("prepare");
const remainingTime = ref(0);
const currentCycle = ref(1);

// 预设
const presets = ref([]);
const currentPreset = ref({});

// 弹窗状态
const showPresetPicker = ref(false);
const showAddPoint = ref(false);
const newPoint = ref("");

// 计时器
let timerInterval = null;
let audioContext = null;

// 计算属性
const startBtnText = computed(() => {
  if (!isRunning.value) return "开始计时";
  if (isPaused.value) return "继续";
  return "暂停";
});

const stageName = computed(() => {
  const names = {
    faultTolerance: "容错时间",
    prepare: "准备时间",
    formal: "正式时间",
    rest: "休息时间",
  };
  return names[currentStage.value] || currentStage.value;
});

const totalStageTime = computed(() => {
  return getStageDuration(currentStage.value, config);
});

const progressPercent = computed(() => {
  if (totalStageTime.value === 0) return 100;
  return (remainingTime.value / totalStageTime.value) * 100;
});

// 方法
const formatTime = (seconds) => formatSeconds(seconds);

const getPresetDesc = (preset) => {
  const c = preset.config;
  let desc = [];
  if (c.faultToleranceTime) desc.push(`容错${c.faultToleranceTime}秒`);
  if (c.prepareTime) desc.push(`准备${c.prepareTime}秒`);
  desc.push(`正式${c.formalTime}秒`);
  if (c.restTime) desc.push(`休息${c.restTime}秒`);
  if (c.isCycle) desc.push("循环");
  return desc.join(" + ");
};

// 选择预设
const selectPreset = (preset) => {
  currentPreset.value = preset;
  Object.assign(config, preset.config);
  showPresetPicker.value = false;
};

// 循环切换
const onCycleChange = (e) => {
  config.isCycle = e.detail.value;
};

// 添加提示音关键点
const confirmAddPoint = () => {
  const point = parseInt(newPoint.value);
  if (
    point > 0 &&
    point < config.formalTime &&
    !config.tipSoundPoints.includes(point)
  ) {
    config.tipSoundPoints.push(point);
    config.tipSoundPoints.sort((a, b) => b - a);
  }
  newPoint.value = "";
  showAddPoint.value = false;
};

// 移除提示音关键点
const removePoint = (index) => {
  config.tipSoundPoints.splice(index, 1);
};

// 播放提示音
const playSound = () => {
  try {
    // 使用uni.createInnerAudioContext播放提示音
    if (!audioContext) {
      audioContext = uni.createInnerAudioContext();
      audioContext.src = "/static/audio/beep.mp3";
    }
    audioContext.play();
  } catch (e) {
    console.log("播放提示音失败", e);
    // 备用方案：使用振动
    uni.vibrateShort();
  }
};

// 切换计时
const toggleTimer = () => {
  if (!isRunning.value) {
    startTimer();
  } else if (isPaused.value) {
    resumeTimer();
  } else {
    pauseTimer();
  }
};

// 开始计时
const startTimer = () => {
  // 验证正式时间
  if (!config.formalTime || config.formalTime <= 0) {
    uni.showToast({ title: "请设置正式时间", icon: "none" });
    return;
  }

  isRunning.value = true;
  isPaused.value = false;
  currentCycle.value = 1;

  // 设置初始阶段
  currentStage.value = getInitialStage(config);
  remainingTime.value = getStageDuration(currentStage.value, config);

  playSound(); // 开始提示音
  runTimer();
};

// 运行计时器
const runTimer = () => {
  timerInterval = setInterval(() => {
    remainingTime.value--;

    // 检查是否需要播放提示音
    if (
      currentStage.value === "formal" &&
      config.tipSoundPoints.includes(remainingTime.value)
    ) {
      playSound();
    }

    // 最后3秒倒计时提示
    if (remainingTime.value <= 3 && remainingTime.value > 0) {
      playSound();
    }

    // 阶段结束
    if (remainingTime.value <= 0) {
      playSound(); // 阶段结束提示音

      const nextStage = getNextStage(currentStage.value, config);

      if (nextStage) {
        currentStage.value = nextStage;
        remainingTime.value = getStageDuration(nextStage, config);
      } else if (config.isCycle) {
        // 循环
        currentCycle.value++;
        currentStage.value = config.prepareTime > 0 ? "prepare" : "formal";
        remainingTime.value = getStageDuration(currentStage.value, config);
      } else {
        // 结束
        stopTimer();
        uni.showToast({ title: "计时完成！", icon: "success" });
      }
    }
  }, 1000);
};

// 暂停计时
const pauseTimer = () => {
  isPaused.value = true;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// 继续计时
const resumeTimer = () => {
  isPaused.value = false;
  runTimer();
};

// 重置计时
const resetTimer = () => {
  pauseTimer();
  currentStage.value = getInitialStage(config);
  remainingTime.value = getStageDuration(currentStage.value, config);
  currentCycle.value = 1;
};

// 停止计时
const stopTimer = () => {
  isRunning.value = false;
  isPaused.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentStage.value = getInitialStage(config);
  remainingTime.value = getStageDuration(currentStage.value, config);
};

// 加载预设
const loadPresets = () => {
  presets.value = getTimingPresets();
  if (presets.value.length > 0) {
    selectPreset(presets.value[0]);
  }
};

onMounted(() => {
  loadPresets();
  remainingTime.value = config.prepareTime;
  // 监听主题色变化
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (audioContext) {
    audioContext.destroy();
  }
  uni.$off("themeColorChange");
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

  &.running {
    background-color: #ff9800;
  }

  &.paused {
    background-color: #2196f3;
  }
}

.btn-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 34rpx;
  color: #fff;
  font-weight: 500;
}

.stage-display {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.stage-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.stage-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.stage-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 12rpx;
}

.stage-name {
  font-size: 28rpx;
  color: #00c853;
  font-weight: 500;
  margin-right: 16rpx;

  &.faultTolerance {
    color: #ff9800;
  }

  &.prepare {
    color: #2196f3;
  }

  &.formal {
    color: v-bind(themeColor);
  }

  &.rest {
    color: #9c27b0;
  }
}

.stage-time {
  font-size: 24rpx;
  color: #999;
}

.progress-bar {
  height: 16rpx;
  background-color: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: v-bind(themeColor);
  transition: width 0.3s;
}

.config-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.preset-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
}

.preset-name {
  font-size: 28rpx;
  color: #333;
}

.select-icon {
  font-size: 24rpx;
  color: #999;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.input-row {
  display: flex;
  gap: 24rpx;
}

.input-group {
  flex: 1;

  &.full {
    flex: none;
    width: 100%;
  }
}

.input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;

  &.required::after {
    content: "*";
    color: #ff5252;
    margin-left: 4rpx;
  }
}

.input-field {
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;

  &.highlight {
    background-color: rgba(0, 200, 83, 0.1);
    border: 2rpx solid #00c853;
  }
}

.cycle-toggle {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.toggle-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.sound-settings {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.sound-type {
  display: flex;
  align-items: center;
}

.sound-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}

.type-options {
  display: flex;
  gap: 16rpx;
}

.type-option {
  padding: 12rpx 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 32rpx;

  &.active {
    border-color: v-bind(themeColor);
    background-color: v-bind('themeColor + "1A"');

    text {
      color: v-bind(themeColor);
    }
  }

  text {
    font-size: 26rpx;
    color: #666;
  }
}

.points-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.point-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #f0f0f0;
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    color: #666;
  }
}

.remove-point {
  margin-left: 8rpx;
  color: #ff5252 !important;
}

.add-point {
  padding: 8rpx 16rpx;
  border: 2rpx dashed v-bind(themeColor);
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    color: v-bind(themeColor);
  }
}

.control-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.ctrl-btn {
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

.btn-stop {
  background-color: #ff5252;

  text {
    color: #fff;
  }
}

.preset-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.preset-item {
  padding: 24rpx;
  border-bottom: 1px solid #f0f0f0;

  &.active {
    background-color: v-bind('themeColor + "1A"');
  }

  &:last-child {
    border-bottom: none;
  }
}

.preset-info {
  display: flex;
  flex-direction: column;
}

.preset-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.preset-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.add-point-form {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.point-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.point-unit {
  font-size: 26rpx;
  color: #666;
  margin-left: 12rpx;
}
</style>
