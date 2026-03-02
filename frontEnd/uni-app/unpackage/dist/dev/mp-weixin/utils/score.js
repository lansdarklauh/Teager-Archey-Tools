"use strict";
require("./date.js");
const utils_number = require("./number.js");
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
const scoreToNumber = (scoreStr, is11Score = false) => {
  if (scoreStr === "M" || scoreStr === "" || scoreStr === null || scoreStr === void 0) {
    return 0;
  }
  if (scoreStr === "X") {
    return is11Score ? 11 : 10;
  }
  const num = parseInt(scoreStr, 10);
  return isNaN(num) ? 0 : num;
};
const calculateGroupScore = (arrowScores, is11Score = false) => {
  return arrowScores.reduce((sum, score) => {
    return sum + scoreToNumber(score, is11Score);
  }, 0);
};
const countX = (arrowScores) => {
  return arrowScores.filter((s) => s === "X").length;
};
const countTen = (arrowScores) => {
  return arrowScores.filter((s) => s === "10").length;
};
const countMiss = (arrowScores) => {
  return arrowScores.filter((s) => s === "M").length;
};
const createEmptyGroupScore = (groupIndex, arrowNum) => {
  return {
    groupIndex,
    arrowScoreList: new Array(arrowNum).fill(""),
    groupTotalScore: 0,
    accumulateScore: 0,
    xCount: 0,
    tenCount: 0,
    missCount: 0,
    groupPhotoList: []
  };
};
const createScoreRecord = (config) => {
  const {
    bowType = "americanHuntingBow",
    bowName = "",
    distance = "30m",
    targetType = "80Full",
    groupNum = 6,
    arrowNum = 6,
    is11Score = false,
    isTakePhoto = false,
    isTiming = false,
    prepareTime = 10,
    formalTime = 180,
    scoreMode = "normal",
    customTargetList = []
  } = config;
  const now = Date.now();
  return {
    scoreRecordId: generateId(),
    bowType,
    bowName,
    distance,
    targetType,
    groupNum,
    arrowNum,
    totalArrowNum: groupNum * arrowNum,
    is11Score,
    isTakePhoto,
    photoList: [],
    isTiming,
    prepareTime,
    formalTime,
    scoreMode,
    createTime: now,
    updateTime: now,
    groupScoreList: [],
    totalScore: 0,
    customTargetList,
    isSimpleMode: scoreMode === "simple",
    presetName: "",
    isCompleted: false,
    currentGroupIndex: 0
  };
};
const updateGroupScoreData = (groupScore, arrowScores, is11Score, accumulateScore) => {
  const groupTotalScore = calculateGroupScore(arrowScores, is11Score);
  return {
    ...groupScore,
    arrowScoreList: arrowScores,
    groupTotalScore,
    accumulateScore: accumulateScore + groupTotalScore,
    xCount: countX(arrowScores),
    tenCount: countTen(arrowScores),
    missCount: countMiss(arrowScores)
  };
};
const calculateArrowAverage = (totalScore, totalArrowNum) => {
  if (totalArrowNum === 0)
    return "0.00";
  return utils_number.round2(totalScore / totalArrowNum).toFixed(2);
};
const getBowTypeName = (bowType) => {
  const bowTypes = {
    "competitiveRecurveBow": "竞技反曲弓",
    "compoundBow": "复合弓",
    "traditionalBow": "传统弓",
    "bareBow": "光弓",
    "americanHuntingBow": "美式猎弓"
  };
  return bowTypes[bowType] || bowType;
};
const getTargetTypeName = (targetType) => {
  const targetTypes = {
    "20Half": "20半",
    "40Half": "40半",
    "40Full": "40全",
    "60Half": "60半",
    "60Full": "60全",
    "80Half": "80半",
    "80Full": "80全",
    "122Full": "122全",
    "40Ring5": "40cm5环",
    "80Ring5": "80cm5环"
  };
  return targetTypes[targetType] || targetType;
};
const getFirstUnfilledArrowIndex = (arrowScores) => {
  const index = arrowScores.findIndex(
    (score) => score === "" || score === null || score === void 0
  );
  return index >= 0 ? index : -1;
};
const getFirstUnfilledScoreLocation = (groupScoreList) => {
  for (let g = 0; g < groupScoreList.length; g++) {
    const arrowScoreList = groupScoreList[g].arrowScoreList || [];
    for (let a = 0; a < arrowScoreList.length; a++) {
      const score = arrowScoreList[a];
      if (score === "" || score === null || score === void 0) {
        return { groupIndex: g, arrowIndex: a };
      }
    }
  }
  return null;
};
exports.calculateArrowAverage = calculateArrowAverage;
exports.calculateGroupScore = calculateGroupScore;
exports.createEmptyGroupScore = createEmptyGroupScore;
exports.createScoreRecord = createScoreRecord;
exports.generateId = generateId;
exports.getBowTypeName = getBowTypeName;
exports.getFirstUnfilledArrowIndex = getFirstUnfilledArrowIndex;
exports.getFirstUnfilledScoreLocation = getFirstUnfilledScoreLocation;
exports.getTargetTypeName = getTargetTypeName;
exports.updateGroupScoreData = updateGroupScoreData;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/score.js.map
