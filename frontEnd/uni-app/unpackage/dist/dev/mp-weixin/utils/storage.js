"use strict";
const common_vendor = require("../common/vendor.js");
const STORAGE_KEYS = {
  SCORE_RECORDS: "scoreRecords",
  // 计分记录
  BASE_CONFIG: "baseConfig",
  // 基础配置
  TIMING_PRESET: "timingPreset",
  // 计时预设
  CUSTOM_PRESET: "customPreset",
  // 自定义模式预设
  USER_INFO: "userInfo"
  // 用户信息
};
const setItem = (key, value) => {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.stringify(value);
      common_vendor.index.setStorageSync(key, data);
      resolve(true);
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/storage.js:28", "存储数据失败:", e);
      reject(e);
    }
  });
};
const getItem = (key, defaultValue = null) => {
  try {
    const data = common_vendor.index.getStorageSync(key);
    if (data) {
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:48", "获取数据失败:", e);
    return defaultValue;
  }
};
const getScoreRecords = () => {
  return getItem(STORAGE_KEYS.SCORE_RECORDS, []);
};
const addScoreRecord = (record) => {
  const records = getScoreRecords();
  records.unshift(record);
  return setItem(STORAGE_KEYS.SCORE_RECORDS, records);
};
const updateScoreRecord = (recordId, updateData) => {
  const records = getScoreRecords();
  const index = records.findIndex((r) => r.scoreRecordId === recordId);
  if (index > -1) {
    records[index] = { ...records[index], ...updateData, updateTime: Date.now() };
    return setItem(STORAGE_KEYS.SCORE_RECORDS, records);
  }
  return Promise.resolve(false);
};
const deleteScoreRecord = (recordId) => {
  const records = getScoreRecords();
  const newRecords = records.filter((r) => r.scoreRecordId !== recordId);
  return setItem(STORAGE_KEYS.SCORE_RECORDS, newRecords);
};
const getScoreRecordById = (recordId) => {
  const records = getScoreRecords();
  return records.find((r) => r.scoreRecordId === recordId) || null;
};
const getCustomPresets = () => {
  return getItem(STORAGE_KEYS.CUSTOM_PRESET, []);
};
const addCustomPreset = (preset) => {
  const presets = getCustomPresets();
  if (presets.length >= 3) {
    return Promise.reject(new Error("预设数量已达上限"));
  }
  presets.push(preset);
  return setItem(STORAGE_KEYS.CUSTOM_PRESET, presets);
};
const deleteCustomPreset = (presetId) => {
  const presets = getCustomPresets();
  const newPresets = presets.filter((p) => p.presetId !== presetId);
  return setItem(STORAGE_KEYS.CUSTOM_PRESET, newPresets);
};
const getTimingPresets = () => {
  return getItem(STORAGE_KEYS.TIMING_PRESET, [
    {
      presetId: "default_1",
      name: "标准运动模式",
      config: { faultToleranceTime: 0, prepareTime: 10, formalTime: 180, restTime: 0, isCycle: false }
    },
    {
      presetId: "default_2",
      name: "循环训练模式",
      config: { faultToleranceTime: 5, prepareTime: 5, formalTime: 30, restTime: 30, isCycle: true }
    }
  ]);
};
const getUserInfo = () => {
  return getItem(STORAGE_KEYS.USER_INFO, {
    nickname: "射箭爱好者",
    avatar: "",
    bowTypes: [],
    bows: [],
    introduction: "",
    defaultBowType: "americanHuntingBow",
    defaultDistance: "30m",
    defaultTarget: "80Full",
    defaultGroupArrow: "6箭/6组/共36箭",
    themeColor: "#00C853"
  });
};
const updateUserInfo = (info) => {
  const oldInfo = getUserInfo();
  return setItem(STORAGE_KEYS.USER_INFO, { ...oldInfo, ...info });
};
exports.addCustomPreset = addCustomPreset;
exports.addScoreRecord = addScoreRecord;
exports.deleteCustomPreset = deleteCustomPreset;
exports.deleteScoreRecord = deleteScoreRecord;
exports.getCustomPresets = getCustomPresets;
exports.getScoreRecordById = getScoreRecordById;
exports.getScoreRecords = getScoreRecords;
exports.getTimingPresets = getTimingPresets;
exports.getUserInfo = getUserInfo;
exports.updateScoreRecord = updateScoreRecord;
exports.updateUserInfo = updateUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
