"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_theme = require("../../utils/theme.js");
const utils_date = require("../../utils/date.js");
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
    const datePickerStart = common_vendor.computed(() => {
      const d = /* @__PURE__ */ new Date();
      d.setFullYear(d.getFullYear() - 1);
      return utils_date.formatDate(d.getTime(), "YYYY-MM-DD");
    });
    const datePickerEnd = common_vendor.computed(() => {
      return utils_date.formatDate(Date.now(), "YYYY-MM-DD");
    });
    const onDateChange = (type, e) => {
      var _a;
      const val = ((_a = e.detail) == null ? void 0 : _a.value) || e;
      if (type === "start") {
        startDate.value = val;
      } else {
        endDate.value = val;
      }
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
          filter.startTime = utils_date.parseToTimestamp(startDate.value);
          filter.endTime = filter.startTime + 24 * 60 * 60 * 1e3;
        } else if (timeType.value === "range") {
          if (startDate.value)
            filter.startTime = utils_date.parseToTimestamp(startDate.value);
          if (endDate.value)
            filter.endTime = utils_date.parseToTimestamp(endDate.value) + 24 * 60 * 60 * 1e3;
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
        k: common_vendor.t(startDate.value || "选择日期"),
        l: startDate.value,
        m: datePickerStart.value,
        n: datePickerEnd.value,
        o: common_vendor.o(($event) => onDateChange("start", $event))
      } : {
        p: common_vendor.t(startDate.value || "开始日期"),
        q: startDate.value,
        r: datePickerStart.value,
        s: endDate.value || datePickerEnd.value,
        t: common_vendor.o(($event) => onDateChange("start", $event)),
        v: common_vendor.t(endDate.value || "结束日期"),
        w: endDate.value,
        x: startDate.value || datePickerStart.value,
        y: datePickerEnd.value,
        z: common_vendor.o(($event) => onDateChange("end", $event))
      }) : {}, {
        A: enableScoreFilter.value
      }, enableScoreFilter.value ? {} : {}, {
        B: enableScoreFilter.value ? 1 : "",
        C: common_vendor.o(toggleScoreFilter),
        D: enableScoreFilter.value
      }, enableScoreFilter.value ? {
        E: minPercent.value + "%",
        F: maxPercent.value - minPercent.value + "%",
        G: minPercent.value + "%",
        H: common_vendor.o(onMinMove),
        I: common_vendor.t(scoreMax.value),
        J: maxPercent.value + "%",
        K: common_vendor.o(onMaxMove),
        L: common_vendor.t(scoreMin.value),
        M: common_vendor.t(scoreMax.value)
      } : {}, {
        N: common_vendor.o(onReset),
        O: common_vendor.o(onApply),
        P: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2c938d93"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/FilterPanel.js.map
