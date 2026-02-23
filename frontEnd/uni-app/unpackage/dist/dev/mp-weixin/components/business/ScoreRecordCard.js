"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_score = require("../../utils/score.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "ScoreRecordCard",
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ["click", "detail"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "ce06ae36": themeColor.value,
      "2d5e6b00": themeColor.value + "1A"
    }));
    const props = __props;
    const emit = __emit;
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const expanded = common_vendor.ref(false);
    const getModeLabel = (mode) => {
      const modes = {
        normal: "普通模式",
        simple: "简易模式",
        custom: "自定义"
      };
      return modes[mode] || mode;
    };
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
    const toggleExpand = () => {
      expanded.value = !expanded.value;
    };
    const onCardClick = () => {
      emit("click", props.record);
    };
    const onDetailClick = () => {
      emit("detail", props.record);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(utils_score.formatTime)(__props.record.createTime)),
        b: common_vendor.t(getModeLabel(__props.record.scoreMode)),
        c: common_vendor.t(common_vendor.unref(utils_score.getBowTypeName)(__props.record.bowType)),
        d: common_vendor.t(__props.record.distance),
        e: common_vendor.t(common_vendor.unref(utils_score.getTargetTypeName)(__props.record.targetType)),
        f: common_vendor.t(__props.record.groupNum),
        g: common_vendor.t(__props.record.arrowNum),
        h: common_vendor.t(__props.record.totalScore),
        i: expanded.value && __props.record.scoreMode !== "custom"
      }, expanded.value && __props.record.scoreMode !== "custom" ? {
        j: common_vendor.f(__props.record.groupScoreList, (group, index, i0) => {
          return {
            a: common_vendor.f(group.arrowScoreList, (score, sIndex, i1) => {
              return {
                a: common_vendor.t(score),
                b: sIndex,
                c: common_vendor.n(getScoreClass(score))
              };
            }),
            b: common_vendor.t(group.groupTotalScore),
            c: index
          };
        })
      } : {}, {
        k: __props.record.scoreMode !== "custom"
      }, __props.record.scoreMode !== "custom" ? {
        l: common_vendor.t(expanded.value ? "收起" : "展开"),
        m: common_vendor.t(expanded.value ? "▲" : "▼"),
        n: common_vendor.o(toggleExpand)
      } : {}, {
        o: common_vendor.o(onDetailClick),
        p: common_vendor.o(onCardClick),
        q: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-962cd50f"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/ScoreRecordCard.js.map
