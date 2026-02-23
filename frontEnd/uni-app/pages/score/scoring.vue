<template>
  <view class="page-container">
    <!-- 顶部信息栏 -->
    <view class="info-bar">
      <view class="info-item">
        <text class="info-icon">🏹</text>
        <text class="info-text">{{ getBowLabel(record.bowType) }}</text>
      </view>
      <view class="info-item">
        <text class="info-icon">📏</text>
        <text class="info-text">{{ record.distance }}</text>
      </view>
      <view class="info-item">
        <text class="info-icon">🎯</text>
        <text class="info-text">{{ getTargetLabel(record.targetType) }}</text>
      </view>
    </view>

    <view class="sub-info-bar">
      <view class="sub-info">
        <text class="info-icon">📊</text>
        <text class="info-text"
          >{{ record.groupNum }}组/{{ record.arrowNum }}箭（共{{
            record.totalArrowNum
          }}箭）</text
        >
      </view>
      <text class="score-mode">{{ record.is11Score ? "11分" : "10分" }}</text>
      <view class="settings-btn" @click="showSettings = true">
        <text>设置 ></text>
      </view>
    </view>

    <!-- 滑动指示器 -->
    <view class="swiper-indicator" v-if="record.groupNum > 1">
      <view
        class="indicator-dot"
        :class="{ active: currentGroupIndex === index }"
        v-for="(_, index) in record.groupNum"
        :key="index"
      ></view>
    </view>

    <!-- 计时显示 -->
    <view class="timing-display" v-if="record.isTiming">
      <text class="timing-text"
        >准备{{ record.prepareTime }}秒 — 倒计时{{ record.formalTime }}秒</text
      >
      <view class="timing-progress">
        <view
          class="progress-bar"
          :style="{ width: timerProgress + '%' }"
        ></view>
      </view>
      <view class="timing-controls">
        <view class="control-btn" @click="resetTimer">
          <text>重置</text>
        </view>
        <view
          class="control-btn btn-start"
          @click="toggleTimer"
          v-if="!timerRunning"
        >
          <text>开始</text>
        </view>
        <view class="control-btn btn-pause" @click="toggleTimer" v-else>
          <text>暂停</text>
        </view>
      </view>
    </view>

    <!-- 分数显示区 -->
    <view class="score-area">
      <view class="score-header">
        <text class="group-title"
          >第{{ currentGroupIndex + 1 }}组: {{ currentGroupScore }}分</text
        >
        <text class="accumulate-score">累计: {{ accumulateScore }}分</text>
      </view>

      <!-- 分数输入网格 -->
      <view class="score-grid">
        <view
          class="score-cell"
          v-for="(score, index) in currentScores"
          :key="index"
          @click="onScoreClick(index)"
        >
          <view class="cell-index">{{ index + 1 }}.</view>
          <view
            class="cell-value"
            :class="[getScoreClass(score), { active: activeIndex === index }]"
          >
            <text>{{ score || "" }}</text>
          </view>
        </view>
      </view>

      <!-- 照片区域 -->
      <view class="photo-area" v-if="record.isTakePhoto">
        <view
          class="photo-item"
          v-for="(photo, index) in currentPhotos"
          :key="index"
        >
          <image
            v-if="photo"
            :src="photo"
            mode="aspectFill"
            @click="previewPhoto(photo)"
          />
          <view v-else class="photo-add" @click="addPhoto">
            <text>+</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn btn-cancel" @click="onCancel">
        <text>放弃计分</text>
      </view>
      <view class="btn btn-save" @click="onSave">
        <text>{{ isLastGroup ? "完成" : "保存" }}</text>
      </view>
    </view>

    <!-- 下一组按钮 -->
    <view
      class="nav-buttons"
      v-if="
        currentGroupIndex < record.groupNum - 1 &&
        groupScoreList.length > currentGroupIndex
      "
    >
      <view class="nav-btn" @click="nextGroup">
        <text>下一组</text>
      </view>
    </view>

    <!-- 九宫格键盘 -->
    <ScoreKeyboard
      :visible="showKeyboard"
      :title="`第${activeIndex + 1}箭`"
      @input="onKeyInput"
      @delete="onKeyDelete"
      @done="onKeyDone"
      @close="showKeyboard = false"
    />

    <!-- 拍照提示弹窗 -->
    <Popup
      v-model:visible="showPhotoPrompt"
      title="是否拍照记录?"
      @confirm="onPhotoConfirm"
      @cancel="onPhotoCancel"
      cancelText="跳过"
      confirmText="拍照"
    >
      <view class="photo-prompt">
        <text>记录本组射箭靶面，最多3张</text>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { getScoreRecordById, updateScoreRecord } from "@/utils/storage.js";
