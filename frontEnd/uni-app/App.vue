<script>
import { getUserInfo } from "@/utils/storage.js";

export default {
  onLaunch: function () {
    console.log("App Launch - 射箭助手");
    // 加载用户主题色
    this.loadThemeColor();
  },
  onShow: function () {
    console.log("App Show");
    // 每次显示时检查主题色是否有变化
    this.loadThemeColor();
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    loadThemeColor() {
      const userInfo = getUserInfo();
      const themeColor = userInfo.themeColor || "#00C853";
      // 将主题色存储到全局数据
      const app = getApp();
      if (app) {
        app.globalData = app.globalData || {};
        app.globalData.themeColor = themeColor;
      }
      // 动态设置CSSvar变量
      this.setThemeColor(themeColor);
      // 动态设置tabBar颜色
      this.setTabBarColor(themeColor);
    },
    setThemeColor(color) {
      // 设置CSS变量
      uni.setStorageSync("themeColor", color);
      // 发出全局事件
      uni.$emit("themeColorChange", color);
    },
    setTabBarColor(color) {
      // 动态设置tabBar选中颜色
      uni.setTabBarStyle({
        selectedColor: color,
      });
    },
  },
};
</script>

<style lang="scss">
/* 全局样式 */

/* 主题色变量 */
$primary-color: var(--theme-color, #00c853);
$danger-color: #ff5252;
$warning-color: #ff9800;
$info-color: #2196f3;

/* 文字颜色 */
$text-primary: #333333;
$text-secondary: #666666;
$text-placeholder: #999999;

/* 背景色 */
$bg-page: #f5f5f5;
$bg-card: #ffffff;

/* 边框颜色 */
$border-color: #e0e0e0;
$border-light: #f0f0f0;

/* 重置样式 */
page {
  background-color: $bg-page;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

view,
text,
input,
textarea,
button {
  box-sizing: border-box;
}

/* 清除按钮默认样式 */
button {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: none;
  border-radius: 0;

  &::after {
    border: none;
  }
}

/* 输入框样式 */
input,
textarea {
  font-size: 28rpx;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

/* 通用类 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: $primary-color;
}

.text-danger {
  color: $danger-color;
}

.text-secondary {
  color: $text-secondary;
}

.bg-white {
  background-color: $bg-card;
}

.rounded {
  border-radius: 16rpx;
}

.shadow {
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 安全区域 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 隐藏元素 */
.hidden {
  display: none !important;
}

/* 禁用状态 */
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
