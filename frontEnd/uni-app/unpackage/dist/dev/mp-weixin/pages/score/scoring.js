"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_score = require("../../utils/score.js");
if (!Math) {
  (ScoreKeyboard + Popup)();
}
const ScoreKeyboard = () => "../../components/common/ScoreKeyboard.js";
const Popup = () => "../../components/common/Popup.js";
const _sfc_main = {
  __name: "scoring",
  setup(__props) {
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
    const onScoreClick = (index) => {
      activeIndex.value = index;
      showKeyboard.value = true;
    };
    const onKeyInput = (key) => {
      currentScores.value[activeIndex.value] = key.value;
      if (activeIndex.value < record.arrowNum - 1) {
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
      if (groupScoreList.value[currentGroupIndex.value]) {
        groupScoreList.value[currentGroupIndex.value] = groupData;
      } else {
        groupScoreList.value.push(groupData);
      }
      const totalScore = groupScoreList.value.reduce(
        (sum, g) => sum + g.groupTotalScore,
        0
      );
      utils_storage.updateScoreRecord(record.scoreRecordId, {
        groupScoreList: groupScoreList.value,
        totalScore,
        currentGroupIndex: currentGroupIndex.value
      });
    };
    const onSave = () => {
      if (!utils_score.isAllScoresFilled(currentScores.value)) {
        common_vendor.index.showToast({ title: "请填写完整分数", icon: "none" });
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
        utils_storage.updateScoreRecord(record.scoreRecordId, {
          isCompleted: true,
          updateTime: Date.now()
        });
        common_vendor.index.showToast({ title: "计分完成", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
          common_vendor.index.$emit("refreshScoreList");
        }, 1500);
      } else {
        nextGroup();
      }
    };
    const nextGroup = () => {
      saveCurrentGroup();
      currentGroupIndex.value++;
      initCurrentGroup();
      resetTimer();
    };
    const initCurrentGroup = () => {
      const existingGroup = groupScoreList.value[currentGroupIndex.value];
      if (existingGroup) {
        currentScores.value = [...existingGroup.arrowScoreList];
        currentPhotos.value = [...existingGroup.groupPhotoList, "", "", ""].slice(
          0,
          3
        );
      } else {
        currentScores.value = new Array(record.arrowNum).fill("");
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
        content: "确定要放弃本次计分吗？已录入的数据将被保存。",
        success: (res) => {
          if (res.confirm) {
            saveCurrentGroup();
            common_vendor.index.navigateBack();
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
      if (recordId.value) {
        const data = utils_storage.getScoreRecordById(recordId.value);
        if (data) {
          Object.assign(record, data);
          groupScoreList.value = data.groupScoreList || [];
          currentGroupIndex.value = data.currentGroupIndex || 0;
          initCurrentGroup();
          resetTimer();
        }
      }
    };
    common_vendor.onMounted(() => {
      loadRecord();
    });
    common_vendor.onUnmounted(() => {
      pauseTimer();
    });
    return (_ctx, _cache) => {
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
            b: index
          };
        })
      } : {}, {
        k: record.isTiming
      }, record.isTiming ? common_vendor.e({
        l: common_vendor.t(record.prepareTime),
        m: common_vendor.t(record.formalTime),
        n: timerProgress.value + "%",
        o: common_vendor.o(resetTimer),
        p: !timerRunning.value
      }, !timerRunning.value ? {
        q: common_vendor.o(toggleTimer)
      } : {
        r: common_vendor.o(toggleTimer)
      }) : {}, {
        s: common_vendor.t(currentGroupIndex.value + 1),
        t: common_vendor.t(currentGroupScore.value),
        v: common_vendor.t(accumulateScore.value),
        w: common_vendor.f(currentScores.value, (score, index, i0) => {
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
        x: record.isTakePhoto
      }, record.isTakePhoto ? {
        y: common_vendor.f(currentPhotos.value, (photo, index, i0) => {
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
        z: common_vendor.o(onCancel),
        A: common_vendor.t(isLastGroup.value ? "完成" : "保存"),
        B: common_vendor.o(onSave),
        C: currentGroupIndex.value < record.groupNum - 1 && groupScoreList.value.length > currentGroupIndex.value
      }, currentGroupIndex.value < record.groupNum - 1 && groupScoreList.value.length > currentGroupIndex.value ? {
        D: common_vendor.o(nextGroup)
      } : {}, {
        E: common_vendor.o(onKeyInput),
        F: common_vendor.o(onKeyDelete),
        G: common_vendor.o(onKeyDone),
        H: common_vendor.o(($event) => showKeyboard.value = false),
        I: common_vendor.p({
          visible: showKeyboard.value,
          title: `第${activeIndex.value + 1}箭`
        }),
        J: common_vendor.o(onPhotoConfirm),
        K: common_vendor.o(onPhotoCancel),
        L: common_vendor.o(($event) => showPhotoPrompt.value = $event),
        M: common_vendor.p({
          title: "是否拍照记录?",
          cancelText: "跳过",
          confirmText: "拍照",
          visible: showPhotoPrompt.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04d39506"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/score/scoring.js.map
