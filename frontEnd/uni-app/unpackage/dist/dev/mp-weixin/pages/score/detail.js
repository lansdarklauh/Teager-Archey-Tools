"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_score = require("../../utils/score.js");
const utils_statistics = require("../../utils/statistics.js");
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
  __name: "detail",
  setup(__props) {
    const record = common_vendor.ref({
      scoreRecordId: "",
      bowType: "",
      distance: "",
      targetType: "",
      groupNum: 0,
      arrowNum: 0,
      totalArrowNum: 0,
      is11Score: false,
      scoreMode: "normal",
      createTime: 0,
      groupScoreList: [],
      totalScore: 0
    });
    const chartType = common_vendor.ref("bar");
    const arrowAverage = common_vendor.computed(() => {
      return utils_score.calculateArrowAverage(
        record.value.totalScore,
        record.value.totalArrowNum
      );
    });
    const totalGroupScore = common_vendor.computed(() => {
      const list = record.value.groupScoreList;
      if (!list || list.length === 0)
        return "0.00";
      const sum = list.reduce((s, g) => s + (g.groupTotalScore || 0), 0);
      return utils_number.formatDecimal2(sum / list.length);
    });
    const totalX = common_vendor.computed(() => {
      return record.value.groupScoreList.reduce(
        (sum, g) => sum + (g.xCount || 0),
        0
      );
    });
    const totalXTen = common_vendor.computed(() => {
      return record.value.groupScoreList.reduce(
        (sum, g) => sum + (g.xCount || 0) + (g.tenCount || 0),
        0
      );
    });
    const ringDistribution = common_vendor.computed(() => {
      return utils_statistics.generateRingDistribution(record.value);
    });
    const totalArrows = common_vendor.computed(() => {
      return ringDistribution.value.reduce((sum, item) => sum + item.count, 0);
    });
    const ringColumnChartData = common_vendor.computed(() => {
      const dist = ringDistribution.value;
      const categories = dist.map((d) => d.ring);
      const data = dist.map((d) => ({
        value: d.count,
        color: utils_constants.RING_COLORS[d.ring] || "#999"
      }));
      return {
        categories,
        series: [{ name: "环数", data }]
      };
    });
    const ringPieChartData = common_vendor.computed(() => {
      const dist = ringDistribution.value.filter((d) => d.count > 0);
      return {
        categories: [],
        series: [
          {
            name: "环数",
            data: dist.map((d) => ({
              name: d.ring,
              value: d.count,
              color: utils_constants.RING_COLORS[d.ring] || "#999"
            }))
          }
        ]
      };
    });
    const groupLineChartData = common_vendor.computed(() => {
      const groups = record.value.groupScoreList || [];
      const categories = groups.map((_, i) => String(i + 1));
      const data = groups.map((g) => g.groupTotalScore || 0);
      return {
        categories,
        series: [{ name: "组分", data }]
      };
    });
    const hasRingData = common_vendor.computed(() => totalArrows.value > 0);
    const hasGroupData = common_vendor.computed(
      () => record.value.groupScoreList && record.value.groupScoreList.length > 0
    );
    const ringColumnOpts = {
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
          width: 20,
          meterBorder: 1,
          meterFillColor: "#FFFFFF"
        }
      }
    };
    const ringPieOpts = {
      color: ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"].map(
        (r) => utils_constants.RING_COLORS[r]
      ),
      padding: [5, 5, 5, 5],
      dataLabel: true,
      legend: { show: true, position: "right" }
    };
    const groupLineOpts = {
      color: ["#00c853"],
      padding: [15, 10, 0, 15],
      dataLabel: true,
      xAxis: { disableGrid: true },
      yAxis: { gridType: "dash" },
      extra: { line: { type: "curve", width: 2 } }
    };
    const getModeLabel = (mode) => {
      const modes = { normal: "普通模式", simple: "简易模式", custom: "自定义" };
      return modes[mode] || mode;
    };
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
    const getTargetLabel = (value) => utils_score.getTargetTypeName(value);
    const getScoreClass = (score) => {
      if (score === "X" || score === "10" || score === "9")
        return "score-gold";
      if (score === "8" || score === "7")
        return "score-red";
      if (score === "6" || score === "5")
        return "score-blue";
      if (score === "4" || score === "3")
        return "score-black";
      if (score === "2" || score === "1")
        return "score-white";
      if (score === "M")
        return "score-miss";
      return "score-default";
    };
    const onShare = () => {
      common_vendor.index.showToast({ title: "分享功能开发中", icon: "none" });
    };
    const onDelete = () => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条计分记录吗？删除后无法恢复。",
        success: (res) => {
          if (res.confirm) {
            utils_storage.deleteScoreRecord(record.value.scoreRecordId).then(() => {
              common_vendor.index.showToast({ title: "已删除", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
                common_vendor.index.$emit("refreshScoreList");
              }, 1500);
            });
          }
        }
      });
    };
    const loadRecord = () => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = ((_a = currentPage.$page) == null ? void 0 : _a.options) || currentPage.options || {};
      const id = options.id || "";
      if (id) {
        const data = utils_storage.getScoreRecordById(id);
        if (data) {
          record.value = data;
        }
      }
    };
    common_vendor.onMounted(() => {
      loadRecord();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(record.value.totalScore),
        b: common_vendor.t(common_vendor.unref(utils_date.formatTime)(record.value.createTime)),
        c: common_vendor.t(getModeLabel(record.value.scoreMode)),
        d: common_vendor.t(getBowLabel(record.value.bowType)),
        e: common_vendor.t(record.value.distance),
        f: common_vendor.t(getTargetLabel(record.value.targetType)),
        g: common_vendor.t(record.value.is11Score ? "11分" : "10分"),
        h: common_vendor.f(record.value.groupScoreList, (group, index, i0) => {
          return {
            a: common_vendor.f(group.arrowScoreList, (score, sIndex, i1) => {
              return {
                a: common_vendor.t(score),
                b: common_vendor.n(getScoreClass(score)),
                c: sIndex
              };
            }),
            b: common_vendor.t(group.groupTotalScore),
            c: common_vendor.t(group.accumulateScore),
            d: common_vendor.t(group.xCount + group.tenCount),
            e: common_vendor.t(group.xCount),
            f: index
          };
        }),
        i: common_vendor.t(arrowAverage.value),
        j: common_vendor.t(totalGroupScore.value),
        k: common_vendor.t(record.value.totalScore),
        l: common_vendor.t(totalXTen.value),
        m: common_vendor.t(totalX.value),
        n: record.value.scoreMode !== "custom" && hasRingData.value
      }, record.value.scoreMode !== "custom" && hasRingData.value ? common_vendor.e({
        o: chartType.value === "bar" ? 1 : "",
        p: common_vendor.o(($event) => chartType.value = "bar"),
        q: chartType.value === "pie" ? 1 : "",
        r: common_vendor.o(($event) => chartType.value = "pie"),
        s: chartType.value === "bar"
      }, chartType.value === "bar" ? {
        t: common_vendor.p({
          type: "column",
          chartData: ringColumnChartData.value,
          opts: ringColumnOpts
        })
      } : {
        v: common_vendor.p({
          type: "pie",
          chartData: ringPieChartData.value,
          opts: ringPieOpts
        })
      }) : {}, {
        w: record.value.scoreMode !== "custom" && hasGroupData.value
      }, record.value.scoreMode !== "custom" && hasGroupData.value ? {
        x: common_vendor.p({
          type: "line",
          chartData: groupLineChartData.value,
          opts: groupLineOpts
        })
      } : {}, {
        y: common_vendor.o(onShare),
        z: common_vendor.o(onDelete)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94f38bce"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/detail.js.map
