<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <image
          v-if="userInfo.avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <text>🎯</text>
        </view>
      </view>
      <view class="user-info">
        <view class="name-row">
          <text class="user-name">{{ userInfo.nickname }}</text>
          <view class="edit-btn" @click="editNickname">
            <text>✏️</text>
          </view>
        </view>
        <view class="bow-types">
          <text v-for="bow in userInfo.bowTypes" :key="bow">{{
            getBowLabel(bow)
          }}</text>
          <text v-if="userInfo.bowTypes.length === 0" class="empty-hint"
            >点击添加弓种</text
          >
        </view>
      </view>
    </view>

    <!-- 个人简介 -->
    <view class="config-section">
      <text class="section-title">个人简介</text>
      <textarea
        class="intro-textarea"
        v-model="userInfo.introduction"
        placeholder="请输入"
        @blur="saveUserInfo"
      />
    </view>

    <!-- 拥有弓把 -->
    <view class="config-section">
      <text class="section-title">拥有弓把</text>
      <view class="bow-input-row">
        <input
          class="bow-input"
          v-model="newBowName"
          placeholder="请输入弓把名"
        />
        <view class="add-bow-btn" @click="addBow">
          <text>添加</text>
        </view>
      </view>
      <view class="bow-list">
        <view
          class="bow-tag"
          v-for="(bow, index) in userInfo.bows"
          :key="index"
        >
          <text>{{ bow }}</text>
          <text class="remove-bow" @click="removeBow(index)">×</text>
        </view>
      </view>
    </view>

    <!-- 通用设置 -->
    <view class="config-section">
      <text class="section-title">通用设置</text>

      <view class="setting-row">
        <text class="setting-label">主题色:</text>
        <view class="setting-value" @click="showColorPicker = true">
          <view
            class="color-preview"
            :style="{ backgroundColor: userInfo.themeColor }"
          ></view>
          <text class="value-text">选择颜色 ></text>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">默认预设:</text>
        <view class="setting-value">
          <picker
            :value="presetIndex"
            :range="presetOptions"
            @change="onPresetChange"
          >
            <text class="value-text">{{ presetOptions[presetIndex] }} ▼</text>
          </picker>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">默认弓种:</text>
        <view class="setting-value">
          <picker
            :value="bowTypeIndex"
            :range="bowTypeLabels"
            @change="onBowTypeChange"
          >
            <text class="value-text">{{ bowTypeLabels[bowTypeIndex] }} ▼</text>
          </picker>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">默认距离:</text>
        <view class="setting-value">
          <picker
            :value="distanceIndex"
            :range="distanceOptions"
            @change="onDistanceChange"
          >
            <text class="value-text"
              >{{ distanceOptions[distanceIndex] }} ▼</text
            >
          </picker>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">默认靶面:</text>
        <view class="setting-value">
          <picker
            :value="targetIndex"
            :range="targetOptions"
            @change="onTargetChange"
          >
            <text class="value-text">{{ targetOptions[targetIndex] }} ▼</text>
          </picker>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">默认组合:</text>
        <view class="setting-value">
          <picker
            :value="groupIndex"
            :range="groupOptions"
            @change="onGroupChange"
          >
            <text class="value-text">{{ groupOptions[groupIndex] }} ▼</text>
          </picker>
        </view>
      </view>

      <view class="setting-row">
        <text class="setting-label">自定义预设列表</text>
        <view class="setting-value" @click="goToCustomPreset">
          <text class="value-text">选择颜色 ></text>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="config-section">
      <text class="section-title">数据管理</text>

      <view class="data-row" @click="exportData">
        <text class="data-label">导出数据</text>
        <text class="data-icon">></text>
      </view>

      <view class="data-row" @click="clearData">
        <text class="data-label danger">清除所有数据</text>
        <text class="data-icon">></text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="config-section">
      <text class="section-title">关于</text>

      <view class="about-row">
        <text class="about-label">版本</text>
        <text class="about-value">V1.0.0</text>
      </view>

      <view class="about-row">
        <text class="about-label">开发者</text>
        <text class="about-value">射箭助手团队</text>
      </view>
    </view>

    <!-- 退出按钮（预留） -->
    <view class="logout-btn">
      <text>退出登录</text>
    </view>

    <!-- 颜色选择弹窗 -->
    <Popup
      v-model:visible="showColorPicker"
      title="选择主题色"
      position="bottom"
      :showFooter="false"
    >
      <view class="color-options">
        <view
          class="color-item"
          v-for="color in themeColors"
          :key="color.value"
          :class="{ active: userInfo.themeColor === color.value }"
          @click="selectColor(color)"
        >
          <view
            class="color-dot"
            :style="{ backgroundColor: color.value }"
          ></view>
          <text>{{ color.label }}</text>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { getUserInfo, updateUserInfo } from "@/utils/storage.js";
import {
  BOW_TYPES,
  DISTANCES,
  TARGET_TYPES,
  GROUP_ARROW_PRESETS,
  THEME_COLORS,
} from "@/utils/constants.js";
import { getBowTypeName } from "@/utils/score.js";
import Popup from "@/components/common/Popup.vue";

// 用户信息
const userInfo = reactive({
  nickname: "射箭爱好者",
  avatar: "",
  bowTypes: [],
  bows: [],
  introduction: "",
  defaultBowType: "americanHuntingBow",
  defaultDistance: "30m",
  defaultTarget: "80Full",
  defaultGroupArrow: "6组/6箭/共36箭",
  themeColor: "#00C853",
});

// 主题色计算属性
const currentThemeColor = computed(() => userInfo.themeColor);

// 弹窗状态
const showColorPicker = ref(false);

// 新弓把名
const newBowName = ref("");

