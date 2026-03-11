<template>
  <view class="page-container" @click="onPageClick">
    <!-- 顶部配置栏 -->
    <view class="config-bar">
      <view class="config-item" @click="showBowPicker = true">
        <text class="config-icon">🏹</text>
        <text class="config-text">{{ getBowLabel(config.bowType) }}</text>
      </view>
      <view class="config-item" @click="showDistancePicker = true">
        <text class="config-icon">📏</text>
        <text class="config-text">{{ config.distance }}</text>
      </view>
      <view class="config-item" @click="showTargetPicker = true">
        <text class="config-icon">🎯</text>
        <text class="config-text">{{ getTargetLabel(config.targetType) }}</text>
      </view>
    </view>

    <view class="sub-config-bar">
      <view class="config-item" @click="showGroupPicker = true">
        <text class="config-icon">📊</text>
        <text class="config-text"
          >{{ config.groupNum }}组/{{ config.arrowNum }}箭（共{{
            config.groupNum * config.arrowNum
          }}箭）</text
        >
      </view>
      <view class="score-mode-switch">
        <text class="mode-label">11分</text>
        <switch
          :checked="config.is11Score"
          @change="onIs11ScoreChange"
          :color="themeColor"
        />
      </view>
    </view>

    <!-- 分数区域 -->
    <scroll-view
      class="score-sections"
      :class="{ 'keyboard-active': showKeyboard }"
      scroll-y
      :scroll-into-view="scrollToView"
    >
      <view
        class="score-section"
        v-for="(group, groupIndex) in groupScoreList"
        :key="group.id"
        :id="'group-' + groupIndex"
      >
        <view class="section-header">
          <view class="section-title-wrapper">
            <text class="section-title"
              >第{{ groupIndex + 1 }}组: {{ group.groupTotalScore }}分</text
            >
          </view>
          <text class="section-accumulate"
            >累计: {{ group.accumulateScore }}分</text
          >
        </view>

        <!-- 移动和删除按钮区域 -->
        <view class="group-actions" v-if="groupScoreList.length > 1">
          <!-- 删除按钮 -->
          <view class="action-btn delete-btn" @click="deleteGroup(groupIndex)">
            <text>删除</text>
          </view>
          <!-- 移动按钮 -->
          <view class="move-buttons">
            <view
              class="move-btn"
              @click="moveGroupUp(groupIndex)"
              v-if="groupIndex > 0"
            >
              <text>↑</text>
            </view>
            <view
              class="move-btn"
              @click="moveGroupDown(groupIndex)"
              v-if="groupIndex < groupScoreList.length - 1"
            >
              <text>↓</text>
            </view>
          </view>
        </view>

        <view class="score-grid">
          <view
            class="score-cell"
            v-for="(score, scoreIndex) in group.arrowScoreList"
            :key="scoreIndex"
            @click.stop="onScoreClick(groupIndex, scoreIndex)"
          >
            <view class="cell-index">{{ scoreIndex + 1 }}.</view>
            <view
              class="cell-value"
              :class="[
                getScoreClass(score),
                {
                  active:
                    activeGroup === groupIndex && activeIndex === scoreIndex,
                },
              ]"
            >
              <text>{{ score || "" }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn btn-cancel" @click="onCancel">
        <text>放弃计分</text>
      </view>
      <view
        class="btn btn-add"
        @click="handleAddOrSave"
      >
        <text>{{ isAtMaxGroups ? "保存" : "增加一组" }}</text>
      </view>
    </view>

    <!-- 九宫格键盘 -->
    <ScoreKeyboard
      :visible="showKeyboard"
      :title="`第${activeGroup + 1}组 第${activeIndex + 1}箭`"
      @input="onKeyInput"
      @delete="onKeyDelete"
      @done="onKeyDone"
      @close="showKeyboard = false"
    />

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
      :showFooter="false"
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
      title="选择分组"
      position="bottom"
      :showFooter="false"
    >
      <view class="picker-options">
        <view
          class="picker-option"
          :class="{ active: isPresetActive(preset) }"
          v-for="preset in groupPresets"
          :key="preset.label"
          @click="selectGroupPreset(preset)"
        >
          <text>{{ preset.label }}</text>
        </view>
      </view>
    </Popup>

    <!-- 完成确认弹窗 -->
    <Popup
      v-model:visible="showCompleteConfirm"
      title="完成计分"
      @confirm="doComplete"
      @cancel="showCompleteConfirm = false"
    >
      <view class="complete-info">
        <text class="complete-text">总分: {{ totalScore }}分</text>
        <text class="complete-text"
          >共{{ groupScoreList.length }}组 {{ totalArrows }}箭</text
        >
        <text class="complete-hint">确定要完成本次计分吗？</text>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";
import {
  BOW_TYPES,
  DISTANCES,
  TARGET_TYPES,
  GROUP_ARROW_PRESETS,
} from "@/utils/constants.js";
import {
  getBowTypeName,
  getTargetTypeName,
  calculateGroupScore,
  generateId,
  getFirstUnfilledScoreLocation,
} from "@/utils/score.js";
import {
  addScoreRecord,
  getScoringCache,
  setScoringCache,
  clearScoringCache,
} from "@/utils/storage.js";
import { getThemeColor } from "@/utils/theme.js";
import ScoreKeyboard from "@/components/common/ScoreKeyboard.vue";
import Popup from "@/components/common/Popup.vue";

// 模块级：完成/放弃后即将 reLaunch 时置 true，避免 onUnmounted 时再次写入 scoringCache
let skipWriteCacheOnLeave = false;

// 主题色
const themeColor = ref(getThemeColor());
const currentThemeColor = computed(() => themeColor.value);

// 配置
const config = reactive({
  bowType: "americanHuntingBow",
  distance: "30m",
  targetType: "80Full",
  groupNum: 6,
  arrowNum: 6,
  is11Score: false,
});

// 选项数据
const bowTypes = ref(BOW_TYPES);
const distances = ref(DISTANCES);
const targetTypes = ref(TARGET_TYPES);
const groupPresets = ref(GROUP_ARROW_PRESETS);

// 弹窗状态
const showBowPicker = ref(false);
const showDistancePicker = ref(false);
const showTargetPicker = ref(false);
const showGroupPicker = ref(false);
const showCompleteConfirm = ref(false);

// 分数数据
const groupScoreList = ref([]);
const activeGroup = ref(0);
const activeIndex = ref(0);
const showKeyboard = ref(false);
const scrollToView = ref("");

// 用于生成唯一ID
let groupIdCounter = 0;

// 计算属性
const totalScore = computed(() => {
  return groupScoreList.value.reduce((sum, g) => sum + g.groupTotalScore, 0);
});

const totalArrows = computed(() => {
  return groupScoreList.value.reduce(
    (sum, g) => sum + g.arrowScoreList.filter((s) => s !== "").length,
    0
  );
});

// 是否已达到最大组数
const isAtMaxGroups = computed(
  () => groupScoreList.value.length >= config.groupNum
);

// 检查一组是否填满
const isGroupFilled = (groupIndex) => {
  const group = groupScoreList.value[groupIndex];
  if (!group) return false;
  return group.arrowScoreList.every((score) => score !== "");
};

// 检查是否需要自动添加新组
const checkAutoAddGroup = () => {
  // 检查是否已达到配置的组数上限
  if (groupScoreList.value.length >= config.groupNum) {
    return;
  }
  const lastGroup = groupScoreList.value[groupScoreList.value.length - 1];
  if (lastGroup && isGroupFilled(groupScoreList.value.length - 1)) {
    // 最后一组已填满，自动添加新组
    addEmptyGroup();
    // 滚动到新组
    nextTick(() => {
      scrollToView.value = "group-" + (groupScoreList.value.length - 1);
    });
  }
};

// 获取弓种名称
const getBowLabel = (value) => getBowTypeName(value);

// 获取靶面名称
const getTargetLabel = (value) => getTargetTypeName(value);

// 检查预设是否激活
const isPresetActive = (preset) => {
  return (
    config.groupNum === preset.groupNum && config.arrowNum === preset.arrowNum
  );
};

// 选择弓种
const selectBow = (bow) => {
  config.bowType = bow.value;
  showBowPicker.value = false;
};

// 选择距离
const selectDistance = (d) => {
  config.distance = d.value;
  showDistancePicker.value = false;
};

// 选择靶面
const selectTarget = (t) => {
  config.targetType = t.value;
  showTargetPicker.value = false;
};

// 选择分组预设
const selectGroupPreset = (preset) => {
  // 如果配置没有变化，直接关闭
  if (
    config.groupNum === preset.groupNum &&
    config.arrowNum === preset.arrowNum
  ) {
    showGroupPicker.value = false;
    return;
  }

  // 检查是否有已填写的分数
  if (!hasAnyScore()) {
    // 没有数据，直接更新配置并重新初始化
    config.groupNum = preset.groupNum;
    config.arrowNum = preset.arrowNum;
    showGroupPicker.value = false;
    initGroups();
  } else {
    // 有数据，弹窗确认
    showGroupPicker.value = false;
    uni.showModal({
      title: "提示",
      content:
        "是否清空数据？\n\n选择【确定】：清空所有已填写的分数数据\n选择【取消】：自动分配分数到新分组（多出的箭分数会自动舍弃）",
      confirmText: "清空数据",
      cancelText: "重新分配",
      success: (res) => {
        if (res.confirm) {
          // 用户选择清空数据
          config.groupNum = preset.groupNum;
          config.arrowNum = preset.arrowNum;
          initGroups();
          uni.showToast({ title: "已清空数据", icon: "success" });
        } else if (res.cancel) {
          // 用户选择重新分配数据
          redistributeScores(preset.groupNum, preset.arrowNum);
          uni.showToast({ title: "已重新分配数据", icon: "success" });
        }
      },
    });
  }
};

// 是否有任何分数
const hasAnyScore = () => {
  return groupScoreList.value.some((group) =>
    group.arrowScoreList.some((score) => score !== "")
  );
};

// 重新分配分数数据
const redistributeScores = (newGroupNum, newArrowNum) => {
  // 1. 收集所有已填写的分数（按顺序）
  const allScores = [];
  groupScoreList.value.forEach((group) => {
    group.arrowScoreList.forEach((score) => {
      if (score !== "") {
        allScores.push(score);
      }
    });
  });

  // 2. 更新配置
  config.groupNum = newGroupNum;
  config.arrowNum = newArrowNum;

  // 3. 清空现有分组
  groupScoreList.value = [];
  groupIdCounter = 0;

  // 4. 根据新配置重新分配分数
  const totalNewArrows = newGroupNum * newArrowNum;
  let scoreIndex = 0;

  for (let i = 0; i < newGroupNum; i++) {
    groupIdCounter++;
    const arrowScoreList = [];

    for (let j = 0; j < newArrowNum; j++) {
      if (scoreIndex < allScores.length) {
        arrowScoreList.push(allScores[scoreIndex]);
        scoreIndex++;
      } else {
        arrowScoreList.push("");
      }
    }

    groupScoreList.value.push({
      id: "group_" + groupIdCounter,
      groupIndex: i + 1,
      arrowScoreList: arrowScoreList,
      groupTotalScore: 0,
      accumulateScore: 0,
      xCount: 0,
      tenCount: 0,
      missCount: 0,
    });
  }

  // 5. 重新计算所有分数
  recalculateAllScores();

  // 6. 如果有多余的分数，提示用户
  if (scoreIndex < allScores.length) {
    const discardedCount = allScores.length - scoreIndex;
    uni.showToast({
      title: `已舍弃${discardedCount}支箭的分数`,
      icon: "none",
      duration: 2000,
    });
  }
};

// 初始化分组（只创建第一组）
const initGroups = () => {
  groupScoreList.value = [];
  addEmptyGroup();
};

// 添加空白组
const addEmptyGroup = () => {
  groupIdCounter++;
  groupScoreList.value.push({
    id: "group_" + groupIdCounter,
    groupIndex: groupScoreList.value.length + 1,
    arrowScoreList: new Array(config.arrowNum).fill(""),
    groupTotalScore: 0,
    accumulateScore: 0,
    xCount: 0,
    tenCount: 0,
    missCount: 0,
  });
};

// 增加一组或保存（根据是否达到最大组数）
const handleAddOrSave = () => {
  if (isAtMaxGroups.value) {
    onSaveClick();
  } else {
    addGroupManual();
  }
};

// 手动添加组
const addGroupManual = () => {
  // 检查是否已达到配置的组数上限
  if (groupScoreList.value.length >= config.groupNum) {
    uni.showToast({
      title: `已达到设置的${config.groupNum}组上限`,
      icon: "none",
    });
    return;
  }
  addEmptyGroup();
  // 滚动到新组
  nextTick(() => {
    scrollToView.value = "group-" + (groupScoreList.value.length - 1);
  });
};

// 删除组
const deleteGroup = (groupIndex) => {
  if (groupScoreList.value.length <= 1) {
    uni.showToast({ title: "至少保留一组", icon: "none" });
    return;
  }

  uni.showModal({
    title: "确认删除",
    content: `确定要删除第${groupIndex + 1}组吗？`,
    success: (res) => {
      if (res.confirm) {
        groupScoreList.value.splice(groupIndex, 1);
        recalculateAllScores();

        // 调整激活的组索引
        if (activeGroup.value >= groupScoreList.value.length) {
          activeGroup.value = groupScoreList.value.length - 1;
        }
      }
    },
  });
};

// 上移组
const moveGroupUp = (groupIndex) => {
  if (groupIndex <= 0) return;
  const temp = groupScoreList.value[groupIndex];
  groupScoreList.value[groupIndex] = groupScoreList.value[groupIndex - 1];
  groupScoreList.value[groupIndex - 1] = temp;
  recalculateAllScores();
};

// 下移组
const moveGroupDown = (groupIndex) => {
  if (groupIndex >= groupScoreList.value.length - 1) return;
  const temp = groupScoreList.value[groupIndex];
  groupScoreList.value[groupIndex] = groupScoreList.value[groupIndex + 1];
  groupScoreList.value[groupIndex + 1] = temp;
  recalculateAllScores();
};

// 重新计算所有分数
const recalculateAllScores = () => {
  let accumulate = 0;
  groupScoreList.value.forEach((group, index) => {
    group.groupIndex = index + 1;
    group.groupTotalScore = calculateGroupScore(
      group.arrowScoreList,
      config.is11Score
    );
    group.xCount = group.arrowScoreList.filter((s) => s === "X").length;
    group.tenCount = group.arrowScoreList.filter((s) => s === "10").length;
    group.missCount = group.arrowScoreList.filter((s) => s === "M").length;
    accumulate += group.groupTotalScore;
    group.accumulateScore = accumulate;
  });
};

// 更新单组分数
const updateGroupScore = (groupIndex) => {
  const group = groupScoreList.value[groupIndex];
  group.groupTotalScore = calculateGroupScore(
    group.arrowScoreList,
    config.is11Score
  );
  group.xCount = group.arrowScoreList.filter((s) => s === "X").length;
  group.tenCount = group.arrowScoreList.filter((s) => s === "10").length;
  group.missCount = group.arrowScoreList.filter((s) => s === "M").length;

  // 更新累计分
  let accumulate = 0;
  groupScoreList.value.forEach((g) => {
    accumulate += g.groupTotalScore;
    g.accumulateScore = accumulate;
  });
};

// 获取分数样式类
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

// 11分切换
const onIs11ScoreChange = (e) => {
  config.is11Score = e.detail.value;
  recalculateAllScores();
};

// 点击分数框
const onScoreClick = (groupIndex, scoreIndex) => {
  activeGroup.value = groupIndex;
  activeIndex.value = scoreIndex;
  showKeyboard.value = true;

  // 延迟滚动到对应分组，确保键盘显示后可见
  nextTick(() => {
    scrollToView.value = "group-" + groupIndex;
  });
};

// 点击页面其他区域
const onPageClick = () => {
  if (showKeyboard.value) {
    showKeyboard.value = false;
  }
};

// 键盘输入
const onKeyInput = (key) => {
  groupScoreList.value[activeGroup.value].arrowScoreList[activeIndex.value] =
    key.value;
  updateGroupScore(activeGroup.value);

  // 检查是否需要自动添加新组
  checkAutoAddGroup();

  // 自动跳转到下一个输入框
  const currentGroup = groupScoreList.value[activeGroup.value];
  if (activeIndex.value < currentGroup.arrowScoreList.length - 1) {
    // 跳转到当前组的下一个
    activeIndex.value++;
  } else if (activeGroup.value < groupScoreList.value.length - 1) {
    // 跳转到下一组的第一个
    activeGroup.value++;
    activeIndex.value = 0;
  }
  // 如果是最后一组的最后一个，停留在当前位置
};

// 键盘删除
const onKeyDelete = () => {
  groupScoreList.value[activeGroup.value].arrowScoreList[activeIndex.value] =
    "";
  updateGroupScore(activeGroup.value);
};

// 键盘完成
const onKeyDone = () => {
  showKeyboard.value = false;
};

// 放弃计分（清缓存并回首页）
const onCancel = () => {
  if (hasAnyScore()) {
    uni.showModal({
      title: "提示",
      content: "已有计分数据，确定要放弃吗？",
      success: (res) => {
        if (res.confirm) {
          skipWriteCacheOnLeave = true;
          clearScoringCache();
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
    });
  } else {
    skipWriteCacheOnLeave = true;
    clearScoringCache();
    uni.reLaunch({ url: "/pages/index/index" });
  }
};

// 保存按钮点击（达到最大组数时）
const onSaveClick = () => {
  if (!hasAnyScore()) {
    uni.showToast({ title: "请先输入分数", icon: "none" });
    return;
  }
  // 检查所有分数是否填写完整
  const unfilled = getFirstUnfilledScoreLocation(groupScoreList.value);
  if (unfilled) {
    uni.showToast({
      title: `第${unfilled.groupIndex + 1}组第${unfilled.arrowIndex + 1}箭未填写`,
      icon: "none",
      duration: 3000,
    });
    return;
  }
  showCompleteConfirm.value = true;
};

// 完成计分
const onComplete = () => {
  if (!hasAnyScore()) {
    uni.showToast({ title: "请先输入分数", icon: "none" });
    return;
  }
  showCompleteConfirm.value = true;
};

// 执行完成
const doComplete = () => {
  // 检查所有分数是否填写完整
  const unfilled = getFirstUnfilledScoreLocation(groupScoreList.value);
  if (unfilled) {
    showCompleteConfirm.value = false;
    uni.showToast({
      title: `第${unfilled.groupIndex + 1}组第${unfilled.arrowIndex + 1}箭未填写`,
      icon: "none",
      duration: 3000,
    });
    return;
  }

  // 过滤掉完全空白的组
  const validGroups = groupScoreList.value.filter((g) =>
    g.arrowScoreList.some((s) => s !== "")
  );

  if (validGroups.length === 0) {
    uni.showToast({ title: "请先输入分数", icon: "none" });
    return;
  }

  const finalTotalScore = validGroups.reduce(
    (sum, g) => sum + g.groupTotalScore,
    0
  );

  // 创建记录
  const record = {
    scoreRecordId: generateId(),
    bowType: config.bowType,
    bowName: "",
    distance: config.distance,
    targetType: config.targetType,
    groupNum: validGroups.length,
    arrowNum: config.arrowNum,
    totalArrowNum: validGroups.reduce(
      (sum, g) => sum + g.arrowScoreList.length,
      0
    ),
    is11Score: config.is11Score,
    isTakePhoto: false,
    photoList: [],
    isTiming: false,
    prepareTime: 0,
    formalTime: 0,
    scoreMode: "simple",
    createTime: Date.now(),
    updateTime: Date.now(),
    groupScoreList: validGroups,
    totalScore: finalTotalScore,
    customTargetList: [],
    isSimpleMode: true,
    presetName: "",
    isCompleted: true,
  };

  // 保存记录
  addScoreRecord(record);
  skipWriteCacheOnLeave = true;
  clearScoringCache();

  showCompleteConfirm.value = false;
  uni.showToast({ title: "计分完成", icon: "success" });

  setTimeout(() => {
    uni.reLaunch({ url: "/pages/index/index" });
    uni.$emit("refreshScoreList");
  }, 1500);
};

// 仅当从首页“继续计分”进入（带 restore=1）时从缓存恢复，否则重新开始
const tryRestoreFromCache = () => {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  const options = page.$page?.options || page.options || {};
  if (!options.restore) {
    initGroups();
    return;
  }
  const cache = getScoringCache();
  if (!cache || cache.mode !== "simple") {
    initGroups();
    return;
  }
  initGroups(); // 先有一组占位，避免弹窗时页面空白
  uni.showModal({
    title: "提示",
    content: "检测到还有未记录完成的分数，是否继续计分？",
    confirmText: "是",
    cancelText: "否",
    success: (res) => {
      if (res.confirm && cache.config && Array.isArray(cache.groupScoreList)) {
        Object.assign(config, cache.config);
        groupScoreList.value = cache.groupScoreList.map((g, i) => ({
          ...g,
          id: g.id || "group_" + (i + 1),
        }));
        groupIdCounter = groupScoreList.value.length;
        recalculateAllScores();
        const unfilled = getFirstUnfilledScoreLocation(groupScoreList.value);
        if (unfilled) {
          activeGroup.value = unfilled.groupIndex;
          activeIndex.value = unfilled.arrowIndex;
          nextTick(() => {
            scrollToView.value = "group-" + unfilled.groupIndex;
          });
        }
      } else {
        clearScoringCache();
        initGroups();
      }
    },
  });
};

// 有分数时写入计分缓存（不加入首页列表）
const writeScoringCache = () => {
  if (skipWriteCacheOnLeave || !hasAnyScore()) return;
  setScoringCache({
    mode: "simple",
    config: { ...config },
    groupScoreList: JSON.parse(JSON.stringify(groupScoreList.value)),
  });
};

watch(
  () => [...groupScoreList.value],
  () => {
    writeScoringCache();
  },
  { deep: true }
);

onMounted(() => {
  skipWriteCacheOnLeave = false; // 每次进入计分页重置
  tryRestoreFromCache();
  // 监听主题色变化
  uni.$on("themeColorChange", (color) => {
    themeColor.value = color;
  });
});

onUnmounted(() => {
  writeScoringCache();
  uni.$off("themeColorChange");
});
</script>

<script>
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
  display: flex;
  flex-direction: column;
}

.config-bar {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.config-item {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;

  &:active {
    background-color: v-bind('themeColor + "1A"');
  }
}

.config-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.config-text {
  font-size: 26rpx;
  color: #333;
}

.sub-config-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.score-mode-switch {
  display: flex;
  align-items: center;
}

.mode-label {
  font-size: 26rpx;
  color: #333;
  margin-right: 12rpx;
}

.score-sections {
  flex: 1;
  padding: 24rpx 0;
  padding-bottom: 200rpx;
  box-sizing: border-box;
  transition: padding-bottom 0.3s ease;

  &.keyboard-active {
    padding-bottom: 650rpx; // 键盘高度约450rpx + 操作按钮高度约200rpx
  }
}

.score-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid v-bind(themeColor);
}

.section-title-wrapper {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 28rpx;
  color: v-bind(themeColor);
  font-weight: 500;
}

.delete-group-btn {
  width: 40rpx;
  height: 40rpx;
  margin-left: 16rpx;
  background-color: #ff5252;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 28rpx;
    color: #fff;
    line-height: 1;
  }
}

/* 新的操作按钮区域样式 */
.group-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.action-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 24rpx;
    color: #fff;
  }
}

.delete-btn {
  background-color: #ff5252;

  &:active {
    background-color: #e04848;
  }
}

.section-accumulate {
  font-size: 28rpx;
  color: v-bind(themeColor);
  font-weight: 500;
}

.move-buttons {
  display: flex;
  gap: 8rpx;
}

.move-btn {
  width: 44rpx;
  height: 44rpx;
  background-color: v-bind(currentThemeColor);
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  &:active {
    opacity: 0.8;
  }

  text {
    font-size: 24rpx;
    color: #fff;
    font-weight: bold;
  }
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
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
  height: 60rpx;
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
    font-size: 28rpx;
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

.bottom-placeholder {
  height: 200rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
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

.btn-add {
  background-color: v-bind(themeColor);

  text {
    color: #fff;
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
    border-color: v-bind(themeColor);
    background-color: v-bind('themeColor + "1A"');

    text {
      color: v-bind(themeColor);
    }
  }

  text {
    font-size: 28rpx;
    color: #333;
  }
}

.complete-info {
  padding: 24rpx 0;
  text-align: center;
}

.complete-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;

  &:first-child {
    font-size: 48rpx;
    font-weight: bold;
    color: v-bind(themeColor);
  }
}

.complete-hint {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 24rpx;
}
</style>
