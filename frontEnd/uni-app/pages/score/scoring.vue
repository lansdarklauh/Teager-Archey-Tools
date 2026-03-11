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
        <text>设置</text>
      </view>
    </view>

    <!-- 计分组滑动与指示器 -->
    <view class="swiper-indicator" v-if="record.groupNum > 1">
      <scroll-view
        scroll-x
        class="indicator-scroll"
        :scroll-left="indicatorScrollLeft"
        scroll-with-animation
      >
        <view class="indicator-dots">
          <view
            class="indicator-dot"
            :class="{
              active: currentGroupIndex === index,
              completed: isGroupCompleted(index),
            }"
            v-for="(_, index) in record.groupNum"
            :key="index"
            @click="goToGroup(index)"
          ></view>
        </view>
      </scroll-view>
    </view>

    <!-- 计分组 swiper -->
    <swiper
      v-if="record.groupNum > 1"
      class="group-swiper"
      :current="currentGroupIndex"
      @change="onSwiperChange"
    >
      <swiper-item
        v-for="(_, g) in record.groupNum"
        :key="g"
        class="swiper-item"
      >
        <view class="score-area-wrap">
          <view class="score-header">
            <text class="group-title"
              >第{{ g + 1 }}组: {{ getGroupScoreByIndex(g) }}分</text
            >
            <text class="accumulate-score"
              >累计: {{ getAccumulateByGroup(g) }}分</text
            >
          </view>
          <view class="score-grid">
            <view
              class="score-cell"
              v-for="(score, index) in getScoresForGroup(g)"
              :key="index"
              @click="onScoreClickGroup(g, index)"
            >
              <view class="cell-index">{{ index + 1 }}.</view>
              <view
                class="cell-value"
                :class="[
                  getScoreClass(score),
                  {
                    active: currentGroupIndex === g && activeIndex === index,
                  },
                ]"
              >
                <text>{{ score || "" }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 单组时直接显示（无 swiper） -->
    <view class="score-area" v-else>
      <view class="score-header">
        <text class="group-title"
          >第{{ currentGroupIndex + 1 }}组: {{ currentGroupScore }}分</text
        >
        <text class="accumulate-score">累计: {{ accumulateScore }}分</text>
      </view>
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

    <!-- 多组时底部照片区（与当前组绑定） -->
    <view
      class="photo-area photo-area-bottom"
      v-if="record.groupNum > 1 && record.isTakePhoto"
    >
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

    <!-- 计时显示 -->
    <view class="timing-display" v-if="record.isTiming">
      <text class="timing-text"
        >准备{{ record.prepareTime }}秒 — 倒计时{{ record.formalTime }}秒</text
      >
      <text class="timing-remain" v-if="remainingTime >= 0"
        >剩余 {{ formatRemainTime(remainingTime) }}</text
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

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn btn-cancel" @click="onCancel">
        <text>放弃计分</text>
      </view>
      <view class="btn btn-save" @click="onSave">
        <text>{{ isLastGroup ? "完成" : "保存" }}</text>
      </view>
    </view>

    <!-- 上一组 / 下一组 -->
    <view class="nav-buttons" v-if="record.groupNum > 1">
      <view
        class="nav-btn"
        :class="{ disabled: currentGroupIndex <= 0 }"
        @click="prevGroup"
      >
        <text>上一组</text>
      </view>
      <view
        class="nav-btn"
        :class="{ disabled: currentGroupIndex >= record.groupNum - 1 }"
        @click="nextGroupBtn"
      >
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

    <!-- 设置弹窗（普通模式可重新设置选项） -->
    <Popup
      v-model:visible="showSettings"
      title="设置"
      position="bottom"
      :showFooter="true"
      @confirm="onSettingsConfirm"
      @cancel="showSettings = false"
    >
      <view class="settings-content" v-if="showSettings">
        <view class="settings-row">
          <text class="settings-label">弓种</text>
          <picker
            mode="selector"
            :range="bowTypes"
            range-key="label"
            :value="settingsBowIndex"
            @change="onSettingsBowChange"
          >
            <view class="settings-value">{{
              bowTypes[settingsBowIndex]?.label || ""
            }}</view>
          </picker>
        </view>
        <view class="settings-row">
          <text class="settings-label">距离</text>
          <picker
            mode="selector"
            :range="distances"
            range-key="label"
            :value="Math.max(0, settingsDistanceIndex)"
            @change="onSettingsDistanceChange"
          >
            <view class="settings-value">{{
              settingsDistanceIndex >= 0
                ? distances[settingsDistanceIndex]?.label
                : record.distance
            }}</view>
          </picker>
        </view>
        <view class="settings-row">
          <text class="settings-label">靶面</text>
          <picker
            mode="selector"
            :range="targetTypes"
            range-key="label"
            :value="settingsTargetIndex"
            @change="onSettingsTargetChange"
          >
            <view class="settings-value">{{
              targetTypes[settingsTargetIndex]?.label || ""
            }}</view>
          </picker>
        </view>
        <view class="settings-row" @click="showGroupPickerInSettings = true">
          <text class="settings-label">分组</text>
          <text class="settings-value"
            >{{ record.groupNum }}组 × {{ record.arrowNum }}箭</text
          >
        </view>
        <view class="settings-row switch-row">
          <text class="settings-label">是否11分</text>
          <switch
            :checked="record.is11Score"
            @change="onSettings11ScoreChange"
            :color="themeColor"
          />
        </view>
        <view class="settings-row switch-row">
          <text class="settings-label">是否报时</text>
          <switch
            :checked="record.isTiming"
            @change="onSettingsTimingChange"
            :color="themeColor"
          />
        </view>
        <view class="settings-row" v-if="record.isTiming">
          <text class="settings-label">准备时间(秒)</text>
          <input
            class="settings-input"
            type="number"
            v-model.number="record.prepareTime"
          />
        </view>
        <view class="settings-row" v-if="record.isTiming">
          <text class="settings-label">倒计时(秒)</text>
          <input
            class="settings-input"
            type="number"
            v-model.number="record.formalTime"
          />
        </view>
      </view>
    </Popup>

    <!-- 设置中的分组选择 -->
    <Popup
      v-model:visible="showGroupPickerInSettings"
      position="center"
      :showHeader="false"
      :showFooter="false"
    >
      <GroupPicker
        :defaultGroupNum="record.groupNum"
        :defaultArrowNum="record.arrowNum"
        :hasExistingData="groupScoreList.length > 0"
        @confirm="onSettingsGroupConfirm"
        @close="showGroupPickerInSettings = false"
      />
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import {
  getScoreRecordById,
  updateScoreRecord,
  addScoreRecord,
  getScoringCache,
  setScoringCache,
  clearScoringCache,
} from "@/utils/storage.js";
import {
  getBowTypeName,
  getTargetTypeName,
  calculateGroupScore,
  calculateAccumulateScore,
  createEmptyGroupScore,
  updateGroupScoreData,
  getFirstUnfilledArrowIndex,
  getGroupScores,
  isGroupFilled,
  getFirstUnfilledLocation,
  getNextUnfilledLocation,
  getPrevUnfilledLocation,
} from "@/utils/score.js";
import { BOW_TYPES, DISTANCES, TARGET_TYPES } from "@/utils/constants.js";
import { getThemeColor } from "@/utils/theme.js";
import ScoreKeyboard from "@/components/common/ScoreKeyboard.vue";

// 模块级：保存/放弃后即将 reLaunch 时置 true，避免 onUnmounted 时再次写入 scoringCache（解决卸载时序导致 ref 未生效）
let skipWriteCacheOnLeave = false;
import Popup from "@/components/common/Popup.vue";
import GroupPicker from "@/components/business/GroupPicker.vue";

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
const showGroupPickerInSettings = ref(false);

// 主题色
const themeColor = ref(getThemeColor());

// 选项数据（设置弹窗用）
const bowTypes = ref(BOW_TYPES);
const distances = ref(DISTANCES);
const targetTypes = ref(TARGET_TYPES);
const settingsBowIndex = computed(() =>
  bowTypes.value.findIndex((b) => b.value === record.bowType),
);
const settingsDistanceIndex = computed(() =>
  distances.value.findIndex((d) => d.value === record.distance),
);
const settingsTargetIndex = computed(() =>
  targetTypes.value.findIndex((t) => t.value === record.targetType),
);

// 指示器横向滚动位置（使当前组居中）
const indicatorScrollLeft = ref(0);

// 是否已主动清空缓存（完成/放弃时设为 true，onUnmounted 不再写回缓存）
const cacheIntentionallyCleared = ref(false);

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

// 获取分数样式类（与简易模式一致：X/10/9 黄，8/7 红，6/5 蓝，4/3 黑，2/1 白，M 灰）
const getScoreClass = (score) => {
  if (!score) return "";
  if (score === "X" || score === "10" || score === "9") return "score-yellow";
  if (score === "8" || score === "7") return "score-red";
  if (score === "6" || score === "5") return "score-blue";
  if (score === "4" || score === "3") return "score-black";
  if (score === "2" || score === "1") return "score-white";
  if (score === "M") return "score-gray";
  return "";
};

// 某组是否已全部填完
const isGroupCompleted = (groupIndex) => {
  return isGroupFilled(groupScoreList.value, groupIndex, record.arrowNum);
};

// 切换到指定组（保存当前组并加载目标组）
const goToGroup = (groupIndex) => {
  if (groupIndex === currentGroupIndex.value) return;
  saveCurrentGroup();
  currentGroupIndex.value = groupIndex;
  initCurrentGroup();
  updateIndicatorScroll();
};

// swiper 切换
const onSwiperChange = (e) => {
  const newIndex = e.detail.current;
  if (newIndex === currentGroupIndex.value) return;
  saveCurrentGroup();
  currentGroupIndex.value = newIndex;
  initCurrentGroup();
  updateIndicatorScroll();
};

// 多组时获取某组的分数列表（当前组用 currentScores 保证实时）
const getScoresForGroup = (g) => {
  if (g === currentGroupIndex.value) return currentScores.value;
  return getGroupScores(groupScoreList.value, g, record.arrowNum);
};

// 某组组内总分
const getGroupScoreByIndex = (g) => {
  const scores =
    g === currentGroupIndex.value
      ? currentScores.value
      : getGroupScores(groupScoreList.value, g, record.arrowNum);
  return calculateGroupScore(scores, record.is11Score);
};

// 到某组为止的累计分
const getAccumulateByGroup = (g) => {
  let total = 0;
  for (let i = 0; i <= g; i++) {
    total += getGroupScoreByIndex(i);
  }
  return total;
};

// 多组时点击某组的某个分数格
const onScoreClickGroup = (g, index) => {
  if (g !== currentGroupIndex.value) {
    saveCurrentGroup();
    currentGroupIndex.value = g;
    initCurrentGroup();
  }
  activeIndex.value = index;
  showKeyboard.value = true;
};

// 倒计时剩余时间格式化 mm:ss
const formatRemainTime = (seconds) => {
  if (seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 更新指示器滚动位置（当前组居中）
const updateIndicatorScroll = () => {
  const n = record.groupNum;
  const i = currentGroupIndex.value;
  const dotWidth = 40;
  indicatorScrollLeft.value = Math.max(0, i * dotWidth - 100);
};

// 上一组：从当前组往前找第一个有未填项的组，跳转并聚焦该组第一个未填项
const prevGroup = () => {
  if (currentGroupIndex.value <= 0) return;
  saveCurrentGroup();
  let targetG = -1;
  let arrowIndex = 0;
  for (let g = currentGroupIndex.value - 1; g >= 0; g--) {
    const scores = getGroupScores(groupScoreList.value, g, record.arrowNum);
    const firstUnfilled = getFirstUnfilledArrowIndex(scores);
    if (firstUnfilled >= 0) {
      targetG = g;
      arrowIndex = firstUnfilled;
      break;
    }
  }
  if (targetG < 0) {
    targetG = currentGroupIndex.value - 1;
    arrowIndex = 0;
  }
  currentGroupIndex.value = targetG;
  initCurrentGroup();
  activeIndex.value = arrowIndex;
  updateIndicatorScroll();
  showKeyboard.value = true;
};

// 下一组：从当前组往后找第一个有未填项的组，跳转并聚焦该组第一个未填项
const nextGroupBtn = () => {
  if (currentGroupIndex.value >= record.groupNum - 1) return;
  saveCurrentGroup();
  let targetG = -1;
  let arrowIndex = 0;
  for (let g = currentGroupIndex.value + 1; g < record.groupNum; g++) {
    const scores = getGroupScores(groupScoreList.value, g, record.arrowNum);
    const firstUnfilled = getFirstUnfilledArrowIndex(scores);
    if (firstUnfilled >= 0) {
      targetG = g;
      arrowIndex = firstUnfilled;
      break;
    }
  }
  if (targetG < 0) {
    targetG = currentGroupIndex.value + 1;
    arrowIndex = 0;
  }
  currentGroupIndex.value = targetG;
  initCurrentGroup();
  activeIndex.value = arrowIndex;
  updateIndicatorScroll();
  showKeyboard.value = true;
};

// 点击分数框
const onScoreClick = (index) => {
  activeIndex.value = index;
  showKeyboard.value = true;
};

// 键盘输入
const onKeyInput = (key) => {
  currentScores.value[activeIndex.value] = key.value;

  const isLastArrow = activeIndex.value >= record.arrowNum - 1;
  const currentGroupAllFilled =
    getFirstUnfilledArrowIndex(currentScores.value) < 0;
  const justFilledLast = isLastArrow && currentGroupAllFilled;

  if (justFilledLast && currentGroupIndex.value < record.groupNum - 1) {
    // 本组刚填完，自动跳到之后第一个没记完分的组的第一个未填项
    saveCurrentGroup();
    let targetG = -1;
    let arrowIndex = 0;
    for (let g = currentGroupIndex.value + 1; g < record.groupNum; g++) {
      const scores = getGroupScores(groupScoreList.value, g, record.arrowNum);
      const firstUnfilled = getFirstUnfilledArrowIndex(scores);
      if (firstUnfilled >= 0) {
        targetG = g;
        arrowIndex = firstUnfilled;
        break;
      }
    }
    if (targetG >= 0) {
      currentGroupIndex.value = targetG;
      initCurrentGroup();
      activeIndex.value = arrowIndex;
      updateIndicatorScroll();
    }
  } else if (activeIndex.value < record.arrowNum - 1) {
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
    accumulateScore.value - currentGroupScore.value,
  );
  groupData.groupPhotoList = [...currentPhotos.value.filter((p) => p)];

  const idx = currentGroupIndex.value;
  while (groupScoreList.value.length <= idx) {
    groupScoreList.value.push(null);
  }
  groupScoreList.value[idx] = groupData;

  // 写入计分缓存（意外退出可恢复，不加入首页计分列表）
  if (!cacheIntentionallyCleared.value) {
    setScoringCache({
      scoreRecordId: record.scoreRecordId,
      mode: mode.value,
      record: {
        ...record,
        groupScoreList: groupScoreList.value.map((g) => g && { ...g }),
        currentGroupIndex: currentGroupIndex.value,
      },
    });
  }

  // 更新记录
  const totalScore = groupScoreList.value.reduce(
    (sum, g) => sum + (g ? g.groupTotalScore || 0 : 0),
    0,
  );
  updateScoreRecord(record.scoreRecordId, {
    groupScoreList: groupScoreList.value,
    totalScore,
    currentGroupIndex: currentGroupIndex.value,
  });
};

// 保存按钮：先校验是否全部填完，未填完则跳转首个未填并弹窗
const onSave = () => {
  saveCurrentGroup();
  const firstUnfilled = getFirstUnfilledLocation(
    groupScoreList.value,
    record.groupNum,
    record.arrowNum,
  );
  if (firstUnfilled) {
    currentGroupIndex.value = firstUnfilled.groupIndex;
    initCurrentGroup();
    activeIndex.value = firstUnfilled.arrowIndex;
    updateIndicatorScroll();
    uni.showModal({
      title: "提示",
      content: "分数还存在缺失，请补充分数后再保存（未得分的记M）",
      showCancel: false,
      confirmText: "确定",
    });
    showKeyboard.value = true;
    return;
  }

  if (record.isTakePhoto && currentPhotos.value.filter((p) => p).length === 0) {
    showPhotoPrompt.value = true;
    return;
  }

  doSave();
};

// 执行保存（全部填完时：若记录未在首页列表中则 addScoreRecord，否则 updateScoreRecord）
const doSave = () => {
  saveCurrentGroup();

  if (isLastGroup.value) {
    const totalScore = groupScoreList.value.reduce(
      (sum, g) => sum + (g ? g.groupTotalScore || 0 : 0),
      0,
    );
    const existsInList = getScoreRecordById(record.scoreRecordId);
    if (!existsInList) {
      addScoreRecord({
        ...record,
        groupScoreList: groupScoreList.value.filter(Boolean),
        totalScore,
        isCompleted: true,
        updateTime: Date.now(),
      });
    } else {
      updateScoreRecord(record.scoreRecordId, {
        groupScoreList: groupScoreList.value.filter(Boolean),
        totalScore,
        isCompleted: true,
        updateTime: Date.now(),
      });
    }

    uni.showModal({
      title: "提示",
      content: "计分已保存",
      showCancel: false,
      confirmText: "确定",
      success: (res) => {
        if (res.confirm) {
          skipWriteCacheOnLeave = true;
          cacheIntentionallyCleared.value = true;
          clearScoringCache();
          uni.reLaunch({ url: "/pages/index/index" });
          uni.$emit("refreshScoreList");
        }
      },
    });
  } else {
    // 进入下一组（下一组第一个未填项）
    const nextG = currentGroupIndex.value + 1;
    const nextScores = getGroupScores(
      groupScoreList.value,
      nextG,
      record.arrowNum,
    );
    const firstUnfilled = getFirstUnfilledArrowIndex(nextScores);
    const arrowIndex = firstUnfilled >= 0 ? firstUnfilled : 0;
    currentGroupIndex.value = nextG;
    initCurrentGroup();
    activeIndex.value = arrowIndex;
    updateIndicatorScroll();
    showKeyboard.value = true;
  }
};

// 初始化当前组（用 getGroupScores 支持稀疏列表）
const initCurrentGroup = () => {
  currentScores.value = getGroupScores(
    groupScoreList.value,
    currentGroupIndex.value,
    record.arrowNum,
  );
  const existingGroup = groupScoreList.value[currentGroupIndex.value];
  if (existingGroup && existingGroup.groupPhotoList) {
    currentPhotos.value = [...existingGroup.groupPhotoList, "", "", ""].slice(
      0,
      3,
    );
  } else {
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

// 放弃计分（清缓存并回首页，禁止回上一页）
const onCancel = () => {
  uni.showModal({
    title: "提示",
    content: "确定要放弃本次计分吗？",
    success: (res) => {
      if (res.confirm) {
        skipWriteCacheOnLeave = true;
        saveCurrentGroup();
        cacheIntentionallyCleared.value = true;
        clearScoringCache();
        uni.reLaunch({ url: "/pages/index/index" });
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

// 加载记录数据（优先从列表取，无则从缓存取；保证 groupNum/arrowNum 有效并补齐 groupScoreList，避免计分框不显示）
const loadRecord = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options || currentPage.options || {};

  recordId.value = options.id || "";
  mode.value = options.mode || "normal";

  if (!recordId.value) return;

  let data = getScoreRecordById(recordId.value);
  const cache = getScoringCache();
  if (
    !data &&
    cache &&
    cache.scoreRecordId === recordId.value &&
    cache.record
  ) {
    data = cache.record;
  }
  if (!data) return;

  if (cache && cache.scoreRecordId === recordId.value && cache.record) {
    if (Array.isArray(cache.record.groupScoreList))
      data.groupScoreList = cache.record.groupScoreList;
    if (typeof cache.record.currentGroupIndex === "number")
      data.currentGroupIndex = cache.record.currentGroupIndex;
  }

  Object.assign(record, data);
  const groupNum = Math.max(1, Number(record.groupNum) || 6);
  const arrowNum = Math.max(1, Number(record.arrowNum) || 6);
  record.groupNum = groupNum;
  record.arrowNum = arrowNum;
  record.totalArrowNum = groupNum * arrowNum;

  groupScoreList.value = data.groupScoreList || [];
  while (groupScoreList.value.length < groupNum) {
    groupScoreList.value.push(
      createEmptyGroupScore(groupScoreList.value.length + 1, arrowNum),
    );
  }
  groupScoreList.value = groupScoreList.value.slice(0, groupNum);
  currentGroupIndex.value = Math.min(data.currentGroupIndex ?? 0, groupNum - 1);
  initCurrentGroup();
  resetTimer();

  const first = getFirstUnfilledLocation(
    groupScoreList.value,
    record.groupNum,
    record.arrowNum,
  );
  if (first) {
    currentGroupIndex.value = first.groupIndex;
    initCurrentGroup();
    activeIndex.value = first.arrowIndex;
  }
  updateIndicatorScroll();
};

// 设置弹窗：弓种/距离/靶面/分组变更
const onSettingsBowChange = (e) => {
  const i = e.detail.value;
  if (bowTypes.value[i]) record.bowType = bowTypes.value[i].value;
};
const onSettingsDistanceChange = (e) => {
  const i = e.detail.value;
  if (distances.value[i]) record.distance = distances.value[i].value;
};
const onSettingsTargetChange = (e) => {
  const i = e.detail.value;
  if (targetTypes.value[i]) record.targetType = targetTypes.value[i].value;
};
const onSettings11ScoreChange = (e) => {
  record.is11Score = e.detail.value;
};
const onSettingsTimingChange = (e) => {
  record.isTiming = e.detail.value;
};
// 普通模式设置中更换分组：参考简易模式，有数据时弹窗选择“清空”或“重新分配”；自定义模式沿用原逻辑
const onSettingsGroupConfirm = (data) => {
  const newGroupNum = data.groupNum || record.groupNum;
  const newArrowNum = data.arrowNum || record.arrowNum;
  if (newGroupNum === record.groupNum && newArrowNum === record.arrowNum) {
    showGroupPickerInSettings.value = false;
    return;
  }

  if (mode.value !== "normal") {
    record.groupNum = newGroupNum;
    record.arrowNum = newArrowNum;
    record.totalArrowNum = newGroupNum * newArrowNum;
    if (groupScoreList.value.length > newGroupNum) {
      groupScoreList.value = groupScoreList.value.slice(0, newGroupNum);
    }
    groupScoreList.value.forEach((g) => {
      if (g && g.arrowScoreList) {
        if (g.arrowScoreList.length > newArrowNum) {
          g.arrowScoreList = g.arrowScoreList.slice(0, newArrowNum);
        } else if (g.arrowScoreList.length < newArrowNum) {
          g.arrowScoreList = g.arrowScoreList.concat(
            new Array(newArrowNum - g.arrowScoreList.length).fill(""),
          );
        }
      }
    });
    if (currentGroupIndex.value >= newGroupNum) {
      currentGroupIndex.value = Math.max(0, newGroupNum - 1);
    }
    initCurrentGroup();
    updateIndicatorScroll();
    showGroupPickerInSettings.value = false;
    return;
  }

  const hasAnyScore = () => {
    return groupScoreList.value.some((g) =>
      ((g && g.arrowScoreList) || []).some(
        (s) => s !== "" && s != null && s !== undefined,
      ),
    );
  };

  if (!hasAnyScore()) {
    applyGroupConfigAndClear(newGroupNum, newArrowNum);
    showGroupPickerInSettings.value = false;
    return;
  }

  showGroupPickerInSettings.value = false;
  uni.showModal({
    title: "提示",
    content:
      "是否清空数据？\n\n选择【确定】：清空所有已填写的分数数据\n选择【取消】：自动分配分数到新分组（多出的箭分数会自动舍弃）",
    confirmText: "清空数据",
    cancelText: "重新分配",
    success: (res) => {
      if (res.confirm) {
        applyGroupConfigAndClear(newGroupNum, newArrowNum);
        uni.showToast({ title: "已清空数据", icon: "success" });
      } else if (res.cancel) {
        redistributeScoresInScoring(newGroupNum, newArrowNum);
        uni.showToast({ title: "已重新分配数据", icon: "success" });
      }
    },
  });
};

const applyGroupConfigAndClear = (newGroupNum, newArrowNum) => {
  record.groupNum = newGroupNum;
  record.arrowNum = newArrowNum;
  record.totalArrowNum = newGroupNum * newArrowNum;
  groupScoreList.value = [];
  for (let i = 0; i < newGroupNum; i++) {
    groupScoreList.value.push(createEmptyGroupScore(i + 1, newArrowNum));
  }
  currentGroupIndex.value = 0;
  initCurrentGroup();
  updateIndicatorScroll();
};

const redistributeScoresInScoring = (newGroupNum, newArrowNum) => {
  const allScores = [];
  groupScoreList.value.forEach((g) => {
    const list = (g && g.arrowScoreList) || [];
    list.forEach((s) => {
      if (s !== "" && s != null && s !== undefined) allScores.push(s);
    });
  });
  record.groupNum = newGroupNum;
  record.arrowNum = newArrowNum;
  record.totalArrowNum = newGroupNum * newArrowNum;
  const totalSlots = newGroupNum * newArrowNum;
  let scoreIndex = 0;
  let accumulate = 0;
  const newList = [];
  for (let i = 0; i < newGroupNum; i++) {
    const arrowScoreList = [];
    for (let j = 0; j < newArrowNum; j++) {
      arrowScoreList.push(
        scoreIndex < allScores.length ? allScores[scoreIndex++] : "",
      );
    }
    const groupData = updateGroupScoreData(
      createEmptyGroupScore(i + 1, newArrowNum),
      arrowScoreList,
      record.is11Score,
      accumulate,
    );
    accumulate += groupData.groupTotalScore;
    newList.push(groupData);
  }
  groupScoreList.value = newList;
  currentGroupIndex.value = 0;
  initCurrentGroup();
  updateIndicatorScroll();
  if (scoreIndex < allScores.length) {
    uni.showToast({
      title: `已舍弃${allScores.length - scoreIndex}支箭的分数`,
      icon: "none",
      duration: 2000,
    });
  }
};
const onSettingsConfirm = () => {
  updateScoreRecord(record.scoreRecordId, {
    bowType: record.bowType,
    distance: record.distance,
    targetType: record.targetType,
    groupNum: record.groupNum,
    arrowNum: record.arrowNum,
    totalArrowNum: record.totalArrowNum,
    is11Score: record.is11Score,
    isTiming: record.isTiming,
    prepareTime: record.prepareTime,
    formalTime: record.formalTime,
    groupScoreList: groupScoreList.value,
  });
  showSettings.value = false;
};

watch(
  currentGroupIndex,
  () => {
    updateIndicatorScroll();
  },
  { immediate: true },
);

// 页面卸载时写入缓存（意外退出可恢复）；若已主动完成/放弃则不写
const writeCacheOnLeave = () => {
  debugger;
  if (skipWriteCacheOnLeave || cacheIntentionallyCleared.value) return;
  if (!record.scoreRecordId) return;
  setScoringCache({
    scoreRecordId: record.scoreRecordId,
    mode: mode.value,
    record: {
      ...record,
      groupScoreList: groupScoreList.value.map((g) => g && { ...g }),
      currentGroupIndex: currentGroupIndex.value,
    },
  });
};

onMounted(() => {
  skipWriteCacheOnLeave = false; // 每次进入计分页重置，避免影响后续会话
  loadRecord();
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

onUnmounted(() => {
  writeCacheOnLeave();
  pauseTimer();
  uni.$off("themeColorChange");
});
</script>

<script>
// 普通模式计分页：禁止回到上一页，只能回首页
export default {
  onBackPress() {
    uni.reLaunch({ url: "/pages/index/index" });
    return true;
  },
};
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
  color: v-bind(themeColor);
  font-weight: 500;
}

.settings-btn {
  text {
    font-size: 26rpx;
    color: #666;
  }
}

.swiper-indicator {
  padding: 16rpx 0;
  background-color: #fff;
}

.indicator-scroll {
  white-space: nowrap;
  width: 100%;
}

.indicator-dots {
  display: inline-flex;
  justify-content: center;
  padding: 0 24rpx;
}

.indicator-dot {
  width: 32rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin: 0 8rpx;
  background-color: #ddd;
  flex-shrink: 0;

  &.completed {
    background-color: v-bind(themeColor);
  }

  &.active {
    background-color: v-bind(themeColor);
    width: 40rpx;
  }
}

.group-swiper {
  // height: 420rpx;
  margin: 16rpx 0;
}

.swiper-item {
  height: 100%;
  overflow-y: auto;
}

.score-area-wrap {
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin: 0 24rpx;
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
  margin-bottom: 8rpx;
}

.timing-remain {
  font-size: 32rpx;
  color: v-bind(themeColor);
  font-weight: 600;
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
  background-color: v-bind(themeColor);
  transition: width 0.3s;
}

.timing-controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
}

.control-btn {
  padding: 12rpx 48rpx;
  background-color: v-bind(themeColor);
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
  color: v-bind(themeColor);
  font-weight: 500;
}

.accumulate-score {
  font-size: 30rpx;
  color: v-bind(themeColor);
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
    border-color: v-bind(themeColor);
    box-shadow: 0 0 0 2rpx v-bind('themeColor + "33"');
  }

  text {
    font-size: 32rpx;
    font-weight: 500;
  }
}

.score-yellow {
  background-color: #ffd700 !important;
  border-color: #ffd700 !important;
  text {
    color: #333;
  }
}

.score-red {
  background-color: #ff0000 !important;
  border-color: #ff0000 !important;
  text {
    color: #fff;
  }
}

.score-blue {
  background-color: #2196f3 !important;
  border-color: #2196f3 !important;
  text {
    color: #fff;
  }
}

.score-black {
  background-color: #333 !important;
  border-color: #333 !important;
  text {
    color: #fff;
  }
}

.score-white {
  background-color: #fff !important;
  border-color: #333 !important;
  text {
    color: #333;
  }
}

.score-gray {
  background-color: #ccc !important;
  border-color: #ccc !important;
  text {
    color: #666;
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
  bottom: calc(24rpx + env(safe-area-inset-bottom));
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
  background-color: v-bind(themeColor);

  text {
    color: #fff;
  }
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  padding: 0 24rpx;
  margin-top: 16rpx;
}

.nav-btn {
  padding: 16rpx 48rpx;
  border: 2rpx solid v-bind(themeColor);
  border-radius: 32rpx;

  text {
    font-size: 26rpx;
    color: v-bind(themeColor);
  }

  &.disabled {
    opacity: 0.5;
    border-color: #ccc;

    text {
      color: #999;
    }
  }
}

.photo-prompt {
  padding: 24rpx 0;

  text {
    font-size: 28rpx;
    color: #666;
  }
}

.settings-content {
  padding: 24rpx 0;
  max-height: 60vh;
  overflow-y: auto;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &.switch-row {
    border-bottom: none;
  }
}

.settings-label {
  font-size: 28rpx;
  color: #333;
}

.settings-value {
  font-size: 28rpx;
  color: #666;
}

.settings-input {
  width: 120rpx;
  text-align: right;
  font-size: 28rpx;
}

.photo-area-bottom {
  margin: 16rpx 24rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}
</style>
