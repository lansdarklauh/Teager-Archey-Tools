"use strict";
const calculateAverage = (scores) => {
  if (!scores || scores.length === 0)
    return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Number((sum / scores.length).toFixed(2));
};
const calculateMedian = (scores) => {
  if (!scores || scores.length === 0)
    return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return sorted[mid];
};
const calculateMode = (scores) => {
  if (!scores || scores.length === 0)
    return 0;
  const frequency = {};
  let maxFreq = 0;
  let mode = scores[0];
  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
    if (frequency[score] > maxFreq) {
      maxFreq = frequency[score];
      mode = score;
    }
  });
  return mode;
};
const filterRecords = (records, filter) => {
  if (!records || records.length === 0)
    return [];
  return records.filter((record) => {
    if (filter.startTime && record.createTime < filter.startTime)
      return false;
    if (filter.endTime && record.createTime > filter.endTime)
      return false;
    if (filter.scoreMin !== void 0 && record.totalScore < filter.scoreMin)
      return false;
    if (filter.scoreMax !== void 0 && record.totalScore > filter.scoreMax)
      return false;
    if (filter.bowType && record.bowType !== filter.bowType)
      return false;
    if (filter.scoreMode && record.scoreMode !== filter.scoreMode)
      return false;
    return true;
  });
};
const sortRecords = (records, sortType = "time", sortOrder = "desc") => {
  if (!records || records.length === 0)
    return [];
  const sorted = [...records];
  sorted.sort((a, b) => {
    let valueA, valueB;
    if (sortType === "time") {
      valueA = a.createTime;
      valueB = b.createTime;
    } else if (sortType === "score") {
      valueA = a.totalScore;
      valueB = b.totalScore;
    } else {
      return 0;
    }
    if (sortOrder === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
  return sorted;
};
const calculateStatistics = (records) => {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      totalScore: 0,
      avgScore: 0,
      medianScore: 0,
      modeScore: 0,
      maxScore: 0,
      minScore: 0,
      totalArrows: 0,
      arrowAvg: 0,
      xTotal: 0,
      tenTotal: 0,
      ringDistribution: {}
    };
  }
  const scores = records.map((r) => r.totalScore);
  let totalArrows = 0;
  let xTotal = 0;
  let tenTotal = 0;
  const ringDistribution = {
    "X": 0,
    "10": 0,
    "9": 0,
    "8": 0,
    "7": 0,
    "6": 0,
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
    "M": 0
  };
  records.forEach((record) => {
    if (record.groupScoreList) {
      record.groupScoreList.forEach((group) => {
        if (group.arrowScoreList) {
          totalArrows += group.arrowScoreList.length;
          group.arrowScoreList.forEach((score) => {
            if (score === "X") {
              xTotal++;
              ringDistribution["X"]++;
            } else if (score === "10") {
              tenTotal++;
              ringDistribution["10"]++;
            } else if (ringDistribution.hasOwnProperty(score)) {
              ringDistribution[score]++;
            }
          });
        }
      });
    }
  });
  const totalScore = scores.reduce((a, b) => a + b, 0);
  return {
    totalRecords: records.length,
    totalScore,
    avgScore: calculateAverage(scores),
    medianScore: calculateMedian(scores),
    modeScore: calculateMode(scores),
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    totalArrows,
    arrowAvg: totalArrows > 0 ? Number((totalScore / totalArrows).toFixed(2)) : 0,
    xTotal,
    tenTotal,
    ringDistribution
  };
};
const generateRingDistribution = (record) => {
  if (!record || !record.groupScoreList)
    return [];
  const distribution = {
    "X": 0,
    "10": 0,
    "9": 0,
    "8": 0,
    "7": 0,
    "6": 0,
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
    "M": 0
  };
  record.groupScoreList.forEach((group) => {
    if (group.arrowScoreList) {
      group.arrowScoreList.forEach((score) => {
        if (distribution.hasOwnProperty(score)) {
          distribution[score]++;
        }
      });
    }
  });
  const rings = ["X", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "M"];
  return rings.map((ring) => ({
    ring,
    count: distribution[ring]
  }));
};
const getRecordsByTimeRange = (records, timeRange) => {
  if (!records || records.length === 0)
    return [];
  if (timeRange === "all")
    return records;
  const now = /* @__PURE__ */ new Date();
  let startTime;
  switch (timeRange) {
    case "today":
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      break;
    case "week":
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1e3;
      break;
    case "month":
      startTime = now.getTime() - 30 * 24 * 60 * 60 * 1e3;
      break;
    default:
      return records;
  }
  return records.filter((r) => r.createTime >= startTime);
};
exports.calculateStatistics = calculateStatistics;
exports.filterRecords = filterRecords;
exports.generateRingDistribution = generateRingDistribution;
exports.getRecordsByTimeRange = getRecordsByTimeRange;
exports.sortRecords = sortRecords;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/statistics.js.map