// 选项数据
const themeColors = ref(THEME_COLORS);

// 计算选项
const presetOptions = ["以上一次设置为准", "使用默认设置"];
const presetIndex = ref(0);

const bowTypeLabels = computed(() => BOW_TYPES.map((b) => b.label));
const bowTypeIndex = computed(() => {
  const index = BOW_TYPES.findIndex((b) => b.value === userInfo.defaultBowType);
  return index > -1 ? index : 0;
});

const distanceOptions = computed(() => DISTANCES.map((d) => d.label));
const distanceIndex = computed(() => {
  const index = DISTANCES.findIndex(
    (d) => d.value === userInfo.defaultDistance
  );
  return index > -1 ? index : 0;
});

const targetOptions = computed(() => TARGET_TYPES.map((t) => t.label));
const targetIndex = computed(() => {
  const index = TARGET_TYPES.findIndex(
    (t) => t.value === userInfo.defaultTarget
  );
  return index > -1 ? index : 0;
});

const groupOptions = computed(() => GROUP_ARROW_PRESETS.map((g) => g.label));
const groupIndex = computed(() => {
  const index = GROUP_ARROW_PRESETS.findIndex(
    (g) => g.label === userInfo.defaultGroupArrow
  );
  return index > -1 ? index : 0;
});

// 方法
const getBowLabel = (value) => getBowTypeName(value);

// 保存用户信息
const saveUserInfo = () => {
  updateUserInfo(userInfo);
};

// 编辑昵称
const editNickname = () => {
  uni.showModal({
    title: "修改昵称",
    editable: true,
    placeholderText: userInfo.nickname,
    success: (res) => {
      if (res.confirm && res.content) {
        userInfo.nickname = res.content;
        saveUserInfo();
      }
    },
  });
};

// 添加弓把
const addBow = () => {
  if (newBowName.value.trim()) {
    userInfo.bows.push(newBowName.value.trim());
    newBowName.value = "";
    saveUserInfo();
  }
};

// 移除弓把
const removeBow = (index) => {
  userInfo.bows.splice(index, 1);
  saveUserInfo();
};

// 选择颜色
const selectColor = (color) => {
  userInfo.themeColor = color.value;
  saveUserInfo();
  showColorPicker.value = false;

  // 发出全局事件，通知其他页面更新主题色
  uni.$emit("themeColorChange", color.value);
  uni.showToast({ title: "主题色已更新", icon: "success" });
};

// 选项变更
const onPresetChange = (e) => {
  presetIndex.value = e.detail.value;
};

const onBowTypeChange = (e) => {
  userInfo.defaultBowType = BOW_TYPES[e.detail.value].value;
  saveUserInfo();
};

const onDistanceChange = (e) => {
  userInfo.defaultDistance = DISTANCES[e.detail.value].value;
  saveUserInfo();
};

const onTargetChange = (e) => {
  userInfo.defaultTarget = TARGET_TYPES[e.detail.value].value;
  saveUserInfo();
};

const onGroupChange = (e) => {
  userInfo.defaultGroupArrow = GROUP_ARROW_PRESETS[e.detail.value].label;
  saveUserInfo();
};

// 跳转自定义预设
const goToCustomPreset = () => {
  uni.showToast({ title: "功能开发中", icon: "none" });
};

// 导出数据
const exportData = () => {
  uni.showToast({ title: "功能开发中", icon: "none" });
};

// 清除数据
const clearData = () => {
  uni.showModal({
    title: "警告",
    content: "确定要清除所有数据吗？此操作不可恢复！",
    confirmColor: "#ff5252",
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync();
        uni.showToast({ title: "已清除", icon: "success" });
        loadUserInfo();
      }
    },
  });
};

// 加载用户信息
const loadUserInfo = () => {
  const info = getUserInfo();
  Object.assign(userInfo, info);
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24rpx;
  background-color: #f0f0f0;

  image {
    width: 100%;
    height: 100%;
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0f2e9;

  text {
    font-size: 60rpx;
  }
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 500;
  color: v-bind(currentThemeColor);
}

.edit-btn {
  margin-left: 16rpx;

  text {
    font-size: 28rpx;
  }
}

.bow-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: #666;

    &:not(:last-child)::after {
      content: "、";
    }
  }

  .empty-hint {
    color: #999;

    &::after {
      content: "";
    }
  }
}

.config-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.intro-textarea {
  width: 100%;
  height: 160rpx;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.bow-input-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.bow-input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.add-bow-btn {
  width: 120rpx;
  height: 72rpx;
  background-color: v-bind(currentThemeColor);
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 28rpx;
    color: #fff;
  }
}

.bow-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.bow-tag {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 24rpx;

  text {
    font-size: 26rpx;
    color: #333;
  }
}

.remove-bow {
  margin-left: 8rpx;
  color: #ff5252 !important;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  font-size: 28rpx;
  color: #333;
}

.setting-value {
  display: flex;
  align-items: center;
}

.color-preview {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.value-text {
  font-size: 26rpx;
  color: v-bind(currentThemeColor);
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.data-label {
  font-size: 28rpx;
  color: #333;

  &.danger {
    color: #ff5252;
  }
}

.data-icon {
  font-size: 26rpx;
  color: #999;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.about-label {
  font-size: 28rpx;
  color: #666;
}

.about-value {
  font-size: 26rpx;
  color: #999;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background-color: v-bind(currentThemeColor);
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 48rpx;

  text {
    font-size: 30rpx;
    color: #fff;
  }
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 16rpx 0;
}

.color-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 32rpx;

  &.active {
    border-color: v-bind(currentThemeColor);
    background-color: v-bind('currentThemeColor + "1A"');
  }

  text {
    font-size: 26rpx;
    color: #333;
  }
}

.color-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
</style>
