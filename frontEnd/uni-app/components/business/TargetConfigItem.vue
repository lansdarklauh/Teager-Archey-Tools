<template>
  <view class="target-config-item">
    <view class="item-header">
      <text class="item-title">靶子 {{ index }}</text>
      <view class="item-actions">
        <view class="action-btn" @click="onCopy" v-if="showCopy">
          <text>复制</text>
        </view>
        <view class="action-btn btn-delete" @click="onDelete" v-if="showDelete">
          <text>删除</text>
        </view>
      </view>
    </view>

    <view class="item-body">
      <view class="config-row">
        <text class="config-label">箭数:</text>
        <input
          class="config-input"
          type="number"
          v-model="localConfig.arrowNum"
          placeholder="6"
          @blur="onConfigChange"
        />
      </view>

      <view class="config-row">
        <text class="config-label">距离:</text>
        <view class="config-select" @click="showDistancePicker = true">
          <text>{{ localConfig.distance || "选择距离" }}</text>
          <text class="select-icon">▼</text>
        </view>
      </view>

      <view class="config-row">
        <text class="config-label">靶面:</text>
        <view class="config-select" @click="showTargetPicker = true">
          <text>{{
            getTargetLabel(localConfig.targetType) || "选择靶面"
          }}</text>
          <text class="select-icon">▼</text>
        </view>
      </view>
    </view>

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
          :class="{ active: localConfig.distance === d.value }"
          v-for="d in distances"
          :key="d.value"
          @click="selectDistance(d)"
        >
          <text>{{ d.label }}</text>
        </view>
      </view>
      <view class="custom-distance">
        <input
          class="custom-input"
          type="number"
          v-model="customDistance"
          placeholder="自定义距离"
        />
        <text class="custom-unit">m</text>
      </view>
    </Popup>

    <!-- 靶面选择弹窗 -->
    <Popup
      v-model:visible="showTargetPicker"
      title="选择靶面"
      position="bottom"
      @confirm="onTargetConfirm"
    >
      <view class="picker-options target-options">
        <view
          class="picker-option"
          :class="{ active: localConfig.targetType === t.value }"
          v-for="t in targets"
          :key="t.value"
          @click="selectTarget(t)"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { DISTANCES, TARGET_TYPES } from "@/utils/constants.js";
import { getThemeColor } from "@/utils/theme.js";
import Popup from "@/components/common/Popup.vue";

const props = defineProps({
  index: {
    type: Number,
    default: 1,
  },
  config: {
    type: Object,
    default: () => ({
      arrowNum: 6,
      distance: "30m",
      targetType: "80Full",
    }),
  },
  showCopy: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["change", "copy", "delete"]);

const themeColor = ref(getThemeColor());

const localConfig = reactive({
  arrowNum: props.config.arrowNum || 6,
  distance: props.config.distance || "30m",
  targetType: props.config.targetType || "80Full",
});

const distances = ref(DISTANCES);
const targets = ref(TARGET_TYPES);
const showDistancePicker = ref(false);
const showTargetPicker = ref(false);
const customDistance = ref("");

watch(
  () => props.config,
  (newVal) => {
    localConfig.arrowNum = newVal.arrowNum || 6;
    localConfig.distance = newVal.distance || "30m";
    localConfig.targetType = newVal.targetType || "80Full";
  },
  { deep: true }
);

const getTargetLabel = (value) => {
  const target = targets.value.find((t) => t.value === value);
  return target ? target.label : value;
};

const selectDistance = (d) => {
  localConfig.distance = d.value;
  customDistance.value = "";
};

const selectTarget = (t) => {
  localConfig.targetType = t.value;
};

const onDistanceConfirm = () => {
  if (customDistance.value) {
    localConfig.distance = customDistance.value + "m";
  }
  showDistancePicker.value = false;
  onConfigChange();
};

const onTargetConfirm = () => {
  showTargetPicker.value = false;
  onConfigChange();
};

const onConfigChange = () => {
  emit("change", { ...localConfig });
};

const onCopy = () => {
  emit("copy", props.index - 1);
};

const onDelete = () => {
  emit("delete", props.index - 1);
};
</script>

<style lang="scss" scoped>
.target-config-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  border: 2rpx solid #eee;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.item-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.item-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 8rpx 20rpx;
  border: 2rpx solid v-bind(themeColor);
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    color: v-bind(themeColor);
  }

  &.btn-delete {
    border-color: #ff5252;

    text {
      color: #ff5252;
    }
  }
}

.item-body {
  padding: 24rpx;
}

.config-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.config-label {
  font-size: 26rpx;
  color: #666;
  width: 100rpx;
}

.config-input {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.config-select {
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

.picker-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.target-options {
  max-height: 400rpx;
  overflow-y: auto;
}

.picker-option {
  padding: 16rpx 32rpx;
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
    font-size: 26rpx;
    color: #333;
  }
}

.custom-distance {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
}

.custom-input {
  flex: 1;
  font-size: 26rpx;
}

.custom-unit {
  font-size: 26rpx;
  color: #999;
  margin-left: 8rpx;
}
</style>
