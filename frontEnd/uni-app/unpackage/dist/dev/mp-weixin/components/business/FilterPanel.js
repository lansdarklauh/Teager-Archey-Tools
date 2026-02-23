"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "FilterPanel",
  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["apply", "reset", "close"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "4c536361": themeColor.value
    }));
    const emit = __emit;
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const enableTimeFilter = common_vendor.ref(false);
    const enableScoreFilter = common_vendor.ref(false);
    const timeType = common_vendor.ref("single");
    const startDate = common_vendor.ref("");
    const endDate = common_vendor.ref("");
    const scoreMin = common_vendor.ref(0);
    const scoreMax = common_vendor.ref(720);
    const minPercent = common_vendor.computed(() => scoreMin.value / 720 * 100);
    const maxPercent = common_vendor.computed(() => scoreMax.value / 720 * 100);
    const toggleTimeFilter = () => {
      enableTimeFilter.value = !enableTimeFilter.value;
    };
    const toggleScoreFilter = () => {
      enableScoreFilter.value = !enableScoreFilter.value;
    };
    const pickDate = (type) => {
      common_vendor.index.showToast({ title: "请选择日期", icon: "none" });
    };
    const onMinMove = (e) => {
    };
    const onMaxMove = (e) => {
    };
    const onReset = () => {
      enableTimeFilter.value = false;
      enableScoreFilter.value = false;
      timeType.value = "single";
      startDate.value = "";
      endDate.value = "";
      scoreMin.value = 0;
      scoreMax.value = 720;
      emit("reset");
    };
    const onApply = () => {
      const filter = {};
      if (enableTimeFilter.value) {
        if (timeType.value === "single" && startDate.value) {
          filter.startTime = new Date(startDate.value).getTime();
          filter.endTime = filter.startTime + 24 * 60 * 60 * 1e3;
        } else if (timeType.value === "range") {
          if (startDate.value)
            filter.startTime = new Date(startDate.value).getTime();
          if (endDate.value)
            filter.endTime = new Date(endDate.value).getTime() + 24 * 60 * 60 * 1e3;
        }
      }
      if (enableScoreFilter.value) {
        filter.scoreMin = scoreMin.value;
        filter.scoreMax = scoreMax.value;
      }
      emit("apply", filter);
    };
    const onClose = () => {
      emit("close");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onClose),
        b: enableTimeFilter.value
      }, enableTimeFilter.value ? {} : {}, {
        c: enableTimeFilter.value ? 1 : "",
        d: common_vendor.o(toggleTimeFilter),
        e: timeType.value === "single" ? 1 : "",
        f: common_vendor.o(($event) => timeType.value = "single"),
        g: timeType.value === "range" ? 1 : "",
        h: common_vendor.o(($event) => timeType.value = "range"),
        i: enableTimeFilter.value
      }, enableTimeFilter.value ? common_vendor.e({
        j: timeType.value === "single"
      }, timeType.value === "single" ? {
        k: common_vendor.t(startDate.value || "选择时间"),
        l: common_vendor.o(($event) => pickDate())
      } : {
        m: common_vendor.t(startDate.value || "开始日期"),
        n: common_vendor.o(($event) => pickDate()),
        o: common_vendor.t(endDate.value || "结束日期"),
        p: common_vendor.o(($event) => pickDate())
      }) : {}, {
        q: enableScoreFilter.value
      }, enableScoreFilter.value ? {} : {}, {
        r: enableScoreFilter.value ? 1 : "",
        s: common_vendor.o(toggleScoreFilter),
        t: enableScoreFilter.value
      }, enableScoreFilter.value ? {
        v: minPercent.value + "%",
        w: maxPercent.value - minPercent.value + "%",
        x: minPercent.value + "%",
        y: common_vendor.o(onMinMove),
        z: common_vendor.t(scoreMax.value),
        A: maxPercent.value + "%",
        B: common_vendor.o(onMaxMove),
        C: common_vendor.t(scoreMin.value),
        D: common_vendor.t(scoreMax.value)
      } : {}, {
        E: common_vendor.o(onReset),
        F: common_vendor.o(onApply),
        G: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2c938d93"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/FilterPanel.js.map
