"use strict";
const BOW_TYPES = [
  { value: "competitiveRecurveBow", label: "竞技反曲弓", icon: "bow" },
  { value: "compoundBow", label: "复合弓", icon: "bow" },
  { value: "traditionalBow", label: "传统弓", icon: "bow" },
  { value: "bareBow", label: "光弓", icon: "bow" },
  { value: "americanHuntingBow", label: "美式猎弓", icon: "bow" }
];
const DISTANCES = [
  { value: "10m", label: "10米" },
  { value: "18m", label: "18米" },
  { value: "30m", label: "30米" },
  { value: "50m", label: "50米" },
  { value: "70m", label: "70米" }
];
const TARGET_TYPES = [
  { value: "20Half", label: "20半", size: 20, rings: 10, isHalf: true },
  { value: "40Half", label: "40半", size: 40, rings: 10, isHalf: true },
  { value: "40Full", label: "40全", size: 40, rings: 10, isHalf: false },
  { value: "60Half", label: "60半", size: 60, rings: 10, isHalf: true },
  { value: "60Full", label: "60全", size: 60, rings: 10, isHalf: false },
  { value: "80Half", label: "80半", size: 80, rings: 10, isHalf: true },
  { value: "80Full", label: "80全", size: 80, rings: 10, isHalf: false },
  { value: "122Full", label: "122全", size: 122, rings: 10, isHalf: false },
  { value: "40Ring5", label: "40cm5环", size: 40, rings: 5, isHalf: false },
  { value: "80Ring5", label: "80cm5环", size: 80, rings: 5, isHalf: false }
];
const GROUP_ARROW_PRESETS = [
  { groupNum: 3, arrowNum: 10, label: "3组/10箭/共30箭" },
  { groupNum: 6, arrowNum: 6, label: "6组/6箭/共36箭" },
  { groupNum: 6, arrowNum: 10, label: "6组/10箭/共60箭" },
  { groupNum: 6, arrowNum: 12, label: "6组/12箭/共72箭" }
];
const SCORE_MODES = [
  { value: "normal", label: "普通模式", desc: "多选项" },
  { value: "simple", label: "简易模式", desc: "基础选项" },
  { value: "custom", label: "自定义", desc: "多选项+靶子调整" }
];
const TIMING_STAGES = {
  FAULT_TOLERANCE: "faultTolerance",
  // 容错时间
  PREPARE: "prepare",
  // 准备时间
  FORMAL: "formal",
  // 正式时间
  REST: "rest"
  // 休息时间
};
const THEME_COLORS = [
  { value: "#00C853", label: "绿色" },
  { value: "#2196F3", label: "蓝色" },
  { value: "#FF5722", label: "橙色" },
  { value: "#9C27B0", label: "紫色" },
  { value: "#F44336", label: "红色" }
];
exports.BOW_TYPES = BOW_TYPES;
exports.DISTANCES = DISTANCES;
exports.GROUP_ARROW_PRESETS = GROUP_ARROW_PRESETS;
exports.SCORE_MODES = SCORE_MODES;
exports.TARGET_TYPES = TARGET_TYPES;
exports.THEME_COLORS = THEME_COLORS;
exports.TIMING_STAGES = TIMING_STAGES;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/constants.js.map
