"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_score = require("../../utils/score.js");
const utils_storage = require("../../utils/storage.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  (TargetConfigItem + Popup + GroupPicker)();
}
const Popup = () => "../../components/common/Popup.js";
const GroupPicker = () => "../../components/business/GroupPicker.js";
const TargetConfigItem = () => "../../components/business/TargetConfigItem.js";
const _sfc_main = {
  __name: "custom",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "71ff7ee2": themeColor.value
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
    const isMultiTarget = common_vendor.ref(false);
    const targetList = common_vendor.ref([
      { arrowNum: 6, distance: "30m", targetType: "80Full" }
    ]);
    const bowTypes = common_vendor.ref(utils_constants.BOW_TYPES);
    const distances = common_vendor.ref(utils_constants.DISTANCES);
    const targetTypes = common_vendor.ref(utils_constants.TARGET_TYPES);
    const showBowPicker = common_vendor.ref(false);
    const showDistancePicker = common_vendor.ref(false);
    const showTargetPicker = common_vendor.ref(false);
    const showGroupPicker = common_vendor.ref(false);
    const showTargetDetail = common_vendor.ref(false);
    const showPresetList = common_vendor.ref(false);
    const showSavePreset = common_vendor.ref(false);
    const customPresets = common_vendor.ref([]);
    const presetName = common_vendor.ref("");
    const getBowLabel = (value) => {
      const bow = bowTypes.value.find((b) => b.value === value);
      return bow ? bow.label : value;
    };
    const getTargetLabel = (value) => {
      const target = targetTypes.value.find((t) => t.value === value);
      return target ? target.label : value;
    };
    const onGroupConfirm = (data) => {
      config.groupNum = data.groupNum;
      config.arrowNum = data.arrowNum;
      showGroupPicker.value = false;
    };
    const addTarget = () => {
      if (targetList.value.length < 6) {
        targetList.value.push({
          arrowNum: 6,
          distance: "30m",
          targetType: "80Full"
        });
      }
    };
    const updateTarget = (index, data) => {
      targetList.value[index] = data;
    };
    const copyTarget = (index) => {
      if (targetList.value.length < 6) {
        targetList.value.push({ ...targetList.value[index] });
      }
    };
    const deleteTarget = (index) => {
      if (targetList.value.length > 1) {
        targetList.value.splice(index, 1);
      }
    };
    const loadPresets = () => {
      customPresets.value = utils_storage.getCustomPresets();
    };
    const loadPreset = (preset) => {
      Object.assign(config, preset.config);
      if (preset.config.targetList) {
        targetList.value = [...preset.config.targetList];
        isMultiTarget.value = targetList.value.length > 1;
      }
      showPresetList.value = false;
      common_vendor.index.showToast({ title: "预设已加载", icon: "success" });
    };
    const savePreset = () => {
      if (customPresets.value.length >= 3) {
        common_vendor.index.showToast({ title: "预设数量已达上限", icon: "none" });
        return;
      }
      presetName.value = "";
      showSavePreset.value = true;
    };
    const doSavePreset = () => {
      if (!presetName.value.trim()) {
        common_vendor.index.showToast({ title: "请输入预设名称", icon: "none" });
        return;
      }
      const preset = {
        presetId: utils_score.generateId(),
        name: presetName.value,
        description: `${config.groupNum}组/${config.arrowNum}箭`,
        config: {
          ...config,
          targetList: isMultiTarget.value ? [...targetList.value] : []
        }
      };
      utils_storage.addCustomPreset(preset).then(() => {
        loadPresets();
        showSavePreset.value = false;
        common_vendor.index.showToast({ title: "预设已保存", icon: "success" });
      }).catch((err) => {
        common_vendor.index.showToast({ title: err.message, icon: "none" });
      });
    };
    const deletePreset = (presetId) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该预设吗？",
        success: (res) => {
          if (res.confirm) {
            utils_storage.deleteCustomPreset(presetId).then(() => {
              loadPresets();
              common_vendor.index.showToast({ title: "已删除", icon: "success" });
            });
          }
        }
      });
    };
    const startScoring = () => {
      const customTargetList = isMultiTarget.value ? targetList.value.map((t, i) => ({
        targetIndex: i + 1,
        targetArrowNum: t.arrowNum,
        targetDistance: t.distance,
        targetType: t.targetType,
        targetPosition: { x: 0, y: 0 },
        targetTotalScore: 0
      })) : [];
      const record = {
        scoreRecordId: utils_score.generateId(),
        bowType: config.bowType,
        bowName: "",
        distance: isMultiTarget.value ? "" : config.distance,
        targetType: isMultiTarget.value ? "" : config.targetType,
        groupNum: config.groupNum,
        arrowNum: isMultiTarget.value ? targetList.value.reduce((sum, t) => sum + parseInt(t.arrowNum), 0) : config.arrowNum,
        totalArrowNum: config.groupNum * (isMultiTarget.value ? targetList.value.reduce((sum, t) => sum + parseInt(t.arrowNum), 0) : config.arrowNum),
        is11Score: config.is11Score,
        isTakePhoto: config.isTakePhoto,
        photoList: [],
        isTiming: config.isTiming,
        prepareTime: config.prepareTime,
        formalTime: config.formalTime,
        scoreMode: "custom",
        createTime: Date.now(),
        updateTime: Date.now(),
        groupScoreList: [],
        totalScore: 0,
        customTargetList,
        isSimpleMode: false,
        presetName: "",
        isCompleted: false,
        currentGroupIndex: 0
      };
      utils_storage.addScoreRecord(record);
      common_vendor.index.navigateTo({
        url: `/pages/score/scoring?id=${record.scoreRecordId}&mode=custom`
      });
    };
    loadPresets();
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
        b: common_vendor.o(($event) => showBowPicker.value = true),
        c: common_vendor.o(($event) => showGroupPicker.value = true),
        d: !isMultiTarget.value
      }, !isMultiTarget.value ? {
        e: common_vendor.t(config.distance),
        f: common_vendor.o(($event) => showDistancePicker.value = true)
      } : {}, {
        g: common_vendor.t(config.groupNum),
        h: config.is11Score,
        i: common_vendor.o((e) => config.is11Score = e.detail.value),
        j: themeColor.value,
        k: config.isTakePhoto,
        l: common_vendor.o((e) => config.isTakePhoto = e.detail.value),
        m: themeColor.value,
        n: config.isTiming,
        o: common_vendor.o((e) => config.isTiming = e.detail.value),
        p: themeColor.value,
        q: config.isTiming
      }, config.isTiming ? {
        r: config.prepareTime,
        s: common_vendor.o(($event) => config.prepareTime = $event.detail.value),
        t: config.formalTime,
        v: common_vendor.o(($event) => config.formalTime = $event.detail.value)
      } : {}, {
        w: !isMultiTarget.value ? 1 : "",
        x: common_vendor.o(($event) => isMultiTarget.value = false),
        y: isMultiTarget.value ? 1 : "",
        z: common_vendor.o(($event) => isMultiTarget.value = true),
        A: !isMultiTarget.value
      }, !isMultiTarget.value ? {
        B: common_vendor.t(getTargetLabel(config.targetType)),
        C: common_vendor.o(($event) => showTargetPicker.value = true),
        D: config.arrowNum,
        E: common_vendor.o(($event) => config.arrowNum = $event.detail.value)
      } : common_vendor.e({
        F: common_vendor.f(targetList.value, (target, index, i0) => {
          return {
            a: index,
            b: common_vendor.o((data) => updateTarget(index, data), index),
            c: common_vendor.o(copyTarget, index),
            d: common_vendor.o(deleteTarget, index),
            e: "4a27225b-0-" + i0,
            f: common_vendor.p({
              index: index + 1,
              config: target,
              showCopy: targetList.value.length < 6,
              showDelete: targetList.value.length > 1
            })
          };
        }),
        G: targetList.value.length < 6
      }, targetList.value.length < 6 ? {
        H: common_vendor.o(addTarget)
      } : {}, {
        I: common_vendor.o(($event) => showTargetDetail.value = true)
      }), {
        J: common_vendor.o(startScoring),
        K: common_vendor.o(savePreset),
        L: common_vendor.o(($event) => showPresetList.value = true),
        M: common_vendor.f(bowTypes.value, (bow, k0, i0) => {
          return {
            a: common_vendor.t(bow.label),
            b: config.bowType === bow.value ? 1 : "",
            c: bow.value,
            d: common_vendor.o(($event) => {
              config.bowType = bow.value;
              showBowPicker.value = false;
            }, bow.value)
          };
        }),
        N: common_vendor.o(($event) => showBowPicker.value = $event),
        O: common_vendor.p({
          title: "选择弓种",
          position: "bottom",
          showFooter: false,
          visible: showBowPicker.value
        }),
        P: common_vendor.f(distances.value, (d, k0, i0) => {
          return {
            a: common_vendor.t(d.label),
            b: config.distance === d.value ? 1 : "",
            c: d.value,
            d: common_vendor.o(($event) => config.distance = d.value, d.value)
          };
        }),
        Q: common_vendor.o(($event) => showDistancePicker.value = false),
        R: common_vendor.o(($event) => showDistancePicker.value = $event),
        S: common_vendor.p({
          title: "选择距离",
          position: "bottom",
          visible: showDistancePicker.value
        }),
        T: common_vendor.f(targetTypes.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.label),
            b: config.targetType === t.value ? 1 : "",
            c: t.value,
            d: common_vendor.o(($event) => {
              config.targetType = t.value;
              showTargetPicker.value = false;
            }, t.value)
          };
        }),
        U: common_vendor.o(($event) => showTargetPicker.value = $event),
        V: common_vendor.p({
          title: "选择靶面",
          position: "bottom",
          showFooter: false,
          visible: showTargetPicker.value
        }),
        W: common_vendor.o(onGroupConfirm),
        X: common_vendor.o(($event) => showGroupPicker.value = false),
        Y: common_vendor.p({
          defaultGroupNum: config.groupNum,
          defaultArrowNum: config.arrowNum
        }),
        Z: common_vendor.o(($event) => showGroupPicker.value = $event),
        aa: common_vendor.p({
          title: "",
          showHeader: false,
          showFooter: false,
          position: "center",
          visible: showGroupPicker.value
        }),
        ab: customPresets.value.length > 0
      }, customPresets.value.length > 0 ? {
        ac: common_vendor.f(customPresets.value, (preset, k0, i0) => {
          return {
            a: common_vendor.t(preset.name),
            b: common_vendor.t(preset.description),
            c: common_vendor.o(($event) => deletePreset(preset.presetId), preset.presetId),
            d: preset.presetId,
            e: common_vendor.o(($event) => loadPreset(preset), preset.presetId)
          };
        })
      } : {}, {
        ad: common_vendor.o(($event) => showPresetList.value = $event),
        ae: common_vendor.p({
          title: "加载预设",
          position: "bottom",
          showFooter: false,
          visible: showPresetList.value
        }),
        af: presetName.value,
        ag: common_vendor.o(($event) => presetName.value = $event.detail.value),
        ah: common_vendor.o(doSavePreset),
        ai: common_vendor.o(($event) => showSavePreset.value = $event),
        aj: common_vendor.p({
          title: "保存预设",
          visible: showSavePreset.value
        }),
        ak: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4a27225b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/custom.js.map
