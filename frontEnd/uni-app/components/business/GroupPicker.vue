<template>
  <view class="group-picker">
    <view class="picker-section">
      <view class="section-header">
        <text class="section-title">请选择/填写分组信息</text>
        <view class="close-btn" @click="onClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <!-- 预设选项 -->
      <view class="preset-row">
        <text class="label">预设:</text>
        <view class="preset-switch">
          <switch
            :checked="usePreset"
            @change="onPresetChange"
            color="#00C853"
          />
        </view>
        <view class="preset-options" v-if="usePreset">
          <view
            class="preset-item"
            :class="{ active: currentPreset === preset.label }"
            v-for="preset in presets"
            :key="preset.label"
            @click="selectPreset(preset)"
          >
            <text>{{ preset.label }}</text>
          </view>
        </view>
      </view>

      <!-- 自定义输入 -->
      <view class="custom-row" v-if="!usePreset">
        <view class="input-group">
          <text class="input-label">组数:</text>
          <input
            class="input-field"
            type="number"
            v-model="groupNum"
            placeholder="6"
          />
        </view>
        <view class="input-group">
          <text class="input-label">每组箭数:</text>
          <input
            class="input-field"
            type="number"
            v-model="arrowNum"
            placeholder="6"
          />
        </view>
      </view>

      <!-- 显示结果 -->
      <view class="result-row">
        <text class="result-text"
          >分组: {{ groupNum }}组 + 每组{{ arrowNum }}箭 =
          {{ totalArrows }}箭</text
        >
      </view>

      <!-- 确认按钮 -->
      <view class="confirm-row">
        <view class="confirm-btn" @click="onConfirm">
          <text>确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { GROUP_ARROW_PRESETS } from "@/utils/constants.js";

const props = defineProps({
  defaultGroupNum: {
    type: Number,
    default: 6,
  },
  defaultArrowNum: {
    type: Number,
    default: 6,
  },
  hasExistingData: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "close"]);

const usePreset = ref(true);
const groupNum = ref(props.defaultGroupNum);
const arrowNum = ref(props.defaultArrowNum);
const currentPreset = ref("");
const presets = ref(GROUP_ARROW_PRESETS);

// 计算总箭数
const totalArrows = computed(() => {
  return (parseInt(groupNum.value) || 0) * (parseInt(arrowNum.value) || 0);
});

// 初始化默认预设
const initPreset = () => {
  const preset = presets.value.find(
    (p) =>
      p.groupNum === props.defaultGroupNum &&
      p.arrowNum === props.defaultArrowNum
  );
  if (preset) {
    currentPreset.value = preset.label;
  }
};

initPreset();

// 预设切换
const onPresetChange = (e) => {
  usePreset.value = e.detail.value;
  if (!usePreset.value) {
    currentPreset.value = "";
  }
};

// 选择预设
const selectPreset = (preset) => {
  currentPreset.value = preset.label;
  groupNum.value = preset.groupNum;
  arrowNum.value = preset.arrowNum;
};

// 确认
const onConfirm = () => {
  const g = parseInt(groupNum.value) || 6;
  const a = parseInt(arrowNum.value) || 6;

  // 如果配置没有变化，直接关闭
  if (g === props.defaultGroupNum && a === props.defaultArrowNum) {
    emit("close");
    return;
  }

  // 如果已有数据，需要提示用户
  if (props.hasExistingData) {
    emit("confirm", {
      groupNum: g,
      arrowNum: a,
      totalArrows: g * a,
      label: `${a}箭/${g}组/共${g * a}箭`,
      needConfirm: true, // 标记需要二次确认
    });
  } else {
    // 没有数据，直接确认
    emit("confirm", {
      groupNum: g,
      arrowNum: a,
      totalArrows: g * a,
      label: `${a}箭/${g}组/共${g * a}箭`,
      needConfirm: false,
    });
  }
};

// 关闭
const onClose = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.group-picker {
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  font-size: 40rpx;
  color: #ff5252;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #eee;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-right: 16rpx;
}

.preset-switch {
  margin-right: 24rpx;
}

.preset-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
  width: 100%;
}

.preset-item {
  padding: 12rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  background-color: #fff;

  &.active {
    border-color: #00c853;
    background-color: rgba(0, 200, 83, 0.1);

    text {
      color: #00c853;
    }
  }

  text {
    font-size: 26rpx;
    color: #666;
  }
}

.custom-row {
  display: flex;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.input-group {
  display: flex;
  align-items: center;
  flex: 1;
}

.input-label {
  font-size: 28rpx;
  color: #00c853;
  margin-right: 16rpx;
  white-space: nowrap;
}

.input-field {
  flex: 1;
  height: 64rpx;
  border-bottom: 2rpx solid #ddd;
  font-size: 28rpx;
  text-align: center;
}

.result-row {
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
}

.result-text {
  font-size: 28rpx;
  color: #333;
}

.confirm-row {
  display: flex;
  justify-content: center;
}

.confirm-btn {
  width: 60%;
  height: 80rpx;
  background-color: #00c853;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    font-size: 30rpx;
    color: #fff;
  }
}
</style>
