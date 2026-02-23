"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_constants = require("../../utils/constants.js");
const utils_score = require("../../utils/score.js");
if (!Math) {
  Popup();
}
const Popup = () => "../../components/common/Popup.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "3a2e5caa": currentThemeColor.value,
      "adc4110c": currentThemeColor.value + "1A"
    }));
    const userInfo = common_vendor.reactive({
      nickname: "射箭爱好者",
      avatar: "",
      bowTypes: [],
      bows: [],
      introduction: "",
      defaultBowType: "americanHuntingBow",
      defaultDistance: "30m",
      defaultTarget: "80Full",
      defaultGroupArrow: "6组/6箭/共36箭",
      themeColor: "#00C853"
    });
    const currentThemeColor = common_vendor.computed(() => userInfo.themeColor);
    const showColorPicker = common_vendor.ref(false);
    const newBowName = common_vendor.ref("");
    const themeColors = common_vendor.ref(utils_constants.THEME_COLORS);
    const presetOptions = ["以上一次设置为准", "使用默认设置"];
    const presetIndex = common_vendor.ref(0);
    const bowTypeLabels = common_vendor.computed(() => utils_constants.BOW_TYPES.map((b) => b.label));
    const bowTypeIndex = common_vendor.computed(() => {
      const index = utils_constants.BOW_TYPES.findIndex((b) => b.value === userInfo.defaultBowType);
      return index > -1 ? index : 0;
    });
    const distanceOptions = common_vendor.computed(() => utils_constants.DISTANCES.map((d) => d.label));
    const distanceIndex = common_vendor.computed(() => {
      const index = utils_constants.DISTANCES.findIndex(
        (d) => d.value === userInfo.defaultDistance
      );
      return index > -1 ? index : 0;
    });
    const targetOptions = common_vendor.computed(() => utils_constants.TARGET_TYPES.map((t) => t.label));
    const targetIndex = common_vendor.computed(() => {
      const index = utils_constants.TARGET_TYPES.findIndex(
        (t) => t.value === userInfo.defaultTarget
      );
      return index > -1 ? index : 0;
    });
    const groupOptions = common_vendor.computed(() => utils_constants.GROUP_ARROW_PRESETS.map((g) => g.label));
    const groupIndex = common_vendor.computed(() => {
      const index = utils_constants.GROUP_ARROW_PRESETS.findIndex(
        (g) => g.label === userInfo.defaultGroupArrow
      );
      return index > -1 ? index : 0;
    });
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
    const saveUserInfo = () => {
      utils_storage.updateUserInfo(userInfo);
    };
    const editNickname = () => {
      common_vendor.index.showModal({
        title: "修改昵称",
        editable: true,
        placeholderText: userInfo.nickname,
        success: (res) => {
          if (res.confirm && res.content) {
            userInfo.nickname = res.content;
            saveUserInfo();
          }
        }
      });
    };
    const addBow = () => {
      if (newBowName.value.trim()) {
        userInfo.bows.push(newBowName.value.trim());
        newBowName.value = "";
        saveUserInfo();
      }
    };
    const removeBow = (index) => {
      userInfo.bows.splice(index, 1);
      saveUserInfo();
    };
    const selectColor = (color) => {
      userInfo.themeColor = color.value;
      saveUserInfo();
      showColorPicker.value = false;
      common_vendor.index.$emit("themeColorChange", color.value);
      common_vendor.index.showToast({ title: "主题色已更新", icon: "success" });
    };
    const onPresetChange = (e) => {
      presetIndex.value = e.detail.value;
    };
    const onBowTypeChange = (e) => {
      userInfo.defaultBowType = utils_constants.BOW_TYPES[e.detail.value].value;
      saveUserInfo();
    };
    const onDistanceChange = (e) => {
      userInfo.defaultDistance = utils_constants.DISTANCES[e.detail.value].value;
      saveUserInfo();
    };
    const onTargetChange = (e) => {
      userInfo.defaultTarget = utils_constants.TARGET_TYPES[e.detail.value].value;
      saveUserInfo();
    };
    const onGroupChange = (e) => {
      userInfo.defaultGroupArrow = utils_constants.GROUP_ARROW_PRESETS[e.detail.value].label;
      saveUserInfo();
    };
    const goToCustomPreset = () => {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    };
    const exportData = () => {
      common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
    };
    const clearData = () => {
      common_vendor.index.showModal({
        title: "警告",
        content: "确定要清除所有数据吗？此操作不可恢复！",
        confirmColor: "#ff5252",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.showToast({ title: "已清除", icon: "success" });
            loadUserInfo();
          }
        }
      });
    };
    const loadUserInfo = () => {
      const info = utils_storage.getUserInfo();
      Object.assign(userInfo, info);
    };
    common_vendor.onMounted(() => {
      loadUserInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatar
      }, userInfo.avatar ? {
        b: userInfo.avatar
      } : {}, {
        c: common_vendor.t(userInfo.nickname),
        d: common_vendor.o(editNickname),
        e: common_vendor.f(userInfo.bowTypes, (bow, k0, i0) => {
          return {
            a: common_vendor.t(getBowLabel(bow)),
            b: bow
          };
        }),
        f: userInfo.bowTypes.length === 0
      }, userInfo.bowTypes.length === 0 ? {} : {}, {
        g: common_vendor.o(saveUserInfo),
        h: userInfo.introduction,
        i: common_vendor.o(($event) => userInfo.introduction = $event.detail.value),
        j: newBowName.value,
        k: common_vendor.o(($event) => newBowName.value = $event.detail.value),
        l: common_vendor.o(addBow),
        m: common_vendor.f(userInfo.bows, (bow, index, i0) => {
          return {
            a: common_vendor.t(bow),
            b: common_vendor.o(($event) => removeBow(index), index),
            c: index
          };
        }),
        n: userInfo.themeColor,
        o: common_vendor.o(($event) => showColorPicker.value = true),
        p: common_vendor.t(presetOptions[presetIndex.value]),
        q: presetIndex.value,
        r: presetOptions,
        s: common_vendor.o(onPresetChange),
        t: common_vendor.t(bowTypeLabels.value[bowTypeIndex.value]),
        v: bowTypeIndex.value,
        w: bowTypeLabels.value,
        x: common_vendor.o(onBowTypeChange),
        y: common_vendor.t(distanceOptions.value[distanceIndex.value]),
        z: distanceIndex.value,
        A: distanceOptions.value,
        B: common_vendor.o(onDistanceChange),
        C: common_vendor.t(targetOptions.value[targetIndex.value]),
        D: targetIndex.value,
        E: targetOptions.value,
        F: common_vendor.o(onTargetChange),
        G: common_vendor.t(groupOptions.value[groupIndex.value]),
        H: groupIndex.value,
        I: groupOptions.value,
        J: common_vendor.o(onGroupChange),
        K: common_vendor.o(goToCustomPreset),
        L: common_vendor.o(exportData),
        M: common_vendor.o(clearData),
        N: common_vendor.f(themeColors.value, (color, k0, i0) => {
          return {
            a: color.value,
            b: common_vendor.t(color.label),
            c: color.value,
            d: userInfo.themeColor === color.value ? 1 : "",
            e: common_vendor.o(($event) => selectColor(color), color.value)
          };
        }),
        O: common_vendor.o(($event) => showColorPicker.value = $event),
        P: common_vendor.p({
          title: "选择主题色",
          position: "bottom",
          showFooter: false,
          visible: showColorPicker.value
        }),
        Q: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-569e925a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/index.js.map
