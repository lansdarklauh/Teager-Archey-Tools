"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_score = require("../../utils/score.js");
const utils_storage = require("../../utils/storage.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  (ScoreKeyboard + Popup)();
}
const ScoreKeyboard = () => "../../components/common/ScoreKeyboard.js";
const Popup = () => "../../components/common/Popup.js";
const _sfc_main = {
  __name: "simple",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "17451596": themeColor.value + "1A",
      "2e0b8050": themeColor.value,
      "4d5eab7d": currentThemeColor.value,
      "174509f6": themeColor.value + "33"
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const currentThemeColor = common_vendor.computed(() => themeColor.value);
    const config = common_vendor.reactive({
      bowType: "americanHuntingBow",
      distance: "30m",
      targetType: "80Full",
      groupNum: 6,
      arrowNum: 6,
      is11Score: false
    });
    const bowTypes = common_vendor.ref(utils_constants.BOW_TYPES);
    const distances = common_vendor.ref(utils_constants.DISTANCES);
    const targetTypes = common_vendor.ref(utils_constants.TARGET_TYPES);
    const groupPresets = common_vendor.ref(utils_constants.GROUP_ARROW_PRESETS);
    const showBowPicker = common_vendor.ref(false);
    const showDistancePicker = common_vendor.ref(false);
    const showTargetPicker = common_vendor.ref(false);
    const showGroupPicker = common_vendor.ref(false);
    const showCompleteConfirm = common_vendor.ref(false);
    const groupScoreList = common_vendor.ref([]);
    const activeGroup = common_vendor.ref(0);
    const activeIndex = common_vendor.ref(0);
    const showKeyboard = common_vendor.ref(false);
    const scrollToView = common_vendor.ref("");
    let groupIdCounter = 0;
    const totalScore = common_vendor.computed(() => {
      return groupScoreList.value.reduce((sum, g) => sum + g.groupTotalScore, 0);
    });
    const totalArrows = common_vendor.computed(() => {
      return groupScoreList.value.reduce(
        (sum, g) => sum + g.arrowScoreList.filter((s) => s !== "").length,
        0
      );
    });
    const isAtMaxGroups = common_vendor.computed(
      () => groupScoreList.value.length >= config.groupNum
    );
    const isGroupFilled = (groupIndex) => {
      const group = groupScoreList.value[groupIndex];
      if (!group)
        return false;
      return group.arrowScoreList.every((score) => score !== "");
    };
    const checkAutoAddGroup = () => {
      if (groupScoreList.value.length >= config.groupNum) {
        return;
      }
      const lastGroup = groupScoreList.value[groupScoreList.value.length - 1];
      if (lastGroup && isGroupFilled(groupScoreList.value.length - 1)) {
        addEmptyGroup();
        common_vendor.nextTick$1(() => {
          scrollToView.value = "group-" + (groupScoreList.value.length - 1);
        });
      }
    };
    const getBowLabel = (value) => utils_score.getBowTypeName(value);
    const getTargetLabel = (value) => utils_score.getTargetTypeName(value);
    const isPresetActive = (preset) => {
      return config.groupNum === preset.groupNum && config.arrowNum === preset.arrowNum;
    };
    const selectBow = (bow) => {
      config.bowType = bow.value;
      showBowPicker.value = false;
    };
    const selectDistance = (d) => {
      config.distance = d.value;
      showDistancePicker.value = false;
    };
    const selectTarget = (t) => {
      config.targetType = t.value;
      showTargetPicker.value = false;
    };
    const selectGroupPreset = (preset) => {
      if (config.groupNum === preset.groupNum && config.arrowNum === preset.arrowNum) {
        showGroupPicker.value = false;
        return;
      }
      if (!hasAnyScore()) {
        config.groupNum = preset.groupNum;
        config.arrowNum = preset.arrowNum;
        showGroupPicker.value = false;
        initGroups();
      } else {
        showGroupPicker.value = false;
        common_vendor.index.showModal({
          title: "提示",
          content: "是否清空数据？\n\n选择【确定】：清空所有已填写的分数数据\n选择【取消】：自动分配分数到新分组（多出的箭分数会自动舍弃）",
          confirmText: "清空数据",
          cancelText: "重新分配",
          success: (res) => {
            if (res.confirm) {
              config.groupNum = preset.groupNum;
              config.arrowNum = preset.arrowNum;
              initGroups();
              common_vendor.index.showToast({ title: "已清空数据", icon: "success" });
            } else if (res.cancel) {
              redistributeScores(preset.groupNum, preset.arrowNum);
              common_vendor.index.showToast({ title: "已重新分配数据", icon: "success" });
            }
          }
        });
      }
    };
    const hasAnyScore = () => {
      return groupScoreList.value.some(
        (group) => group.arrowScoreList.some((score) => score !== "")
      );
    };
    const redistributeScores = (newGroupNum, newArrowNum) => {
      const allScores = [];
      groupScoreList.value.forEach((group) => {
        group.arrowScoreList.forEach((score) => {
          if (score !== "") {
            allScores.push(score);
          }
        });
      });
      config.groupNum = newGroupNum;
      config.arrowNum = newArrowNum;
      groupScoreList.value = [];
      groupIdCounter = 0;
      let scoreIndex = 0;
      for (let i = 0; i < newGroupNum; i++) {
        groupIdCounter++;
        const arrowScoreList = [];
        for (let j = 0; j < newArrowNum; j++) {
          if (scoreIndex < allScores.length) {
            arrowScoreList.push(allScores[scoreIndex]);
            scoreIndex++;
          } else {
            arrowScoreList.push("");
          }
        }
        groupScoreList.value.push({
          id: "group_" + groupIdCounter,
          groupIndex: i + 1,
          arrowScoreList,
          groupTotalScore: 0,
          accumulateScore: 0,
          xCount: 0,
          tenCount: 0,
          missCount: 0
        });
      }
      recalculateAllScores();
      if (scoreIndex < allScores.length) {
        const discardedCount = allScores.length - scoreIndex;
        common_vendor.index.showToast({
          title: `已舍弃${discardedCount}支箭的分数`,
          icon: "none",
          duration: 2e3
        });
      }
    };
    const initGroups = () => {
      groupScoreList.value = [];
      addEmptyGroup();
    };
    const addEmptyGroup = () => {
      groupIdCounter++;
      groupScoreList.value.push({
        id: "group_" + groupIdCounter,
        groupIndex: groupScoreList.value.length + 1,
        arrowScoreList: new Array(config.arrowNum).fill(""),
        groupTotalScore: 0,
        accumulateScore: 0,
        xCount: 0,
        tenCount: 0,
        missCount: 0
      });
    };
    const handleAddOrSave = () => {
      if (isAtMaxGroups.value) {
        onSaveClick();
      } else {
        addGroupManual();
      }
    };
    const addGroupManual = () => {
      if (groupScoreList.value.length >= config.groupNum) {
        common_vendor.index.showToast({
          title: `已达到设置的${config.groupNum}组上限`,
          icon: "none"
        });
        return;
      }
      addEmptyGroup();
      common_vendor.nextTick$1(() => {
        scrollToView.value = "group-" + (groupScoreList.value.length - 1);
      });
    };
    const deleteGroup = (groupIndex) => {
      if (groupScoreList.value.length <= 1) {
        common_vendor.index.showToast({ title: "至少保留一组", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除第${groupIndex + 1}组吗？`,
        success: (res) => {
          if (res.confirm) {
            groupScoreList.value.splice(groupIndex, 1);
            recalculateAllScores();
            if (activeGroup.value >= groupScoreList.value.length) {
              activeGroup.value = groupScoreList.value.length - 1;
            }
          }
        }
      });
    };
    const moveGroupUp = (groupIndex) => {
      if (groupIndex <= 0)
        return;
      const temp = groupScoreList.value[groupIndex];
      groupScoreList.value[groupIndex] = groupScoreList.value[groupIndex - 1];
      groupScoreList.value[groupIndex - 1] = temp;
      recalculateAllScores();
    };
    const moveGroupDown = (groupIndex) => {
      if (groupIndex >= groupScoreList.value.length - 1)
        return;
      const temp = groupScoreList.value[groupIndex];
      groupScoreList.value[groupIndex] = groupScoreList.value[groupIndex + 1];
      groupScoreList.value[groupIndex + 1] = temp;
      recalculateAllScores();
    };
    const recalculateAllScores = () => {
      let accumulate = 0;
      groupScoreList.value.forEach((group, index) => {
        group.groupIndex = index + 1;
        group.groupTotalScore = utils_score.calculateGroupScore(
          group.arrowScoreList,
          config.is11Score
        );
        group.xCount = group.arrowScoreList.filter((s) => s === "X").length;
        group.tenCount = group.arrowScoreList.filter((s) => s === "10").length;
        group.missCount = group.arrowScoreList.filter((s) => s === "M").length;
        accumulate += group.groupTotalScore;
        group.accumulateScore = accumulate;
      });
    };
    const updateGroupScore = (groupIndex) => {
      const group = groupScoreList.value[groupIndex];
      group.groupTotalScore = utils_score.calculateGroupScore(
        group.arrowScoreList,
        config.is11Score
      );
      group.xCount = group.arrowScoreList.filter((s) => s === "X").length;
      group.tenCount = group.arrowScoreList.filter((s) => s === "10").length;
      group.missCount = group.arrowScoreList.filter((s) => s === "M").length;
      let accumulate = 0;
      groupScoreList.value.forEach((g) => {
        accumulate += g.groupTotalScore;
        g.accumulateScore = accumulate;
      });
    };
    const getScoreClass = (score) => {
      if (!score)
        return "";
      if (score === "X" || score === "10" || score === "9")
        return "score-yellow";
      if (score === "8" || score === "7")
        return "score-red";
      if (score === "6" || score === "5")
        return "score-blue";
      if (score === "4" || score === "3")
        return "score-black";
      if (score === "2" || score === "1")
        return "score-white";
      if (score === "M")
        return "score-gray";
      return "";
    };
    const onIs11ScoreChange = (e) => {
      config.is11Score = e.detail.value;
      recalculateAllScores();
    };
    const onScoreClick = (groupIndex, scoreIndex) => {
      activeGroup.value = groupIndex;
      activeIndex.value = scoreIndex;
      showKeyboard.value = true;
      common_vendor.nextTick$1(() => {
        scrollToView.value = "group-" + groupIndex;
      });
    };
    const onPageClick = () => {
      if (showKeyboard.value) {
        showKeyboard.value = false;
      }
    };
    const onKeyInput = (key) => {
      groupScoreList.value[activeGroup.value].arrowScoreList[activeIndex.value] = key.value;
      updateGroupScore(activeGroup.value);
      checkAutoAddGroup();
      const currentGroup = groupScoreList.value[activeGroup.value];
      if (activeIndex.value < currentGroup.arrowScoreList.length - 1) {
        activeIndex.value++;
      } else if (activeGroup.value < groupScoreList.value.length - 1) {
        activeGroup.value++;
        activeIndex.value = 0;
      }
    };
    const onKeyDelete = () => {
      groupScoreList.value[activeGroup.value].arrowScoreList[activeIndex.value] = "";
      updateGroupScore(activeGroup.value);
    };
    const onKeyDone = () => {
      showKeyboard.value = false;
    };
    const onCancel = () => {
      if (hasAnyScore()) {
        common_vendor.index.showModal({
          title: "提示",
          content: "已有计分数据，确定要放弃吗？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateBack();
            }
          }
        });
      } else {
        common_vendor.index.navigateBack();
      }
    };
    const onSaveClick = () => {
      if (!hasAnyScore()) {
        common_vendor.index.showToast({ title: "请先输入分数", icon: "none" });
        return;
      }
      const unfilled = utils_score.getFirstUnfilledScoreLocation(groupScoreList.value);
      if (unfilled) {
        common_vendor.index.showToast({
          title: `第${unfilled.groupIndex + 1}组第${unfilled.arrowIndex + 1}箭未填写`,
          icon: "none",
          duration: 3e3
        });
        return;
      }
      showCompleteConfirm.value = true;
    };
    const doComplete = () => {
      const unfilled = utils_score.getFirstUnfilledScoreLocation(groupScoreList.value);
      if (unfilled) {
        showCompleteConfirm.value = false;
        common_vendor.index.showToast({
          title: `第${unfilled.groupIndex + 1}组第${unfilled.arrowIndex + 1}箭未填写`,
          icon: "none",
          duration: 3e3
        });
        return;
      }
      const validGroups = groupScoreList.value.filter(
        (g) => g.arrowScoreList.some((s) => s !== "")
      );
      if (validGroups.length === 0) {
        common_vendor.index.showToast({ title: "请先输入分数", icon: "none" });
        return;
      }
      const finalTotalScore = validGroups.reduce(
        (sum, g) => sum + g.groupTotalScore,
        0
      );
      const record = {
        scoreRecordId: utils_score.generateId(),
        bowType: config.bowType,
        bowName: "",
        distance: config.distance,
        targetType: config.targetType,
        groupNum: validGroups.length,
        arrowNum: config.arrowNum,
        totalArrowNum: validGroups.reduce(
          (sum, g) => sum + g.arrowScoreList.length,
          0
        ),
        is11Score: config.is11Score,
        isTakePhoto: false,
        photoList: [],
        isTiming: false,
        prepareTime: 0,
        formalTime: 0,
        scoreMode: "simple",
        createTime: Date.now(),
        updateTime: Date.now(),
        groupScoreList: validGroups,
        totalScore: finalTotalScore,
        customTargetList: [],
        isSimpleMode: true,
        presetName: "",
        isCompleted: true
      };
      utils_storage.addScoreRecord(record);
      showCompleteConfirm.value = false;
      common_vendor.index.showToast({ title: "计分完成", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
        common_vendor.index.$emit("refreshScoreList");
      }, 1500);
    };
    common_vendor.onMounted(() => {
      initGroups();
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("themeColorChange");
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(getBowLabel(config.bowType)),
        b: common_vendor.o(($event) => showBowPicker.value = true),
        c: common_vendor.t(config.distance),
        d: common_vendor.o(($event) => showDistancePicker.value = true),
        e: common_vendor.t(getTargetLabel(config.targetType)),
        f: common_vendor.o(($event) => showTargetPicker.value = true),
        g: common_vendor.t(config.groupNum),
        h: common_vendor.t(config.arrowNum),
        i: common_vendor.t(config.groupNum * config.arrowNum),
        j: common_vendor.o(($event) => showGroupPicker.value = true),
        k: config.is11Score,
        l: common_vendor.o(onIs11ScoreChange),
        m: themeColor.value,
        n: common_vendor.f(groupScoreList.value, (group, groupIndex, i0) => {
          return common_vendor.e({
            a: common_vendor.t(groupIndex + 1),
            b: common_vendor.t(group.groupTotalScore),
            c: common_vendor.t(group.accumulateScore)
          }, groupScoreList.value.length > 1 ? common_vendor.e({
            d: common_vendor.o(($event) => deleteGroup(groupIndex), group.id),
            e: groupIndex > 0
          }, groupIndex > 0 ? {
            f: common_vendor.o(($event) => moveGroupUp(groupIndex), group.id)
          } : {}, {
            g: groupIndex < groupScoreList.value.length - 1
          }, groupIndex < groupScoreList.value.length - 1 ? {
            h: common_vendor.o(($event) => moveGroupDown(groupIndex), group.id)
          } : {}) : {}, {
            i: common_vendor.f(group.arrowScoreList, (score, scoreIndex, i1) => {
              return {
                a: common_vendor.t(scoreIndex + 1),
                b: common_vendor.t(score || ""),
                c: common_vendor.n(getScoreClass(score)),
                d: common_vendor.n({
                  active: activeGroup.value === groupIndex && activeIndex.value === scoreIndex
                }),
                e: scoreIndex,
                f: common_vendor.o(($event) => onScoreClick(groupIndex, scoreIndex), scoreIndex)
              };
            }),
            j: group.id,
            k: "group-" + groupIndex
          });
        }),
        o: groupScoreList.value.length > 1,
        p: showKeyboard.value ? 1 : "",
        q: scrollToView.value,
        r: common_vendor.o(onCancel),
        s: common_vendor.t(isAtMaxGroups.value ? "保存" : "增加一组"),
        t: common_vendor.o(handleAddOrSave),
        v: common_vendor.o(onKeyInput),
        w: common_vendor.o(onKeyDelete),
        x: common_vendor.o(onKeyDone),
        y: common_vendor.o(($event) => showKeyboard.value = false),
        z: common_vendor.p({
          visible: showKeyboard.value,
          title: `第${activeGroup.value + 1}组 第${activeIndex.value + 1}箭`
        }),
        A: common_vendor.f(bowTypes.value, (bow, k0, i0) => {
          return {
            a: common_vendor.t(bow.label),
            b: config.bowType === bow.value ? 1 : "",
            c: bow.value,
            d: common_vendor.o(($event) => selectBow(bow), bow.value)
          };
        }),
        B: common_vendor.o(($event) => showBowPicker.value = $event),
        C: common_vendor.p({
          title: "选择弓种",
          position: "bottom",
          showFooter: false,
          visible: showBowPicker.value
        }),
        D: common_vendor.f(distances.value, (d, k0, i0) => {
          return {
            a: common_vendor.t(d.label),
            b: config.distance === d.value ? 1 : "",
            c: d.value,
            d: common_vendor.o(($event) => selectDistance(d), d.value)
          };
        }),
        E: common_vendor.o(($event) => showDistancePicker.value = $event),
        F: common_vendor.p({
          title: "选择距离",
          position: "bottom",
          showFooter: false,
          visible: showDistancePicker.value
        }),
        G: common_vendor.f(targetTypes.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.label),
            b: config.targetType === t.value ? 1 : "",
            c: t.value,
            d: common_vendor.o(($event) => selectTarget(t), t.value)
          };
        }),
        H: common_vendor.o(($event) => showTargetPicker.value = $event),
        I: common_vendor.p({
          title: "选择靶面",
          position: "bottom",
          showFooter: false,
          visible: showTargetPicker.value
        }),
        J: common_vendor.f(groupPresets.value, (preset, k0, i0) => {
          return {
            a: common_vendor.t(preset.label),
            b: isPresetActive(preset) ? 1 : "",
            c: preset.label,
            d: common_vendor.o(($event) => selectGroupPreset(preset), preset.label)
          };
        }),
        K: common_vendor.o(($event) => showGroupPicker.value = $event),
        L: common_vendor.p({
          title: "选择分组",
          position: "bottom",
          showFooter: false,
          visible: showGroupPicker.value
        }),
        M: common_vendor.t(totalScore.value),
        N: common_vendor.t(groupScoreList.value.length),
        O: common_vendor.t(totalArrows.value),
        P: common_vendor.o(doComplete),
        Q: common_vendor.o(($event) => showCompleteConfirm.value = false),
        R: common_vendor.o(($event) => showCompleteConfirm.value = $event),
        S: common_vendor.p({
          title: "完成计分",
          visible: showCompleteConfirm.value
        }),
        T: common_vendor.o(onPageClick),
        U: common_vendor.s(_ctx.__cssVars())
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5cdcd810"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/simple.js.map