import {
  getBowTypeName,
  getTargetTypeName,
  calculateGroupScore,
  calculateAccumulateScore,
  createEmptyGroupScore,
  updateGroupScoreData,
  isAllScoresFilled,
} from "@/utils/score.js";
import ScoreKeyboard from "@/components/common/ScoreKeyboard.vue";
import Popup from "@/components/common/Popup.vue";

// 获取页面参数
const recordId = ref("");
const mode = ref("normal");

// 记录数据
const record = reactive({
  scoreRecordId: "",
  bowType: "americanHuntingBow",
  distance: "30m",
  targetType: "80Full",
  groupNum: 6,
  arrowNum: 6,
  totalArrowNum: 36,
  is11Score: false,
  isTakePhoto: false,
  isTiming: false,
  prepareTime: 10,
  formalTime: 120,
});

// 计分数据
const groupScoreList = ref([]);
const currentGroupIndex = ref(0);
const currentScores = ref([]);
const currentPhotos = ref([]);
const activeIndex = ref(0);

// UI状态
const showKeyboard = ref(false);
const showSettings = ref(false);
const showPhotoPrompt = ref(false);

// 计时相关
const timerRunning = ref(false);
const timerProgress = ref(100);
const remainingTime = ref(0);
let timerInterval = null;

// 计算属性
const currentGroupScore = computed(() => {
  return calculateGroupScore(currentScores.value, record.is11Score);
});

const accumulateScore = computed(() => {
  let total = 0;
  groupScoreList.value.forEach((group, index) => {
    if (index < currentGroupIndex.value) {
      total += group.groupTotalScore || 0;
    }
  });
  return total + currentGroupScore.value;
});

const isLastGroup = computed(() => {
  return currentGroupIndex.value === record.groupNum - 1;
});

// 获取弓种名称
const getBowLabel = (value) => {
  return getBowTypeName(value);
};

// 获取靶面名称
const getTargetLabel = (value) => {
  return getTargetTypeName(value);
};

// 获取分数样式类
const getScoreClass = (score) => {
  if (!score) return "";
  if (score === "X" || score === "10") return "score-gold";
  if (score === "9" || score === "8") return "score-red";
  if (score === "7" || score === "6") return "score-blue";
  if (score === "M") return "score-miss";
  return "score-default";
};

// 点击分数框
const onScoreClick = (index) => {
  activeIndex.value = index;
  showKeyboard.value = true;
};

// 键盘输入
const onKeyInput = (key) => {
  currentScores.value[activeIndex.value] = key.value;

  // 自动跳转到下一个
  if (activeIndex.value < record.arrowNum - 1) {
    activeIndex.value++;
  }
};

// 键盘删除
const onKeyDelete = () => {
  currentScores.value[activeIndex.value] = "";
};

// 键盘完成
const onKeyDone = () => {
  showKeyboard.value = false;
};

// 添加照片
const addPhoto = () => {
  uni.chooseImage({
    count: 3 - currentPhotos.value.filter((p) => p).length,
    sourceType: ["album", "camera"],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        const emptyIndex = currentPhotos.value.findIndex((p) => !p);
        if (emptyIndex > -1) {
          currentPhotos.value[emptyIndex] = path;
        }
      });
    },
  });
};

