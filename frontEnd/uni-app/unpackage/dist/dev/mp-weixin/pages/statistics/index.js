"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_statistics = require("../../utils/statistics.js");
const utils_score = require("../../utils/score.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "4af8cf5f": themeColor.value
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const records = common_vendor.ref([]);
    const timeRange = common_vendor.ref("all");
    const filteredRecords = common_vendor.computed(() => {
      return utils_statistics.getRecordsByTimeRange(records.value, timeRange.value);
    });
    const statistics = common_vendor.computed(() => {
      return utils_statistics.calculateStatistics(filteredRecords.value);
    });
    const xTenRate = common_vendor.computed(() => {
      if (statistics.value.totalArrows === 0)
        return 0;
      return Math.round(
        (statistics.value.xTotal + statistics.value.tenTotal) / statistics.value.totalArrows * 100
      );
    });
    const recentRecords = common_vendor.computed(() => {
      return filteredRecords.value.slice(0, 5);
    });
    const maxRingCount = common_vendor.computed(() => {
      return Math.max(...Object.values(statistics.value.ringDistribution || {}), 1);
    });
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
    const getRingWidth = (count) => {
      return Math.max(count / maxRingCount.value * 100, 10);
    };
    const goToDetail = (record) => {
      common_vendor.index.navigateTo({
        url: `/pages/score/detail?id=${record.scoreRecordId}`
      });
    };
    const loadRecords = () => {
      records.value = utils_storage.getScoreRecords();
    };
    common_vendor.onMounted(() => {
      loadRecords();
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("themeColorChange");
    });
    common_vendor.watch(timeRange, () => {
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(statistics.value.totalRecords),
        b: common_vendor.t(statistics.value.avgScore),
        c: common_vendor.t(statistics.value.maxScore),
        d: common_vendor.t(statistics.value.arrowAvg),
        e: timeRange.value === "all" ? 1 : "",
        f: common_vendor.o(($event) => timeRange.value = "all"),
        g: timeRange.value === "today" ? 1 : "",
        h: common_vendor.o(($event) => timeRange.value = "today"),
        i: timeRange.value === "week" ? 1 : "",
        j: common_vendor.o(($event) => timeRange.value = "week"),
        k: timeRange.value === "month" ? 1 : "",
        l: common_vendor.o(($event) => timeRange.value = "month"),
        m: common_vendor.t(statistics.value.totalScore),
        n: common_vendor.t(statistics.value.medianScore),
        o: common_vendor.t(statistics.value.modeScore),
        p: common_vendor.t(statistics.value.minScore),
        q: common_vendor.t(statistics.value.totalArrows),
        r: common_vendor.t(statistics.value.xTotal),
        s: common_vendor.t(statistics.value.tenTotal),
        t: common_vendor.t(xTenRate.value),
        v: common_vendor.f(statistics.value.ringDistribution, (item, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(item),
            c: getRingWidth(item) + "%",
            d: key,
            e: item > 0
          };
        }),
        w: common_vendor.f(recentRecords.value, (record, k0, i0) => {
          return {
            a: common_vendor.t(record.totalScore),
            b: common_vendor.t(common_vendor.unref(utils_score.formatTime)(record.createTime)),
            c: common_vendor.t(getBowLabel(record.bowType)),
            d: common_vendor.t(record.distance),
            e: record.scoreRecordId,
            f: common_vendor.o(($event) => goToDetail(record), record.scoreRecordId)
          };
        }),
        x: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e199430"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/statistics/index.js.map
