"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_score = require("../../utils/score.js");
const utils_constants = require("../../utils/constants.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  (ScoreKeyboard + Popup + GroupPicker)();
}
const ScoreKeyboard = () => "../../components/common/ScoreKeyboard.js";
const Popup = () => "../../components/common/Popup.js";
const GroupPicker = () => "../../components/business/GroupPicker.js";
const __default__ = {
  onBackPress() {
    common_vendor.index.reLaunch({ url: "/pages/index/index" });
    return true;
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "scoring",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "68bf0145": themeColor.value,
      "498c2720": themeColor.value + "33"
    }));
    let skipWriteCacheOnLeave = false;
    const recordId = common_vendor.ref("");
    const mode = common_vendor.ref("normal");
    const record = common_vendor.reactive({
      scoreRecordId: "",
      bowType: "americanHuntingBow",
      distance: "30m",
      targetType: "80Full",
      groupNum: 6,
      arrowNum: 6,
      totalArrowNum: 36,
      is11Score: false,
      isTakePhoto: false,
      isTiming: false,
      prepareTime: 10,
      formalTime: 120
    });
    const groupScoreList = common_vendor.ref([]);
    const currentGroupIndex = common_vendor.ref(0);
    const currentScores = common_vendor.ref([]);
    const currentPhotos = common_vendor.ref([]);
    const activeIndex = common_vendor.ref(0);
    const showKeyboard = common_vendor.ref(false);
    const showSettings = common_vendor.ref(false);
    const showPhotoPrompt = common_vendor.ref(false);
    const showGroupPickerInSettings = common_vendor.ref(false);
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const bowTypes = common_vendor.ref(utils_constants.BOW_TYPES);
    const distances = common_vendor.ref(utils_constants.DISTANCES);
    const targetTypes = common_vendor.ref(utils_constants.TARGET_TYPES);
    const settingsBowIndex = common_vendor.computed(
      () => bowTypes.value.findIndex((b) => b.value === record.bowType)
    );
    const settingsDistanceIndex = common_vendor.computed(
      () => distances.value.findIndex((d) => d.value === record.distance)
    );
    const settingsTargetIndex = common_vendor.computed(
      () => targetTypes.value.findIndex((t) => t.value === record.targetType)
    );
    const indicatorScrollLeft = common_vendor.ref(0);
    const cacheIntentionallyCleared = common_vendor.ref(false);
    const timerRunning = common_vendor.ref(false);
    const timerProgress = common_vendor.ref(100);
    const remainingTime = common_vendor.ref(0);
    let timerInterval = null;
    const currentGroupScore = common_vendor.computed(() => {
      return utils_score.calculateGroupScore(currentScores.value, record.is11Score);
    });
    const accumulateScore = common_vendor.computed(() => {
      let total = 0;
      groupScoreList.value.forEach((group, index) => {
        if (index < currentGroupIndex.value) {
          total += group.groupTotalScore || 0;
        }
      });
      return total + currentGroupScore.value;
    });
    const isLastGroup = common_vendor.computed(() => {
      return currentGroupIndex.value === record.groupNum - 1;
    });
    const getBowLabel = (value) => {
      return utils_score.getBowTypeName(value);
    };
    const getTargetLabel = (value) => {
      return utils_score.getTargetTypeName(value);
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
    const isGroupCompleted = (groupIndex) => {
      return utils_score.isGroupFilled(groupScoreList.value, groupIndex, record.arrowNum);
    };
    const goToGroup = (groupIndex) => {
      if (groupIndex === currentGroupIndex.value)
        return;
      saveCurrentGroup();
      currentGroupIndex.value = groupIndex;
      initCurrentGroup();
      updateIndicatorScroll();
    };
    const onSwiperChange = (e) => {
      const newIndex = e.detail.current;
      if (newIndex === currentGroupIndex.value)
        return;
      saveCurrentGroup();
      currentGroupIndex.value = newIndex;
      initCurrentGroup();
      updateIndicatorScroll();
    };
    const getScoresForGroup = (g) => {
      if (g === currentGroupIndex.value)
        return currentScores.value;
      return utils_score.getGroupScores(groupScoreList.value, g, record.arrowNum);
    };
    const getGroupScoreByIndex = (g) => {
      const scores = g === currentGroupIndex.value ? currentScores.value : utils_score.getGroupScores(groupScoreList.value, g, record.arrowNum);
      return utils_score.calculateGroupScore(scores, record.is11Score);
    };
    const getAccumulateByGroup = (g) => {
      let total = 0;
      for (let i = 0; i <= g; i++) {
        total += getGroupScoreByIndex(i);
      }
      return total;
    };
    const onScoreClickGroup = (g, index) => {
      if (g !== currentGroupIndex.value) {
        saveCurrentGroup();
        currentGroupIndex.value = g;
        initCurrentGroup();
      }
      activeIndex.value = index;
      showKeyboard.value = true;
    };
    const formatRemainTime = (seconds) => {
      if (seconds < 0)
        return "00:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    const updateIndicatorScroll = () => {
      record.groupNum;
      const i = currentGroupIndex.value;
      const dotWidth = 40;
      indicatorScrollLeft.value = Math.max(0, i * dotWidth - 100);
    };
    const prevGroup = () => {
      if (currentGroupIndex.value <= 0)
        return;
      saveCurrentGroup();
      let targetG = -1;
      let arrowIndex = 0;
      for (let g = currentGroupIndex.value - 1; g >= 0; g--) {
        const scores = utils_score.getGroupScores(groupScoreList.value, g, record.arrowNum);
        const firstUnfilled = utils_score.getFirstUnfilledArrowIndex(scores);
        if (firstUnfilled >= 0) {
          targetG = g;
          arrowIndex = firstUnfilled;
          break;
        }
      }
      if (targetG < 0) {
        targetG = currentGroupIndex.value - 1;
        arrowIndex = 0;
      }
      currentGroupIndex.value = targetG;
      initCurrentGroup();
      activeIndex.value = arrowIndex;
      updateIndicatorScroll();
      showKeyboard.value = true;
    };
    const nextGroupBtn = () => {
      if (currentGroupIndex.value >= record.groupNum - 1)
        return;
      saveCurrentGroup();
      let targetG = -1;
      let arrowIndex = 0;
      for (let g = currentGroupIndex.value + 1; g < record.groupNum; g++) {
        const scores = utils_score.getGroupScores(groupScoreList.value, g, record.arrowNum);
        const firstUnfilled = utils_score.getFirstUnfilledArrowIndex(scores);
        if (firstUnfilled >= 0) {
          targetG = g;
          arrowIndex = firstUnfilled;
          break;
        }
      }
      if (targetG < 0) {
        targetG = currentGroupIndex.value + 1;
        arrowIndex = 0;
      }
      currentGroupIndex.value = targetG;
      initCurrentGroup();
      activeIndex.value = arrowIndex;
      updateIndicatorScroll();
      showKeyboard.value = true;
    };
    const onScoreClick = (index) => {
      activeIndex.value = index;
      showKeyboard.value = true;
    };
    const onKeyInput = (key) => {
      currentScores.value[activeIndex.value] = key.value;
      const isLastArrow = activeIndex.value >= record.arrowNum - 1;
      const currentGroupAllFilled = utils_score.getFirstUnfilledArrowIndex(currentScores.value) < 0;
      const justFilledLast = isLastArrow && currentGroupAllFilled;
      if (justFilledLast && currentGroupIndex.value < record.groupNum - 1) {
        saveCurrentGroup();
        let targetG = -1;
        let arrowIndex = 0;
        for (let g = currentGroupIndex.value + 1; g < record.groupNum; g++) {
          const scores = utils_score.getGroupScores(groupScoreList.value, g, record.arrowNum);
          const firstUnfilled = utils_score.getFirstUnfilledArrowIndex(scores);
          if (firstUnfilled >= 0) {
            targetG = g;
            arrowIndex = firstUnfilled;
            break;
          }
        }
        if (targetG >= 0) {
          currentGroupIndex.value = targetG;
          initCurrentGroup();
          activeIndex.value = arrowIndex;
          updateIndicatorScroll();
        }
      } else if (activeIndex.value < record.arrowNum - 1) {
        activeIndex.value++;
      }
    };
    const onKeyDelete = () => {
      currentScores.value[activeIndex.value] = "";
    };
    const onKeyDone = () => {
      showKeyboard.value = false;
    };
    const addPhoto = () => {
      common_vendor.index.chooseImage({
        count: 3 - currentPhotos.value.filter((p) => p).length,
        sourceType: ["album", "camera"],
        success: (res) => {
          res.tempFilePaths.forEach((path) => {
            const emptyIndex = currentPhotos.value.findIndex((p) => !p);
            if (emptyIndex > -1) {
              currentPhotos.value[emptyIndex] = path;
            }
          });
        }
      });
    };
    const previewPhoto = (photo) => {
      common_vendor.index.previewImage({
        urls: currentPhotos.value.filter((p) => p),
        current: photo
      });
    };
    const saveCurrentGroup = () => {
      const groupData = utils_score.updateGroupScoreData(
        utils_score.createEmptyGroupScore(currentGroupIndex.value + 1, record.arrowNum),
        [...currentScores.value],
        record.is11Score,
        accumulateScore.value - currentGroupScore.value
      );
      groupData.groupPhotoList = [...currentPhotos.value.filter((p) => p)];
      const idx = currentGroupIndex.value;
      while (groupScoreList.value.length <= idx) {
        groupScoreList.value.push(null);
      }
      groupScoreList.value[idx] = groupData;
      if (!cacheIntentionallyCleared.value) {
        utils_storage.setScoringCache({
          scoreRecordId: record.scoreRecordId,
          mode: mode.value,
          record: {
            ...record,
            groupScoreList: groupScoreList.value.map((g) => g && { ...g }),
            currentGroupIndex: currentGroupIndex.value
          }
        });
      }
      const totalScore = groupScoreList.value.reduce(
        (sum, g) => sum + (g ? g.groupTotalScore || 0 : 0),
        0
      );
      utils_storage.updateScoreRecord(record.scoreRecordId, {
        groupScoreList: groupScoreList.value,
        totalScore,
        currentGroupIndex: currentGroupIndex.value
      });
    };
    const onSave = () => {
      saveCurrentGroup();
      const firstUnfilled = utils_score.getFirstUnfilledLocation(
        groupScoreList.value,
        record.groupNum,
        record.arrowNum
      );
      if (firstUnfilled) {
        currentGroupIndex.value = firstUnfilled.groupIndex;
        initCurrentGroup();
        activeIndex.value = firstUnfilled.arrowIndex;
        updateIndicatorScroll();
        common_vendor.index.showModal({
          title: "提示",
          content: "分数还存在缺失，请补充分数后再保存（未得分的记M）",
          showCancel: false,
          confirmText: "确定"
        });
        showKeyboard.value = true;
        return;
      }
      if (record.isTakePhoto && currentPhotos.value.filter((p) => p).length === 0) {
        showPhotoPrompt.value = true;
        return;
      }
      doSave();
    };
    const doSave = () => {
      saveCurrentGroup();
      if (isLastGroup.value) {
        const totalScore = groupScoreList.value.reduce(
          (sum, g) => sum + (g ? g.groupTotalScore || 0 : 0),
          0
        );
        const existsInList = utils_storage.getScoreRecordById(record.scoreRecordId);
        if (!existsInList) {
          utils_storage.addScoreRecord({
            ...record,
            groupScoreList: groupScoreList.value.filter(Boolean),
            totalScore,
            isCompleted: true,
            updateTime: Date.now()
          });
        } else {
          utils_storage.updateScoreRecord(record.scoreRecordId, {
            groupScoreList: groupScoreList.value.filter(Boolean),
            totalScore,
            isCompleted: true,
            updateTime: Date.now()
          });
        }
        common_vendor.index.showModal({
          title: "提示",
          content: "计分已保存",
          showCancel: false,
          confirmText: "确定",
          success: (res) => {
            if (res.confirm) {
              skipWriteCacheOnLeave = true;
              cacheIntentionallyCleared.value = true;
              utils_storage.clearScoringCache();
              common_vendor.index.reLaunch({ url: "/pages/index/index" });
              common_vendor.index.$emit("refreshScoreList");
            }
          }
        });
      } else {
        const nextG = currentGroupIndex.value + 1;
        const nextScores = utils_score.getGroupScores(
          groupScoreList.value,
          nextG,
          record.arrowNum
        );
        const firstUnfilled = utils_score.getFirstUnfilledArrowIndex(nextScores);
        const arrowIndex = firstUnfilled >= 0 ? firstUnfilled : 0;
        currentGroupIndex.value = nextG;
        initCurrentGroup();
        activeIndex.value = arrowIndex;
        updateIndicatorScroll();
        showKeyboard.value = true;
      }
    };
    const initCurrentGroup = () => {
      currentScores.value = utils_score.getGroupScores(
        groupScoreList.value,
        currentGroupIndex.value,
        record.arrowNum
      );
      const existingGroup = groupScoreList.value[currentGroupIndex.value];
      if (existingGroup && existingGroup.groupPhotoList) {
        currentPhotos.value = [...existingGroup.groupPhotoList, "", "", ""].slice(
          0,
          3
        );
      } else {
        currentPhotos.value = ["", "", ""];
      }
      activeIndex.value = 0;
    };
    const onPhotoConfirm = () => {
      showPhotoPrompt.value = false;
      addPhoto();
    };
    const onPhotoCancel = () => {
      showPhotoPrompt.value = false;
      doSave();
    };
    const onCancel = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要放弃本次计分吗？",
        success: (res) => {
          if (res.confirm) {
            skipWriteCacheOnLeave = true;
            saveCurrentGroup();
            cacheIntentionallyCleared.value = true;
            utils_storage.clearScoringCache();
            common_vendor.index.reLaunch({ url: "/pages/index/index" });
            common_vendor.index.$emit("refreshScoreList");
          }
        }
      });
    };
    const toggleTimer = () => {
      if (timerRunning.value) {
        pauseTimer();
      } else {
        startTimer();
      }
    };
    const startTimer = () => {
      if (remainingTime.value <= 0) {
        remainingTime.value = record.prepareTime + record.formalTime;
      }
      timerRunning.value = true;
      timerInterval = setInterval(() => {
        remainingTime.value--;
        timerProgress.value = remainingTime.value / (record.prepareTime + record.formalTime) * 100;
        if (remainingTime.value <= 0) {
          pauseTimer();
          common_vendor.index.showToast({ title: "时间到！", icon: "none" });
        }
      }, 1e3);
    };
    const pauseTimer = () => {
      timerRunning.value = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };
    const resetTimer = () => {
      pauseTimer();
      remainingTime.value = record.prepareTime + record.formalTime;
      timerProgress.value = 100;
    };
    const loadRecord = () => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = ((_a = currentPage.$page) == null ? void 0 : _a.options) || currentPage.options || {};
      recordId.value = options.id || "";
      mode.value = options.mode || "normal";
      if (!recordId.value)
        return;
      let data = utils_storage.getScoreRecordById(recordId.value);
      const cache = utils_storage.getScoringCache();
      if (!data && cache && cache.scoreRecordId === recordId.value && cache.record) {
        data = cache.record;
      }
      if (!data)
        return;
      if (cache && cache.scoreRecordId === recordId.value && cache.record) {
        if (Array.isArray(cache.record.groupScoreList))
          data.groupScoreList = cache.record.groupScoreList;
        if (typeof cache.record.currentGroupIndex === "number")
          data.currentGroupIndex = cache.record.currentGroupIndex;
      }
      Object.assign(record, data);
      const groupNum = Math.max(1, Number(record.groupNum) || 6);
      const arrowNum = Math.max(1, Number(record.arrowNum) || 6);
      record.groupNum = groupNum;
      record.arrowNum = arrowNum;
      record.totalArrowNum = groupNum * arrowNum;
      groupScoreList.value = data.groupScoreList || [];
      while (groupScoreList.value.length < groupNum) {
        groupScoreList.value.push(
          utils_score.createEmptyGroupScore(groupScoreList.value.length + 1, arrowNum)
        );
      }
      groupScoreList.value = groupScoreList.value.slice(0, groupNum);
      currentGroupIndex.value = Math.min(data.currentGroupIndex ?? 0, groupNum - 1);
      initCurrentGroup();
      resetTimer();
      const first = utils_score.getFirstUnfilledLocation(
        groupScoreList.value,
        record.groupNum,
        record.arrowNum
      );
      if (first) {
        currentGroupIndex.value = first.groupIndex;
        initCurrentGroup();
        activeIndex.value = first.arrowIndex;
      }
      updateIndicatorScroll();
    };
    const onSettingsBowChange = (e) => {
      const i = e.detail.value;
      if (bowTypes.value[i])
        record.bowType = bowTypes.value[i].value;
    };
    const onSettingsDistanceChange = (e) => {
      const i = e.detail.value;
      if (distances.value[i])
        record.distance = distances.value[i].value;
    };
    const onSettingsTargetChange = (e) => {
      const i = e.detail.value;
      if (targetTypes.value[i])
        record.targetType = targetTypes.value[i].value;
    };
    const onSettings11ScoreChange = (e) => {
      record.is11Score = e.detail.value;
    };
    const onSettingsTimingChange = (e) => {
      record.isTiming = e.detail.value;
    };
    const onSettingsGroupConfirm = (data) => {
      const newGroupNum = data.groupNum || record.groupNum;
      const newArrowNum = data.arrowNum || record.arrowNum;
      if (newGroupNum === record.groupNum && newArrowNum === record.arrowNum) {
        showGroupPickerInSettings.value = false;
        return;
      }
      if (mode.value !== "normal") {
        record.groupNum = newGroupNum;
        record.arrowNum = newArrowNum;
        record.totalArrowNum = newGroupNum * newArrowNum;
        if (groupScoreList.value.length > newGroupNum) {
          groupScoreList.value = groupScoreList.value.slice(0, newGroupNum);
        }
        groupScoreList.value.forEach((g) => {
          if (g && g.arrowScoreList) {
            if (g.arrowScoreList.length > newArrowNum) {
              g.arrowScoreList = g.arrowScoreList.slice(0, newArrowNum);
            } else if (g.arrowScoreList.length < newArrowNum) {
              g.arrowScoreList = g.arrowScoreList.concat(
                new Array(newArrowNum - g.arrowScoreList.length).fill("")
              );
            }
          }
        });
        if (currentGroupIndex.value >= newGroupNum) {
          currentGroupIndex.value = Math.max(0, newGroupNum - 1);
        }
        initCurrentGroup();
        updateIndicatorScroll();
        showGroupPickerInSettings.value = false;
        return;
      }
      const hasAnyScore = () => {
        return groupScoreList.value.some(
          (g) => (g && g.arrowScoreList || []).some(
            (s) => s !== "" && s != null && s !== void 0
          )
        );
      };
      if (!hasAnyScore()) {
        applyGroupConfigAndClear(newGroupNum, newArrowNum);
        showGroupPickerInSettings.value = false;
        return;
      }
      showGroupPickerInSettings.value = false;
      common_vendor.index.showModal({
        title: "提示",
        content: "是否清空数据？\n\n选择【确定】：清空所有已填写的分数数据\n选择【取消】：自动分配分数到新分组（多出的箭分数会自动舍弃）",
        confirmText: "清空数据",
        cancelText: "重新分配",
        success: (res) => {
          if (res.confirm) {
            applyGroupConfigAndClear(newGroupNum, newArrowNum);
            common_vendor.index.showToast({ title: "已清空数据", icon: "success" });
          } else if (res.cancel) {
            redistributeScoresInScoring(newGroupNum, newArrowNum);
            common_vendor.index.showToast({ title: "已重新分配数据", icon: "success" });
          }
        }
      });
    };
    const applyGroupConfigAndClear = (newGroupNum, newArrowNum) => {
      record.groupNum = newGroupNum;
      record.arrowNum = newArrowNum;
      record.totalArrowNum = newGroupNum * newArrowNum;
      groupScoreList.value = [];
      for (let i = 0; i < newGroupNum; i++) {
        groupScoreList.value.push(utils_score.createEmptyGroupScore(i + 1, newArrowNum));
      }
      currentGroupIndex.value = 0;
      initCurrentGroup();
      updateIndicatorScroll();
    };
    const redistributeScoresInScoring = (newGroupNum, newArrowNum) => {
      const allScores = [];
      groupScoreList.value.forEach((g) => {
        const list = g && g.arrowScoreList || [];
        list.forEach((s) => {
          if (s !== "" && s != null && s !== void 0)
            allScores.push(s);
        });
      });
      record.groupNum = newGroupNum;
      record.arrowNum = newArrowNum;
      record.totalArrowNum = newGroupNum * newArrowNum;
      let scoreIndex = 0;
      let accumulate = 0;
      const newList = [];
      for (let i = 0; i < newGroupNum; i++) {
        const arrowScoreList = [];
        for (let j = 0; j < newArrowNum; j++) {
          arrowScoreList.push(
            scoreIndex < allScores.length ? allScores[scoreIndex++] : ""
          );
        }
        const groupData = utils_score.updateGroupScoreData(
          utils_score.createEmptyGroupScore(i + 1, newArrowNum),
          arrowScoreList,
          record.is11Score,
          accumulate
        );
        accumulate += groupData.groupTotalScore;
        newList.push(groupData);
      }
      groupScoreList.value = newList;
      currentGroupIndex.value = 0;
      initCurrentGroup();
      updateIndicatorScroll();
      if (scoreIndex < allScores.length) {
        common_vendor.index.showToast({
          title: `已舍弃${allScores.length - scoreIndex}支箭的分数`,
          icon: "none",
          duration: 2e3
        });
      }
    };
    const onSettingsConfirm = () => {
      utils_storage.updateScoreRecord(record.scoreRecordId, {
        bowType: record.bowType,
        distance: record.distance,
        targetType: record.targetType,
        groupNum: record.groupNum,
        arrowNum: record.arrowNum,
        totalArrowNum: record.totalArrowNum,
        is11Score: record.is11Score,
        isTiming: record.isTiming,
        prepareTime: record.prepareTime,
        formalTime: record.formalTime,
        groupScoreList: groupScoreList.value
      });
      showSettings.value = false;
    };
    common_vendor.watch(
      currentGroupIndex,
      () => {
        updateIndicatorScroll();
      },
      { immediate: true }
    );
    const writeCacheOnLeave = () => {
      debugger;
      if (skipWriteCacheOnLeave || cacheIntentionallyCleared.value)
        return;
      if (!record.scoreRecordId)
        return;
      utils_storage.setScoringCache({
        scoreRecordId: record.scoreRecordId,
        mode: mode.value,
        record: {
          ...record,
          groupScoreList: groupScoreList.value.map((g) => g && { ...g }),
          currentGroupIndex: currentGroupIndex.value
        }
      });
    };
    common_vendor.onMounted(() => {
      skipWriteCacheOnLeave = false;
      loadRecord();
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    common_vendor.onUnmounted(() => {
      writeCacheOnLeave();
      pauseTimer();
      common_vendor.index.$off("themeColorChange");
    });
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: common_vendor.t(getBowLabel(record.bowType)),
        b: common_vendor.t(record.distance),
        c: common_vendor.t(getTargetLabel(record.targetType)),
        d: common_vendor.t(record.groupNum),
        e: common_vendor.t(record.arrowNum),
        f: common_vendor.t(record.totalArrowNum),
        g: common_vendor.t(record.is11Score ? "11分" : "10分"),
        h: common_vendor.o(($event) => showSettings.value = true),
        i: record.groupNum > 1
      }, record.groupNum > 1 ? {
        j: common_vendor.f(record.groupNum, (_, index, i0) => {
          return {
            a: currentGroupIndex.value === index ? 1 : "",
            b: isGroupCompleted(index) ? 1 : "",
            c: index,
            d: common_vendor.o(($event) => goToGroup(index), index)
          };
        }),
        k: indicatorScrollLeft.value
      } : {}, {
        l: record.groupNum > 1
      }, record.groupNum > 1 ? {
        m: common_vendor.f(record.groupNum, (_, g, i0) => {
          return {
            a: common_vendor.t(g + 1),
            b: common_vendor.t(getGroupScoreByIndex(g)),
            c: common_vendor.t(getAccumulateByGroup(g)),
            d: common_vendor.f(getScoresForGroup(g), (score, index, i1) => {
              return {
                a: common_vendor.t(index + 1),
                b: common_vendor.t(score || ""),
                c: common_vendor.n(getScoreClass(score)),
                d: common_vendor.n({
                  active: currentGroupIndex.value === g && activeIndex.value === index
                }),
                e: index,
                f: common_vendor.o(($event) => onScoreClickGroup(g, index), index)
              };
            }),
            e: g
          };
        }),
        n: currentGroupIndex.value,
        o: common_vendor.o(onSwiperChange)
      } : common_vendor.e({
        p: common_vendor.t(currentGroupIndex.value + 1),
        q: common_vendor.t(currentGroupScore.value),
        r: common_vendor.t(accumulateScore.value),
        s: common_vendor.f(currentScores.value, (score, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(score || ""),
            c: common_vendor.n(getScoreClass(score)),
            d: common_vendor.n({
              active: activeIndex.value === index
            }),
            e: index,
            f: common_vendor.o(($event) => onScoreClick(index), index)
          };
        }),
        t: record.isTakePhoto
      }, record.isTakePhoto ? {
        v: common_vendor.f(currentPhotos.value, (photo, index, i0) => {
          return common_vendor.e({
            a: photo
          }, photo ? {
            b: photo,
            c: common_vendor.o(($event) => previewPhoto(photo), index)
          } : {
            d: common_vendor.o(addPhoto, index)
          }, {
            e: index
          });
        })
      } : {}), {
        w: record.groupNum > 1 && record.isTakePhoto
      }, record.groupNum > 1 && record.isTakePhoto ? {
        x: common_vendor.f(currentPhotos.value, (photo, index, i0) => {
          return common_vendor.e({
            a: photo
          }, photo ? {
            b: photo,
            c: common_vendor.o(($event) => previewPhoto(photo), index)
          } : {
            d: common_vendor.o(addPhoto, index)
          }, {
            e: index
          });
        })
      } : {}, {
        y: record.isTiming
      }, record.isTiming ? common_vendor.e({
        z: common_vendor.t(record.prepareTime),
        A: common_vendor.t(record.formalTime),
        B: remainingTime.value >= 0
      }, remainingTime.value >= 0 ? {
        C: common_vendor.t(formatRemainTime(remainingTime.value))
      } : {}, {
        D: timerProgress.value + "%",
        E: common_vendor.o(resetTimer),
        F: !timerRunning.value
      }, !timerRunning.value ? {
        G: common_vendor.o(toggleTimer)
      } : {
        H: common_vendor.o(toggleTimer)
      }) : {}, {
        I: common_vendor.o(onCancel),
        J: common_vendor.t(isLastGroup.value ? "完成" : "保存"),
        K: common_vendor.o(onSave),
        L: record.groupNum > 1
      }, record.groupNum > 1 ? {
        M: currentGroupIndex.value <= 0 ? 1 : "",
        N: common_vendor.o(prevGroup),
        O: currentGroupIndex.value >= record.groupNum - 1 ? 1 : "",
        P: common_vendor.o(nextGroupBtn)
      } : {}, {
        Q: common_vendor.o(onKeyInput),
        R: common_vendor.o(onKeyDelete),
        S: common_vendor.o(onKeyDone),
        T: common_vendor.o(($event) => showKeyboard.value = false),
        U: common_vendor.p({
          visible: showKeyboard.value,
          title: `第${activeIndex.value + 1}箭`
        }),
        V: common_vendor.o(onPhotoConfirm),
        W: common_vendor.o(onPhotoCancel),
        X: common_vendor.o(($event) => showPhotoPrompt.value = $event),
        Y: common_vendor.p({
          title: "是否拍照记录?",
          cancelText: "跳过",
          confirmText: "拍照",
          visible: showPhotoPrompt.value
        }),
        Z: showSettings.value
      }, showSettings.value ? common_vendor.e({
        aa: common_vendor.t(((_a = bowTypes.value[settingsBowIndex.value]) == null ? void 0 : _a.label) || ""),
        ab: bowTypes.value,
        ac: settingsBowIndex.value,
        ad: common_vendor.o(onSettingsBowChange),
        ae: common_vendor.t(settingsDistanceIndex.value >= 0 ? (_b = distances.value[settingsDistanceIndex.value]) == null ? void 0 : _b.label : record.distance),
        af: distances.value,
        ag: Math.max(0, settingsDistanceIndex.value),
        ah: common_vendor.o(onSettingsDistanceChange),
        ai: common_vendor.t(((_c = targetTypes.value[settingsTargetIndex.value]) == null ? void 0 : _c.label) || ""),
        aj: targetTypes.value,
        ak: settingsTargetIndex.value,
        al: common_vendor.o(onSettingsTargetChange),
        am: common_vendor.t(record.groupNum),
        an: common_vendor.t(record.arrowNum),
        ao: common_vendor.o(($event) => showGroupPickerInSettings.value = true),
        ap: record.is11Score,
        aq: common_vendor.o(onSettings11ScoreChange),
        ar: themeColor.value,
        as: record.isTiming,
        at: common_vendor.o(onSettingsTimingChange),
        av: themeColor.value,
        aw: record.isTiming
      }, record.isTiming ? {
        ax: record.prepareTime,
        ay: common_vendor.o(common_vendor.m(($event) => record.prepareTime = $event.detail.value, {
          number: true
        }))
      } : {}, {
        az: record.isTiming
      }, record.isTiming ? {
        aA: record.formalTime,
        aB: common_vendor.o(common_vendor.m(($event) => record.formalTime = $event.detail.value, {
          number: true
        }))
      } : {}) : {}, {
        aC: common_vendor.o(onSettingsConfirm),
        aD: common_vendor.o(($event) => showSettings.value = false),
        aE: common_vendor.o(($event) => showSettings.value = $event),
        aF: common_vendor.p({
          title: "设置",
          position: "bottom",
          showFooter: true,
          visible: showSettings.value
        }),
        aG: common_vendor.o(onSettingsGroupConfirm),
        aH: common_vendor.o(($event) => showGroupPickerInSettings.value = false),
        aI: common_vendor.p({
          defaultGroupNum: record.groupNum,
          defaultArrowNum: record.arrowNum,
          hasExistingData: groupScoreList.value.length > 0
        }),
        aJ: common_vendor.o(($event) => showGroupPickerInSettings.value = $event),
        aK: common_vendor.p({
          position: "center",
          showHeader: false,
          showFooter: false,
          visible: showGroupPickerInSettings.value
        }),
        aL: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04d39506"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/scoring.js.map