// 预览照片
const previewPhoto = (photo) => {
  uni.previewImage({
    urls: currentPhotos.value.filter((p) => p),
    current: photo,
  });
};

// 保存当前组
const saveCurrentGroup = () => {
  const groupData = updateGroupScoreData(
    createEmptyGroupScore(currentGroupIndex.value + 1, record.arrowNum),
    [...currentScores.value],
    record.is11Score,
    accumulateScore.value - currentGroupScore.value
  );
  groupData.groupPhotoList = [...currentPhotos.value.filter((p) => p)];

  if (groupScoreList.value[currentGroupIndex.value]) {
    groupScoreList.value[currentGroupIndex.value] = groupData;
  } else {
    groupScoreList.value.push(groupData);
  }

  // 更新记录
  const totalScore = groupScoreList.value.reduce(
    (sum, g) => sum + g.groupTotalScore,
    0
  );
  updateScoreRecord(record.scoreRecordId, {
    groupScoreList: groupScoreList.value,
    totalScore,
    currentGroupIndex: currentGroupIndex.value,
  });
};

// 保存按钮
const onSave = () => {
  // 检查是否填写完整
  if (!isAllScoresFilled(currentScores.value)) {
    uni.showToast({ title: "请填写完整分数", icon: "none" });
    return;
  }

  // 如果开启拍照且还没拍照，提示是否拍照
  if (record.isTakePhoto && currentPhotos.value.filter((p) => p).length === 0) {
    showPhotoPrompt.value = true;
    return;
  }

  doSave();
};

// 执行保存
const doSave = () => {
  saveCurrentGroup();

  if (isLastGroup.value) {
    // 完成计分
    updateScoreRecord(record.scoreRecordId, {
      isCompleted: true,
      updateTime: Date.now(),
    });

    uni.showToast({ title: "计分完成", icon: "success" });

    setTimeout(() => {
      uni.navigateBack();
      uni.$emit("refreshScoreList");
    }, 1500);
  } else {
    // 进入下一组
    nextGroup();
  }
};

// 下一组
const nextGroup = () => {
  saveCurrentGroup();
  currentGroupIndex.value++;
  initCurrentGroup();
  resetTimer();
};

// 初始化当前组
const initCurrentGroup = () => {
  const existingGroup = groupScoreList.value[currentGroupIndex.value];
  if (existingGroup) {
    currentScores.value = [...existingGroup.arrowScoreList];
    currentPhotos.value = [...existingGroup.groupPhotoList, "", "", ""].slice(
      0,
      3
    );
  } else {
    currentScores.value = new Array(record.arrowNum).fill("");
    currentPhotos.value = ["", "", ""];
  }
  activeIndex.value = 0;
};

// 拍照确认
const onPhotoConfirm = () => {
  showPhotoPrompt.value = false;
  addPhoto();
};

// 跳过拍照
const onPhotoCancel = () => {
  showPhotoPrompt.value = false;
  doSave();
};

// 放弃计分
const onCancel = () => {
  uni.showModal({
    title: "提示",
    content: "确定要放弃本次计分吗？已录入的数据将被保存。",
    success: (res) => {
      if (res.confirm) {
        saveCurrentGroup();
        uni.navigateBack();
        uni.$emit("refreshScoreList");
      }
    },
  });
};

// 计时器相关
const toggleTimer = () => {
  if (timerRunning.value) {
    pauseTimer();
  } else {
    startTimer();
  }
};

const startTimer = () => {
  if (remainingTime.value <= 0) {
    remainingTime.value = record.prepareTime + record.formalTime;
  }
  timerRunning.value = true;
  timerInterval = setInterval(() => {
    remainingTime.value--;
    timerProgress.value =
      (remainingTime.value / (record.prepareTime + record.formalTime)) * 100;

    if (remainingTime.value <= 0) {
      pauseTimer();
      // 播放提示音
      uni.showToast({ title: "时间到！", icon: "none" });
    }
  }, 1000);
};

