"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_statistics = require("../../utils/statistics.js");
const utils_score = require("../../utils/score.js");
const utils_theme = require("../../utils/theme.js");
const utils_constants = require("../../utils/constants.js");
const utils_number = require("../../utils/number.js");
const utils_date = require("../../utils/date.js");
if (!Array) {
  const _easycom_qiun_data_charts2 = common_vendor.resolveComponent("qiun-data-charts");
  _easycom_qiun_data_charts2();
}
const _easycom_qiun_data_charts = () => "../../uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.js";
if (!Math) {
  _easycom_qiun_data_charts();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "4af8cf5f": themeColor.value
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const records = common_vendor.ref([]);
    const timeRange = common_vendor.ref("all");
    const ringChartType = common_vendor.ref("column");
    const filteredRecords = common_vendor.computed(() => {
      return utils_statistics.getRecordsByTimeRange(records.value, timeRange.value);
    });
    const statistics = common_vendor.computed(() => {
      return utils_statistics.calculateStatistics(filteredRecords.value);
    });
    const xTenRate = common_vendor.computed(() => {
      if (statistics.value.totalArrows === 0)
        return 0;
      const rate = (statistics.value.xTotal + statistics.value.tenTotal) / statistics.value.totalArrows * 100;
      return Math.round(rate * 100) / 100;
    });
    const recentRecords = common_vendor.computed(() => {
      return filteredRecords.value.slice(0, 5);
    });
    const ringChartData = common_vendor.computed(() => {
      const dist = statistics.value.ringDistribution || {};
      const categories = ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"];
      const data = categories.map((key) => ({
        value: dist[key] || 0,
        color: utils_constants.RING_COLORS[key] || "#999"
      }));
      return {
        categories,
        series: [{ name: "环数", data }]
      };
    });
    const ringPieChartData = common_vendor.computed(() => {
      const dist = statistics.value.ringDistribution || {};
      const rings = ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"];
      const pieData = rings.filter((key) => (dist[key] || 0) > 0).map((key) => ({
        name: key,
        value: dist[key],
        color: utils_constants.RING_COLORS[key] || "#999"
      }));
      return {
        categories: [],
        series: [{ name: "环数", data: pieData }]
      };
    });
    const hasRingData = common_vendor.computed(() => {
      const dist = statistics.value.ringDistribution || {};
      return Object.values(dist).some((v) => v > 0);
    });
    const ringColumnOpts = common_vendor.computed(() => ({
      color: ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"].map(
        (r) => utils_constants.RING_COLORS[r]
      ),
      padding: [15, 10, 0, 15],
      dataLabel: true,
      xAxis: { disableGrid: true },
      yAxis: { gridType: "dash" },
      extra: {
        column: {
          type: "group",
          width: 26,
          meterBorder: 1,
          meterFillColor: "#FFFFFF"
        }
      }
    }));
    const ringPieOpts = common_vendor.computed(() => ({
      color: ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"].map(
        (r) => utils_constants.RING_COLORS[r]
      ),
      padding: [5, 5, 5, 5],
      dataLabel: true,
      legend: { show: true, position: "right" }
    }));
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
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
      return common_vendor.e({
        a: common_vendor.t(statistics.value.totalRecords),
        b: common_vendor.t(common_vendor.unref(utils_number.formatDecimal2)(statistics.value.avgScore)),
        c: common_vendor.t(statistics.value.maxScore),
        d: common_vendor.t(common_vendor.unref(utils_number.formatDecimal2)(statistics.value.arrowAvg)),
        e: timeRange.value === "all" ? 1 : "",
        f: common_vendor.o(($event) => timeRange.value = "all"),
        g: timeRange.value === "today" ? 1 : "",
        h: common_vendor.o(($event) => timeRange.value = "today"),
        i: timeRange.value === "week" ? 1 : "",
        j: common_vendor.o(($event) => timeRange.value = "week"),
        k: timeRange.value === "month" ? 1 : "",
        l: common_vendor.o(($event) => timeRange.value = "month"),
        m: common_vendor.t(statistics.value.totalScore),
        n: common_vendor.t(common_vendor.unref(utils_number.formatDecimal2)(statistics.value.medianScore)),
        o: common_vendor.t(statistics.value.modeScore),
        p: common_vendor.t(statistics.value.minScore),
        q: common_vendor.t(statistics.value.totalArrows),
        r: common_vendor.t(statistics.value.xTotal),
        s: common_vendor.t(statistics.value.tenTotal),
        t: common_vendor.t(common_vendor.unref(utils_number.formatDecimal2)(xTenRate.value)),
        v: hasRingData.value
      }, hasRingData.value ? common_vendor.e({
        w: ringChartType.value === "column" ? 1 : "",
        x: common_vendor.o(($event) => ringChartType.value = "column"),
        y: ringChartType.value === "pie" ? 1 : "",
        z: common_vendor.o(($event) => ringChartType.value = "pie"),
        A: ringChartType.value === "column"
      }, ringChartType.value === "column" ? {
        B: common_vendor.p({
          type: "column",
          chartData: ringChartData.value,
          opts: ringColumnOpts.value
        })
      } : {
        C: common_vendor.p({
          type: "pie",
          chartData: ringPieChartData.value,
          opts: ringPieOpts.value
        })
      }) : {}, {
        D: common_vendor.f(recentRecords.value, (record, k0, i0) => {
          return {
            a: common_vendor.t(record.totalScore),
            b: common_vendor.t(common_vendor.unref(utils_date.formatTime)(record.createTime)),
            c: common_vendor.t(getBowLabel(record.bowType)),
            d: common_vendor.t(record.distance),
            e: record.scoreRecordId,
            f: common_vendor.o(($event) => goToDetail(record), record.scoreRecordId)
          };
        }),
        E: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6e199430"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/statistics/index.js.map
