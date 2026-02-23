"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_storage = require("../../utils/storage.js");
const utils_timer = require("../../utils/timer.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  Popup();
}
const Popup = () => "../../components/common/Popup.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "32cef760": themeColor.value,
      "6fae1076": themeColor.value + "4D",
      "6fae27b6": themeColor.value + "1A"
    }));
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const config = common_vendor.reactive({
      faultToleranceTime: 0,
      prepareTime: 10,
      formalTime: 180,
      restTime: 30,
      isCycle: false,
      cycleTimes: 0,
      tipSoundType: "sound",
      tipSoundPoints: [30, 10, 5]
    });
    const isRunning = common_vendor.ref(false);
    const isPaused = common_vendor.ref(false);
    const currentStage = common_vendor.ref("prepare");
    const remainingTime = common_vendor.ref(0);
    const currentCycle = common_vendor.ref(1);
    const presets = common_vendor.ref([]);
    const currentPreset = common_vendor.ref({});
    const showPresetPicker = common_vendor.ref(false);
    const showAddPoint = common_vendor.ref(false);
    const newPoint = common_vendor.ref("");
    let timerInterval = null;
    let audioContext = null;
    const startBtnText = common_vendor.computed(() => {
      if (!isRunning.value)
        return "开始计时";
      if (isPaused.value)
        return "继续";
      return "暂停";
    });
    const stageName = common_vendor.computed(() => {
      const names = {
        faultTolerance: "容错时间",
        prepare: "准备时间",
        formal: "正式时间",
        rest: "休息时间"
      };
      return names[currentStage.value] || currentStage.value;
    });
    const totalStageTime = common_vendor.computed(() => {
      return utils_timer.getStageDuration(currentStage.value, config);
    });
    const progressPercent = common_vendor.computed(() => {
      if (totalStageTime.value === 0)
        return 100;
      return remainingTime.value / totalStageTime.value * 100;
    });
    const formatTime = (seconds) => utils_timer.formatSeconds(seconds);
    const getPresetDesc = (preset) => {
      const c = preset.config;
      let desc = [];
      if (c.faultToleranceTime)
        desc.push(`容错${c.faultToleranceTime}秒`);
      if (c.prepareTime)
        desc.push(`准备${c.prepareTime}秒`);
      desc.push(`正式${c.formalTime}秒`);
      if (c.restTime)
        desc.push(`休息${c.restTime}秒`);
      if (c.isCycle)
        desc.push("循环");
      return desc.join(" + ");
    };
    const selectPreset = (preset) => {
      currentPreset.value = preset;
      Object.assign(config, preset.config);
      showPresetPicker.value = false;
    };
    const onCycleChange = (e) => {
      config.isCycle = e.detail.value;
    };
    const confirmAddPoint = () => {
      const point = parseInt(newPoint.value);
      if (point > 0 && point < config.formalTime && !config.tipSoundPoints.includes(point)) {
        config.tipSoundPoints.push(point);
        config.tipSoundPoints.sort((a, b) => b - a);
      }
      newPoint.value = "";
      showAddPoint.value = false;
    };
    const removePoint = (index) => {
      config.tipSoundPoints.splice(index, 1);
    };
    const playSound = () => {
      try {
        if (!audioContext) {
          audioContext = common_vendor.index.createInnerAudioContext();
          audioContext.src = "/static/audio/beep.mp3";
        }
        audioContext.play();
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/timer/index.vue:343", "播放提示音失败", e);
        common_vendor.index.vibrateShort();
      }
    };
    const toggleTimer = () => {
      if (!isRunning.value) {
        startTimer();
      } else if (isPaused.value) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    };
    const startTimer = () => {
      if (!config.formalTime || config.formalTime <= 0) {
        common_vendor.index.showToast({ title: "请设置正式时间", icon: "none" });
        return;
      }
      isRunning.value = true;
      isPaused.value = false;
      currentCycle.value = 1;
      currentStage.value = utils_timer.getInitialStage(config);
      remainingTime.value = utils_timer.getStageDuration(currentStage.value, config);
      playSound();
      runTimer();
    };
    const runTimer = () => {
      timerInterval = setInterval(() => {
        remainingTime.value--;
        if (currentStage.value === "formal" && config.tipSoundPoints.includes(remainingTime.value)) {
          playSound();
        }
        if (remainingTime.value <= 3 && remainingTime.value > 0) {
          playSound();
        }
        if (remainingTime.value <= 0) {
          playSound();
          const nextStage = utils_timer.getNextStage(currentStage.value, config);
          if (nextStage) {
            currentStage.value = nextStage;
            remainingTime.value = utils_timer.getStageDuration(nextStage, config);
          } else if (config.isCycle) {
            currentCycle.value++;
            currentStage.value = config.prepareTime > 0 ? "prepare" : "formal";
            remainingTime.value = utils_timer.getStageDuration(currentStage.value, config);
          } else {
            stopTimer();
            common_vendor.index.showToast({ title: "计时完成！", icon: "success" });
          }
        }
      }, 1e3);
    };
    const pauseTimer = () => {
      isPaused.value = true;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };
    const resumeTimer = () => {
      isPaused.value = false;
      runTimer();
    };
    const resetTimer = () => {
      pauseTimer();
      currentStage.value = utils_timer.getInitialStage(config);
      remainingTime.value = utils_timer.getStageDuration(currentStage.value, config);
      currentCycle.value = 1;
    };
    const stopTimer = () => {
      isRunning.value = false;
      isPaused.value = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      currentStage.value = utils_timer.getInitialStage(config);
      remainingTime.value = utils_timer.getStageDuration(currentStage.value, config);
    };
    const loadPresets = () => {
      presets.value = utils_storage.getTimingPresets();
      if (presets.value.length > 0) {
        selectPreset(presets.value[0]);
      }
    };
    common_vendor.onMounted(() => {
      loadPresets();
      remainingTime.value = config.prepareTime;
      common_vendor.index.$on("themeColorChange", (color) => {
        themeColor.value = color;
      });
    });
    common_vendor.onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      if (audioContext) {
        audioContext.destroy();
      }
      common_vendor.index.$off("themeColorChange");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(isRunning.value ? isPaused.value ? "▶" : "⏸" : "▶"),
        b: common_vendor.t(startBtnText.value),
        c: isRunning.value ? 1 : "",
        d: isPaused.value ? 1 : "",
        e: common_vendor.o(toggleTimer),
        f: common_vendor.t(stageName.value),
        g: common_vendor.n(currentStage.value),
        h: common_vendor.t(formatTime(remainingTime.value)),
        i: common_vendor.t(formatTime(totalStageTime.value)),
        j: progressPercent.value + "%",
        k: common_vendor.t(currentPreset.value.name || "标准运动模式"),
        l: common_vendor.o(($event) => showPresetPicker.value = true),
        m: isRunning.value,
        n: config.faultToleranceTime,
        o: common_vendor.o(($event) => config.faultToleranceTime = $event.detail.value),
        p: isRunning.value,
        q: config.prepareTime,
        r: common_vendor.o(($event) => config.prepareTime = $event.detail.value),
        s: isRunning.value,
        t: config.formalTime,
        v: common_vendor.o(($event) => config.formalTime = $event.detail.value),
        w: isRunning.value,
        x: config.restTime,
        y: common_vendor.o(($event) => config.restTime = $event.detail.value),
        z: config.isCycle,
        A: common_vendor.o(onCycleChange),
        B: themeColor.value,
        C: isRunning.value,
        D: config.tipSoundType === "sound" ? 1 : "",
        E: common_vendor.o(($event) => config.tipSoundType = "sound"),
        F: config.tipSoundType === "voice" ? 1 : "",
        G: common_vendor.o(($event) => config.tipSoundType = "voice"),
        H: common_vendor.f(config.tipSoundPoints, (point, index, i0) => {
          return {
            a: common_vendor.t(point),
            b: common_vendor.o(($event) => removePoint(index), index),
            c: index
          };
        }),
        I: common_vendor.o(($event) => showAddPoint.value = true),
        J: isRunning.value
      }, isRunning.value ? {
        K: common_vendor.o(resetTimer),
        L: common_vendor.o(stopTimer)
      } : {}, {
        M: common_vendor.f(presets.value, (preset, k0, i0) => {
          return {
            a: common_vendor.t(preset.name),
            b: common_vendor.t(getPresetDesc(preset)),
            c: currentPreset.value.presetId === preset.presetId ? 1 : "",
            d: preset.presetId,
            e: common_vendor.o(($event) => selectPreset(preset), preset.presetId)
          };
        }),
        N: common_vendor.o(($event) => showPresetPicker.value = $event),
        O: common_vendor.p({
          title: "选择预设",
          position: "bottom",
          showFooter: false,
          visible: showPresetPicker.value
        }),
        P: newPoint.value,
        Q: common_vendor.o(($event) => newPoint.value = $event.detail.value),
        R: common_vendor.o(confirmAddPoint),
        S: common_vendor.o(($event) => showAddPoint.value = $event),
        T: common_vendor.p({
          title: "添加提示音关键点",
          visible: showAddPoint.value
        }),
        U: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-706ada7f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/timer/index.js.map
