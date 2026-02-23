"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_statistics = require("../../utils/statistics.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  (ScoreRecordCard + ModeSelector + Popup + FilterPanel)();
}
const Popup = () => "../../components/common/Popup.js";
const ModeSelector = () => "../../components/business/ModeSelector.js";
const FilterPanel = () => "../../components/business/FilterPanel.js";
const ScoreRecordCard = () => "../../components/business/ScoreRecordCard.js";
const _sfc_main = {
  __name: "index",
  setup(__props, { expose: __expose }) {
    common_vendor.useCssVars((_ctx) => ({
      "be3a4cb0": themeColor.value,
      "20b11706": themeColor.value + "4D",
      "20b12e46": themeColor.value + "1A"
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const records = common_vendor.ref([]);
    const showModeSelector = common_vendor.ref(false);
    const showFilterPanel = common_vendor.ref(false);
    const showSortPanel = common_vendor.ref(false);
    const filterCondition = common_vendor.ref({});
    const sortCondition = common_vendor.ref({
      sortType: "time",
      sortOrder: "desc"
    });
    const filteredRecords = common_vendor.computed(() => {
      let result = [...records.value];
      if (Object.keys(filterCondition.value).length > 0) {
        result = utils_statistics.filterRecords(result, filterCondition.value);
      }
      result = utils_statistics.sortRecords(
        result,
        sortCondition.value.sortType,
        sortCondition.value.sortOrder
      );
      return result;
    });
    const loadRecords = () => {
      records.value = utils_storage.getScoreRecords();
    };
    const onModeSelect = (mode) => {
      showModeSelector.value = false;
      if (mode.value === "simple") {
        common_vendor.index.navigateTo({ url: "/pages/score/simple" });
      } else if (mode.value === "normal") {
        common_vendor.index.navigateTo({ url: "/pages/score/normal" });
      } else if (mode.value === "custom") {
        common_vendor.index.navigateTo({ url: "/pages/score/custom" });
      }
    };
    const onRecordClick = (record) => {
    };
    const onDetailClick = (record) => {
      common_vendor.index.navigateTo({
        url: `/pages/score/detail?id=${record.scoreRecordId}`
      });
    };
    const onFilterApply = (filter) => {
      filterCondition.value = filter;
      showFilterPanel.value = false;
    };
    const onFilterReset = () => {
      filterCondition.value = {};
    };
    const setSortCondition = (type, order) => {
      sortCondition.value = { sortType: type, sortOrder: order };
    };
    const onSortConfirm = () => {
      showSortPanel.value = false;
    };
    common_vendor.onMounted(() => {
      loadRecords();
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    const onPageShow = () => {
      loadRecords();
    };
    __expose({
      onShow: onPageShow
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showModeSelector.value = true),
        b: common_vendor.o(($event) => showFilterPanel.value = true),
        c: common_vendor.o(($event) => showSortPanel.value = true),
        d: records.value.length > 0
      }, records.value.length > 0 ? {
        e: common_vendor.f(filteredRecords.value, (record, k0, i0) => {
          return {
            a: record.scoreRecordId,
            b: common_vendor.o(onRecordClick, record.scoreRecordId),
            c: common_vendor.o(onDetailClick, record.scoreRecordId),
            d: "1cf27b2a-0-" + i0,
            e: common_vendor.p({
              record
            })
          };
        })
      } : {}, {
        f: common_vendor.o(onModeSelect),
        g: common_vendor.o(($event) => showModeSelector.value = false),
        h: common_vendor.o(($event) => showModeSelector.value = $event),
        i: common_vendor.p({
          title: "",
          showHeader: false,
          showFooter: false,
          position: "center",
          visible: showModeSelector.value
        }),
        j: common_vendor.o(onFilterApply),
        k: common_vendor.o(onFilterReset),
        l: common_vendor.o(($event) => showFilterPanel.value = false),
        m: common_vendor.p({
          filter: filterCondition.value
        }),
        n: common_vendor.o(($event) => showFilterPanel.value = $event),
        o: common_vendor.p({
          title: "",
          showHeader: false,
          showFooter: false,
          position: "center",
          visible: showFilterPanel.value
        }),
        p: sortCondition.value.sortType === "time" && sortCondition.value.sortOrder === "desc" ? 1 : "",
        q: common_vendor.o(($event) => setSortCondition("time", "desc")),
        r: sortCondition.value.sortType === "time" && sortCondition.value.sortOrder === "asc" ? 1 : "",
        s: common_vendor.o(($event) => setSortCondition("time", "asc")),
        t: sortCondition.value.sortType === "score" && sortCondition.value.sortOrder === "desc" ? 1 : "",
        v: common_vendor.o(($event) => setSortCondition("score", "desc")),
        w: sortCondition.value.sortType === "score" && sortCondition.value.sortOrder === "asc" ? 1 : "",
        x: common_vendor.o(($event) => setSortCondition("score", "asc")),
        y: common_vendor.o(onSortConfirm),
        z: common_vendor.o(($event) => showSortPanel.value = $event),
        A: common_vendor.p({
          title: "排序方式",
          position: "bottom",
          visible: showSortPanel.value
        }),
        B: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
