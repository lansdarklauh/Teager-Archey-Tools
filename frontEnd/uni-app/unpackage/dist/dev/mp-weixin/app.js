"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_storage = require("./utils/storage.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/statistics/index.js";
  "./pages/timer/index.js";
  "./pages/mine/index.js";
  "./pages/score/normal.js";
  "./pages/score/simple.js";
  "./pages/score/custom.js";
  "./pages/score/scoring.js";
  "./pages/score/detail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch - 射箭助手");
    this.loadThemeColor();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:11", "App Show");
    this.loadThemeColor();
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Hide");
  },
  methods: {
    loadThemeColor() {
      const userInfo = utils_storage.getUserInfo();
      const themeColor = userInfo.themeColor || "#00C853";
      const app = getApp();
      if (app) {
        app.globalData = app.globalData || {};
        app.globalData.themeColor = themeColor;
      }
      this.setThemeColor(themeColor);
      this.setTabBarColor(themeColor);
    },
    setThemeColor(color) {
      common_vendor.index.setStorageSync("themeColor", color);
      common_vendor.index.$emit("themeColorChange", color);
    },
    setTabBarColor(color) {
      common_vendor.index.setTabBarStyle({
        selectedColor: color
      });
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
