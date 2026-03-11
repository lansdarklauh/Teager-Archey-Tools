/**
 * 常量配置文件
 */

// 弓种配置
export const BOW_TYPES = [
    { value: 'competitiveRecurveBow', label: '竞技反曲弓', icon: 'bow' },
    { value: 'compoundBow', label: '复合弓', icon: 'bow' },
    { value: 'traditionalBow', label: '传统弓', icon: 'bow' },
    { value: 'bareBow', label: '光弓', icon: 'bow' },
    { value: 'americanHuntingBow', label: '美式猎弓', icon: 'bow' }
]

// 距离配置
export const DISTANCES = [
    { value: '10m', label: '10米' },
    { value: '18m', label: '18米' },
    { value: '30m', label: '30米' },
    { value: '50m', label: '50米' },
    { value: '70m', label: '70米' }
]

// 靶面配置
export const TARGET_TYPES = [
    { value: '20Half', label: '20半', size: 20, rings: 10, isHalf: true },
    { value: '40Half', label: '40半', size: 40, rings: 10, isHalf: true },
    { value: '40Full', label: '40全', size: 40, rings: 10, isHalf: false },
    { value: '60Half', label: '60半', size: 60, rings: 10, isHalf: true },
    { value: '60Full', label: '60全', size: 60, rings: 10, isHalf: false },
    { value: '80Half', label: '80半', size: 80, rings: 10, isHalf: true },
    { value: '80Full', label: '80全', size: 80, rings: 10, isHalf: false },
    { value: '122Full', label: '122全', size: 122, rings: 10, isHalf: false },
    { value: '40Ring5', label: '40cm5环', size: 40, rings: 5, isHalf: false },
    { value: '80Ring5', label: '80cm5环', size: 80, rings: 5, isHalf: false }
]

// 组数/箭数预设
export const GROUP_ARROW_PRESETS = [
    { groupNum: 10, arrowNum: 3, label: '3箭/10组/共30箭' },
    { groupNum: 6, arrowNum: 6, label: '6箭/6组/共36箭' },
    { groupNum: 10, arrowNum: 6, label: '6箭/10组/共60箭' },
    { groupNum: 12, arrowNum: 6, label: '6箭/12组/共72箭' }
]

// 计分模式
export const SCORE_MODES = [
    { value: 'normal', label: '普通模式', desc: '多选项' },
    { value: 'simple', label: '简易模式', desc: '基础选项' },
    { value: 'custom', label: '自定义', desc: '多选项+靶子调整' }
]

// 九宫格分数值
export const SCORE_KEYS = [
    { value: '1', label: '1', score: 1 },
    { value: '2', label: '2', score: 2 },
    { value: '3', label: '3', score: 3 },
    { value: '4', label: '4', score: 4 },
    { value: '5', label: '5', score: 5 },
    { value: '6', label: '6', score: 6 },
    { value: '7', label: '7', score: 7 },
    { value: '8', label: '8', score: 8 },
    { value: '9', label: '9', score: 9 },
    { value: 'X', label: 'X', score: 10 },
    { value: 'M', label: 'M', score: 0 },
    { value: '10', label: '10', score: 10 }
]

// 计时阶段
export const TIMING_STAGES = {
    FAULT_TOLERANCE: 'faultTolerance',  // 容错时间
    PREPARE: 'prepare',                  // 准备时间
    FORMAL: 'formal',                    // 正式时间
    REST: 'rest'                         // 休息时间
}

// 计时阶段名称
export const TIMING_STAGE_NAMES = {
    [TIMING_STAGES.FAULT_TOLERANCE]: '容错时间',
    [TIMING_STAGES.PREPARE]: '准备时间',
    [TIMING_STAGES.FORMAL]: '正式时间',
    [TIMING_STAGES.REST]: '休息时间'
}

// 提示音类型
export const TIP_SOUND_TYPES = [
    { value: 'sound', label: '音效' },
    { value: 'voice', label: '语音' }
]

// 排序类型
export const SORT_TYPES = [
    { value: 'time', label: '按时间' },
    { value: 'score', label: '按分数' }
]

// 排序顺序
export const SORT_ORDERS = [
    { value: 'desc', label: '降序' },
    { value: 'asc', label: '升序' }
]

// 环数对应颜色（用于统计图表、分数徽章）
// X/10/9黄色 8/7红色 6/5蓝色 4/3黑色白字 2/1白色黑字黑边框 M灰色黑字
export const RING_COLORS = {
    'X': '#FFD700',   // 黄色
    '10': '#FFD700',
    '9': '#FFD700',
    '8': '#FF0000',   // 红色
    '7': '#FF0000',
    '6': '#2196F3',   // 蓝色
    '5': '#2196F3',
    '4': '#000000',   // 黑色
    '3': '#000000',
    '2': '#eeeeee',   // 白色（需黑字黑边框）
    '1': '#eeeeee',
    'M': '#9E9E9E'    // 灰色
}

// 主题色选项
export const THEME_COLORS = [
    { value: '#00C853', label: '绿色' },
    { value: '#2196F3', label: '蓝色' },
    { value: '#FF5722', label: '橙色' },
    { value: '#9C27B0', label: '紫色' },
    { value: '#F44336', label: '红色' }
]

// 最大配置
export const MAX_CONFIG = {
    MAX_PRESET_NUM: 3,      // 自定义模式最大预设数
    MAX_PHOTO_NUM: 3,       // 单组最大拍照数
    MAX_TARGET_NUM: 6,      // 自定义模式最大靶面数
    MAX_GROUP_NUM: 20,      // 最大组数
    MAX_ARROW_NUM: 12,      // 每组最大箭数
    MAX_RINGS: 11           // 最大环数（11分制）
}

export default {
    BOW_TYPES,
    DISTANCES,
    TARGET_TYPES,
    GROUP_ARROW_PRESETS,
    SCORE_MODES,
    SCORE_KEYS,
    TIMING_STAGES,
    TIMING_STAGE_NAMES,
    TIP_SOUND_TYPES,
    SORT_TYPES,
    SORT_ORDERS,
    RING_COLORS,
    THEME_COLORS,
    MAX_CONFIG
}
