"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "ModeSelector",
  emits: ["select", "close"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "1f1e39a1": themeColor.value,
      "ba906278": themeColor.value + "1A"
    }));
    const emit = __emit;
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const modes = common_vendor.ref(utils_constants.SCORE_MODES);
    const onSelect = (mode) => {
      emit("select", mode);
    };
    const onClose = () => {
      emit("close");
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onClose),
        b: common_vendor.f(modes.value, (mode, k0, i0) => {
          return {
            a: common_vendor.t(mode.label),
            b: common_vendor.t(mode.desc),
            c: mode.value,
            d: common_vendor.o(($event) => onSelect(mode), mode.value)
          };
        }),
        c: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e17c79a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/ModeSelector.js.map