const pauseTimer = () => {
  timerRunning.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetTimer = () => {
  pauseTimer();
  remainingTime.value = record.prepareTime + record.formalTime;
  timerProgress.value = 100;
};

// 加载记录数据
const loadRecord = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options || currentPage.options || {};

  recordId.value = options.id || "";
  mode.value = options.mode || "normal";

  if (recordId.value) {
    const data = getScoreRecordById(recordId.value);
    if (data) {
      Object.assign(record, data);
      groupScoreList.value = data.groupScoreList || [];
      currentGroupIndex.value = data.currentGroupIndex || 0;
      initCurrentGroup();
      resetTimer();
    }
  }
};

onMounted(() => {
  loadRecord();
});

onUnmounted(() => {
  pauseTimer();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 300rpx;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.info-text {
  font-size: 26rpx;
  color: #333;
}

.sub-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background-color: #fff;
}

.sub-info {
  display: flex;
  align-items: center;
}

.score-mode {
  font-size: 26rpx;
  color: #00c853;
  font-weight: 500;
}

.settings-btn {
  text {
    font-size: 26rpx;
    color: #666;
  }
}

.swiper-indicator {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
  background-color: #fff;
}

.indicator-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ddd;
  margin: 0 8rpx;

  &.active {
    background-color: #00c853;
    width: 32rpx;
    border-radius: 8rpx;
  }
}

.timing-display {
  padding: 24rpx;
  background-color: #fff;
  margin-top: 16rpx;
}

.timing-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.timing-progress {
  height: 16rpx;
  background-color: #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 100%;
  background-color: #00c853;
  transition: width 0.3s;
}

.timing-controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
}

.control-btn {
  padding: 12rpx 48rpx;
  background-color: #00c853;
  border-radius: 32rpx;

  text {
    font-size: 26rpx;
    color: #fff;
  }

  &.btn-pause {
    background-color: #ff9800;
  }
}

.score-area {
  margin: 16rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #f0f0f0;
}

.group-title {
  font-size: 30rpx;
  color: #00c853;
  font-weight: 500;
}

.accumulate-score {
  font-size: 30rpx;
  color: #00c853;
  font-weight: 500;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.score-cell {
  display: flex;
  align-items: center;
}

.cell-index {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
  width: 40rpx;
}

.cell-value {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;

  &.active {
    border-color: #00c853;
    box-shadow: 0 0 0 2rpx rgba(0, 200, 83, 0.2);
  }

  text {
    font-size: 32rpx;
    font-weight: 500;
  }
}

.score-gold {
  background-color: #ffd700 !important;
  text {
    color: #333;
  }
}

.score-red {
  background-color: #ff0000 !important;
  text {
    color: #fff;
  }
}

.score-blue {
  background-color: #2196f3 !important;
  text {
    color: #fff;
  }
}

.score-miss {
  background-color: #ccc !important;
  text {
    color: #fff;
  }
}

.score-default {
  background-color: #f9f9f9 !important;
  text {
    color: #333;
  }
}

.photo-area {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid #f0f0f0;
}

.photo-item {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }
}

.photo-add {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 48rpx;
    color: #ccc;
  }
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  position: fixed;
  bottom: 220rpx;
  left: 0;
  right: 0;
  background-color: #fff;
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

.btn-cancel {
  background-color: #fff;
  border: 2rpx solid #ff5252;

  text {
    color: #ff5252;
  }
}

.btn-save {
  background-color: #00c853;

  text {
    color: #fff;
  }
}

.nav-buttons {
  display: flex;
  justify-content: flex-end;
  padding: 0 24rpx;
  margin-top: 16rpx;
}

.nav-btn {
  padding: 16rpx 48rpx;
  border: 2rpx solid #00c853;
  border-radius: 32rpx;

  text {
    font-size: 26rpx;
    color: #00c853;
  }
}

.photo-prompt {
  padding: 24rpx 0;

  text {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
