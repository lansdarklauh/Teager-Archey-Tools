"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_score = require("../../utils/score.js");
const utils_statistics = require("../../utils/statistics.js");
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
      return record.value.groupScoreList.reduce((sum, g) => sum + g.groupTotalScore, 0) / record.value.groupScoreList.length || 0;
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
    const maxCount = common_vendor.computed(() => {
      return Math.max(...ringDistribution.value.map((item) => item.count), 1);
    });
    const yAxisLabels = common_vendor.computed(() => {
      const max = maxCount.value;
      return [
        max,
        Math.round(max * 0.75),
        Math.round(max * 0.5),
        Math.round(max * 0.25),
        0
      ].reverse();
    });
    const getModeLabel = (mode) => {
      const modes = { normal: "普通模式", simple: "简易模式", custom: "自定义" };
      return modes[mode] || mode;
    };
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
    const getTargetLabel = (value) => utils_score.getTargetTypeName(value);
    const getScoreClass = (score) => {
      if (score === "X" || score === "10")
        return "score-gold";
      if (score === "9" || score === "8")
        return "score-red";
      if (score === "7" || score === "6")
        return "score-blue";
      if (score === "M")
        return "score-miss";
      return "score-default";
    };
    const getBarClass = (ring) => {
      if (ring === "X" || ring === "10" || ring === "9")
        return "bar-gold";
      if (ring === "8" || ring === "7")
        return "bar-red";
      if (ring === "6" || ring === "5")
        return "bar-blue";
      if (ring === "M")
        return "bar-miss";
      return "bar-default";
    };
    const getBarHeight = (count) => {
      if (count === 0)
        return 0;
      return Math.max(count / maxCount.value * 200, 10);
    };
    const getPercent = (count) => {
      if (totalArrows.value === 0)
        return 0;
      return Math.round(count / totalArrows.value * 100);
    };
    const getPointPosition = (score) => {
      const maxScore = Math.max(
        ...record.value.groupScoreList.map((g) => g.groupTotalScore),
        60
      );
      return score / maxScore * 150;
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
        b: common_vendor.t(common_vendor.unref(utils_score.formatTime)(record.value.createTime)),
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
        n: record.value.scoreMode !== "custom"
      }, record.value.scoreMode !== "custom" ? common_vendor.e({
        o: chartType.value === "bar" ? 1 : "",
        p: common_vendor.o(($event) => chartType.value = "bar"),
        q: chartType.value === "pie" ? 1 : "",
        r: common_vendor.o(($event) => chartType.value = "pie"),
        s: chartType.value === "bar"
      }, chartType.value === "bar" ? {
        t: common_vendor.f(yAxisLabels.value, (y, k0, i0) => {
          return {
            a: common_vendor.t(y),
            b: y
          };
        }),
        v: common_vendor.f(ringDistribution.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.count > 0
          }, item.count > 0 ? {
            b: common_vendor.t(item.count)
          } : {}, {
            c: common_vendor.n(getBarClass(item.ring)),
            d: getBarHeight(item.count) + "rpx",
            e: common_vendor.t(item.ring),
            f: item.ring
          });
        })
      } : {
        w: common_vendor.f(ringDistribution.value, (item, k0, i0) => {
          return {
            a: common_vendor.n(getBarClass(item.ring)),
            b: common_vendor.t(item.ring),
            c: common_vendor.t(item.count),
            d: common_vendor.t(getPercent(item.count)),
            e: item.ring,
            f: item.count > 0
          };
        })
      }) : {}, {
        x: record.value.scoreMode !== "custom"
      }, record.value.scoreMode !== "custom" ? {
        y: common_vendor.f(record.value.groupScoreList, (group, index, i0) => {
          return {
            a: common_vendor.t(group.groupTotalScore),
            b: getPointPosition(group.groupTotalScore) + "rpx",
            c: common_vendor.t(index + 1),
            d: index
          };
        })
      } : {}, {
        z: common_vendor.o(onShare),
        A: common_vendor.o(onDelete)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94f38bce"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/detail.js.map
