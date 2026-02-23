"use strict";
const utils_constants = require("./constants.js");
const formatSeconds = (seconds) => {
  if (seconds < 0)
    seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
const getNextStage = (currentStage, config) => {
  const stages = [];
  if (config.faultToleranceTime > 0)
    stages.push(utils_constants.TIMING_STAGES.FAULT_TOLERANCE);
  if (config.prepareTime > 0)
    stages.push(utils_constants.TIMING_STAGES.PREPARE);
  stages.push(utils_constants.TIMING_STAGES.FORMAL);
  if (config.restTime > 0)
    stages.push(utils_constants.TIMING_STAGES.REST);
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    if (config.isCycle && currentStage === utils_constants.TIMING_STAGES.REST) {
      return config.prepareTime > 0 ? utils_constants.TIMING_STAGES.PREPARE : utils_constants.TIMING_STAGES.FORMAL;
    }
    return null;
  }
  return stages[currentIndex + 1];
};
const getStageDuration = (stage, config) => {
  switch (stage) {
    case utils_constants.TIMING_STAGES.FAULT_TOLERANCE:
      return config.faultToleranceTime || 0;
    case utils_constants.TIMING_STAGES.PREPARE:
      return config.prepareTime || 0;
    case utils_constants.TIMING_STAGES.FORMAL:
      return config.formalTime || 0;
    case utils_constants.TIMING_STAGES.REST:
      return config.restTime || 0;
    default:
      return 0;
  }
};
const getInitialStage = (config) => {
  if (config.faultToleranceTime > 0)
    return utils_constants.TIMING_STAGES.FAULT_TOLERANCE;
  if (config.prepareTime > 0)
    return utils_constants.TIMING_STAGES.PREPARE;
  return utils_constants.TIMING_STAGES.FORMAL;
};
exports.formatSeconds = formatSeconds;
exports.getInitialStage = getInitialStage;
exports.getNextStage = getNextStage;
exports.getStageDuration = getStageDuration;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/timer.js.map
