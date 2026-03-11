"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_score = require("../../utils/score.js");
const utils_storage = require("../../utils/storage.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  (Popup + GroupPicker)();
}
const Popup = () => "../../components/common/Popup.js";
const GroupPicker = () => "../../components/business/GroupPicker.js";
const _sfc_main = {
  __name: "normal",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "0073a94c": themeColor.value,
      "15282787": themeColor.value + "0D",
      "1528368b": themeColor.value + "4D"
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const config = common_vendor.reactive({
      bowType: "americanHuntingBow",
      distance: "30m",
      targetType: "80Full",
      groupNum: 6,
      arrowNum: 6,
      is11Score: false,
      isTakePhoto: false,
      isTiming: false,
      prepareTime: 10,
      formalTime: 120
    });
    const bowTypes = common_vendor.ref(utils_constants.BOW_TYPES);
    const distances = common_vendor.ref(utils_constants.DISTANCES);
    const targetTypes = common_vendor.ref(utils_constants.TARGET_TYPES);
    const showBowPicker = common_vendor.ref(false);
    const showDistancePicker = common_vendor.ref(false);
    const showTargetPicker = common_vendor.ref(false);
    const showGroupPicker = common_vendor.ref(false);
    const customDistance = common_vendor.ref("");
    const getBowLabel = (value) => {
      const bow = bowTypes.value.find((b) => b.value === value);
      return bow ? bow.label : value;
    };
    const getTargetLabel = (value) => {
      const target = targetTypes.value.find((t) => t.value === value);
      return target ? target.label : value;
    };
    const selectBow = (bow) => {
      config.bowType = bow.value;
      showBowPicker.value = false;
    };
    const selectDistance = (d) => {
      config.distance = d.value;
      customDistance.value = "";
    };
    const onDistanceConfirm = () => {
      if (customDistance.value) {
        config.distance = customDistance.value + "m";
      }
      showDistancePicker.value = false;
    };
    const selectTarget = (t) => {
      config.targetType = t.value;
      showTargetPicker.value = false;
    };
    const onGroupConfirm = (data) => {
      config.groupNum = data.groupNum;
      config.arrowNum = data.arrowNum;
      showGroupPicker.value = false;
    };
    const onIs11ScoreChange = (e) => {
      config.is11Score = e.detail.value;
    };
    const onIsTimingChange = (e) => {
      config.isTiming = e.detail.value;
    };
    const startScoring = () => {
      utils_storage.clearScoringCache();
      doStartScoring();
    };
    const doStartScoring = () => {
      const record = utils_score.createScoreRecord({
        ...config,
        scoreMode: "normal"
      });
      utils_storage.setScoringCache({
        scoreRecordId: record.scoreRecordId,
        mode: "normal",
        record: { ...record, groupScoreList: [], currentGroupIndex: 0 }
      });
      common_vendor.index.reLaunch({
        url: `/pages/score/scoring?id=${record.scoreRecordId}&mode=normal`
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("themeColorChange");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(getBowLabel(config.bowType)),
        b: showBowPicker.value ? 1 : "",
        c: common_vendor.o(($event) => showBowPicker.value = true),
        d: common_vendor.t(config.distance),
        e: showDistancePicker.value ? 1 : "",
        f: common_vendor.o(($event) => showDistancePicker.value = true),
        g: common_vendor.t(getTargetLabel(config.targetType)),
        h: showTargetPicker.value ? 1 : "",
        i: common_vendor.o(($event) => showTargetPicker.value = true),
        j: showGroupPicker.value ? 1 : "",
        k: common_vendor.o(($event) => showGroupPicker.value = true),
        l: common_vendor.t(config.groupNum),
        m: common_vendor.t(config.arrowNum),
        n: common_vendor.t(config.groupNum * config.arrowNum),
        o: config.is11Score,
        p: common_vendor.o(onIs11ScoreChange),
        q: themeColor.value,
        r: config.isTiming,
        s: common_vendor.o(onIsTimingChange),
        t: themeColor.value,
        v: config.isTiming
      }, config.isTiming ? {
        w: config.prepareTime,
        x: common_vendor.o(($event) => config.prepareTime = $event.detail.value),
        y: config.formalTime,
        z: common_vendor.o(($event) => config.formalTime = $event.detail.value)
      } : {}, {
        A: common_vendor.o(startScoring),
        B: common_vendor.f(bowTypes.value, (bow, k0, i0) => {
          return {
            a: common_vendor.t(bow.label),
            b: config.bowType === bow.value ? 1 : "",
            c: bow.value,
            d: common_vendor.o(($event) => selectBow(bow), bow.value)
          };
        }),
        C: common_vendor.o(($event) => showBowPicker.value = $event),
        D: common_vendor.p({
          title: "选择弓种",
          position: "bottom",
          showFooter: false,
          visible: showBowPicker.value
        }),
        E: common_vendor.f(distances.value, (d, k0, i0) => {
          return {
            a: common_vendor.t(d.label),
            b: config.distance === d.value ? 1 : "",
            c: d.value,
            d: common_vendor.o(($event) => selectDistance(d), d.value)
          };
        }),
        F: customDistance.value,
        G: common_vendor.o(($event) => customDistance.value = $event.detail.value),
        H: common_vendor.o(onDistanceConfirm),
        I: common_vendor.o(($event) => showDistancePicker.value = $event),
        J: common_vendor.p({
          title: "选择距离",
          position: "bottom",
          visible: showDistancePicker.value
        }),
        K: common_vendor.f(targetTypes.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.label),
            b: config.targetType === t.value ? 1 : "",
            c: t.value,
            d: common_vendor.o(($event) => selectTarget(t), t.value)
          };
        }),
        L: common_vendor.o(($event) => showTargetPicker.value = $event),
        M: common_vendor.p({
          title: "选择靶面",
          position: "bottom",
          showFooter: false,
          visible: showTargetPicker.value
        }),
        N: common_vendor.o(onGroupConfirm),
        O: common_vendor.o(($event) => showGroupPicker.value = false),
        P: common_vendor.p({
          defaultGroupNum: config.groupNum,
          defaultArrowNum: config.arrowNum
        }),
        Q: common_vendor.o(($event) => showGroupPicker.value = $event),
        R: common_vendor.p({
          title: "",
          showHeader: false,
          showFooter: false,
          position: "center",
          visible: showGroupPicker.value
        }),
        S: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d99e6cfb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/normal.js.map
