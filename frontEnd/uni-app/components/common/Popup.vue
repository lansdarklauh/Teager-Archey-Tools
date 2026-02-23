<template>
  <view class="popup-mask" v-if="visible" @click="onMaskClick">
    <view class="popup-container" :class="position" @click.stop>
      <view class="popup-header" v-if="showHeader">
        <text class="popup-title">{{ title }}</text>
        <view class="popup-close" @click="onClose">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="popup-content">
        <slot></slot>
      </view>
      <view class="popup-footer" v-if="showFooter">
        <slot name="footer">
          <view class="footer-btn btn-cancel" @click="onCancel">
            <text>{{ cancelText }}</text>
          </view>
          <view class="footer-btn btn-confirm" @click="onConfirm">
            <text>{{ confirmText }}</text>
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    default: "center", // center, bottom
  },
  closeOnMask: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: "取消",
  },
  confirmText: {
    type: String,
    default: "确定",
  },
});

const emit = defineEmits(["update:visible", "close", "confirm", "cancel"]);

const onMaskClick = () => {
  if (props.closeOnMask) {
    onClose();
  }
};

const onClose = () => {
  emit("update:visible", false);
  emit("close");
};

const onCancel = () => {
  emit("cancel");
  onClose();
};

const onConfirm = () => {
  emit("confirm");
};
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-container {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  max-height: 80vh;

  &.center {
    width: 80%;
    max-width: 600rpx;
  }

  &.bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 24rpx 24rpx 0 0;
    max-height: 70vh;
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.popup-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-icon {
  font-size: 40rpx;
  color: #ff5252;
  line-height: 1;
}

.popup-content {
  padding: 24rpx 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-footer {
  display: flex;
  padding: 24rpx 32rpx;
  border-top: 1px solid #eee;
}

.footer-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 16rpx;

  text {
    font-size: 28rpx;
  }
}

.btn-cancel {
  background-color: #fff;
  border: 1px solid #00c853;

  text {
    color: #00c853;
  }
}

.btn-confirm {
  background-color: #00c853;

  text {
    color: #fff;
  }
}
</style>
