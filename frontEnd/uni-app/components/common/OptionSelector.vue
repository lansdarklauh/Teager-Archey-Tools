<template>
  <view class="option-selector">
    <view class="selector-label" v-if="label">{{ label }}</view>
    <view class="selector-options">
      <view
        class="option-item"
        :class="{ active: modelValue === option.value }"
        v-for="option in options"
        :key="option.value"
        @click="onSelect(option)"
      >
        <view class="option-icon" v-if="option.icon">
          <text class="iconfont">{{ option.icon }}</text>
        </view>
        <text class="option-text">{{ option.label }}</text>
      </view>
      <view
        class="option-item option-custom"
        v-if="showCustom"
        :class="{ active: isCustomActive }"
        @click="onCustomClick"
      >
        <text class="option-text">{{ customText }}</text>
      </view>
    </view>
    <view class="custom-input" v-if="showCustomInput && isCustomActive">
      <input
        class="input-field"
        type="text"
        :placeholder="customPlaceholder"
        v-model="customValue"
        @blur="onCustomBlur"
        @confirm="onCustomConfirm"
      />
      <text class="input-unit" v-if="customUnit">{{ customUnit }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  showCustom: {
    type: Boolean,
    default: false,
  },
  customText: {
    type: String,
    default: "自定义",
  },
  customPlaceholder: {
    type: String,
    default: "请输入",
  },
  customUnit: {
    type: String,
    default: "",
  },
  showCustomInput: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "change", "custom"]);

const customValue = ref("");
const isCustomActive = ref(false);

// 检查当前值是否在选项中
const isValueInOptions = computed(() => {
  return props.options.some((opt) => opt.value === props.modelValue);
});

// 初始化时检查是否需要激活自定义
watch(
  () => props.modelValue,
  (val) => {
    if (props.showCustom && !isValueInOptions.value && val) {
      isCustomActive.value = true;
      customValue.value = val;
    }
  },
  { immediate: true }
);

const onSelect = (option) => {
  isCustomActive.value = false;
  emit("update:modelValue", option.value);
  emit("change", option);
};

const onCustomClick = () => {
  isCustomActive.value = true;
  emit("custom");
};

const onCustomBlur = () => {
  if (customValue.value) {
    emit("update:modelValue", customValue.value);
    emit("change", {
      value: customValue.value,
      label: customValue.value,
      isCustom: true,
    });
  }
};

const onCustomConfirm = () => {
  onCustomBlur();
};
</script>

<style lang="scss" scoped>
.option-selector {
  margin-bottom: 24rpx;
}

.selector-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.selector-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 40rpx;
  background-color: #fff;
  transition: all 0.2s;

  &.active {
    border-color: #00c853;
    background-color: rgba(0, 200, 83, 0.1);

    .option-text {
      color: #00c853;
    }
  }

  &:active {
    opacity: 0.8;
  }
}

.option-icon {
  margin-right: 8rpx;

  .iconfont {
    font-size: 28rpx;
    color: #00c853;
  }
}

.option-text {
  font-size: 26rpx;
  color: #666;
}

.option-custom {
  border-style: dashed;
}

.custom-input {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 16rpx 24rpx;
  border: 2rpx solid #00c853;
  border-radius: 8rpx;
  background-color: #fff;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.input-unit {
  font-size: 26rpx;
  color: #999;
  margin-left: 8rpx;
}
</style>
