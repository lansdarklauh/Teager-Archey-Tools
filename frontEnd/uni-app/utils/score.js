/**
 * 计分相关工具函数
 */
import { formatTime, formatDate } from './date.js'
import { round2 } from './number.js'

/**
 * 生成唯一ID
 * @returns {string} - 唯一ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 将分数字符转换为数值
 * @param {string} scoreStr - 分数字符串（X/10/9/M等）
 * @param {boolean} is11Score - 是否11分制
 * @returns {number} - 分数值
 */
export const scoreToNumber = (scoreStr, is11Score = false) => {
    if (scoreStr === 'M' || scoreStr === '' || scoreStr === null || scoreStr === undefined) {
        return 0
    }
    if (scoreStr === 'X') {
        return is11Score ? 11 : 10
    }
    const num = parseInt(scoreStr, 10)
    return isNaN(num) ? 0 : num
}

/**
 * 计算单组总分
 * @param {Array} arrowScores - 箭分数列表
 * @param {boolean} is11Score - 是否11分制
 * @returns {number} - 总分
 */
export const calculateGroupScore = (arrowScores, is11Score = false) => {
    return arrowScores.reduce((sum, score) => {
        return sum + scoreToNumber(score, is11Score)
    }, 0)
}

/**
 * 计算累计总分
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} currentGroupIndex - 当前组索引（从0开始）
 * @returns {number} - 累计总分
 */
export const calculateAccumulateScore = (groupScoreList, currentGroupIndex) => {
    let total = 0
    for (let i = 0; i <= currentGroupIndex; i++) {
        if (groupScoreList[i]) {
            total += groupScoreList[i].groupTotalScore || 0
        }
    }
    return total
}

/**
 * 统计X数
 * @param {Array} arrowScores - 箭分数列表
 * @returns {number} - X数
 */
export const countX = (arrowScores) => {
    return arrowScores.filter(s => s === 'X').length
}

/**
 * 统计10环数
 * @param {Array} arrowScores - 箭分数列表
 * @returns {number} - 10环数
 */
export const countTen = (arrowScores) => {
    return arrowScores.filter(s => s === '10').length
}

/**
 * 统计脱靶数（M）
 * @param {Array} arrowScores - 箭分数列表
 * @returns {number} - 脱靶数
 */
export const countMiss = (arrowScores) => {
    return arrowScores.filter(s => s === 'M').length
}

/**
 * 创建空的组分数数据
 * @param {number} groupIndex - 组索引（从1开始）
 * @param {number} arrowNum - 箭数
 * @returns {object} - 组分数数据
 */
export const createEmptyGroupScore = (groupIndex, arrowNum) => {
    return {
        groupIndex,
        arrowScoreList: new Array(arrowNum).fill(''),
        groupTotalScore: 0,
        accumulateScore: 0,
        xCount: 0,
        tenCount: 0,
        missCount: 0,
        groupPhotoList: []
    }
}

/**
 * 创建新的计分记录
 * @param {object} config - 配置参数
 * @returns {object} - 计分记录
 */
export const createScoreRecord = (config) => {
    const {
        bowType = 'americanHuntingBow',
        bowName = '',
        distance = '30m',
        targetType = '80Full',
        groupNum = 6,
        arrowNum = 6,
        is11Score = false,
        isTakePhoto = false,
        isTiming = false,
        prepareTime = 10,
        formalTime = 180,
        scoreMode = 'normal',
        customTargetList = []
    } = config

    const now = Date.now()

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
        isSimpleMode: scoreMode === 'simple',
        presetName: '',
        isCompleted: false,
        currentGroupIndex: 0
    }
}

/**
 * 更新组分数数据
 * @param {object} groupScore - 组分数数据
 * @param {Array} arrowScores - 新的箭分数列表
 * @param {boolean} is11Score - 是否11分制
 * @param {number} accumulateScore - 累计分数
 * @returns {object} - 更新后的组分数数据
 */
export const updateGroupScoreData = (groupScore, arrowScores, is11Score, accumulateScore) => {
    const groupTotalScore = calculateGroupScore(arrowScores, is11Score)
    return {
        ...groupScore,
        arrowScoreList: arrowScores,
        groupTotalScore,
        accumulateScore: accumulateScore + groupTotalScore,
        xCount: countX(arrowScores),
        tenCount: countTen(arrowScores),
        missCount: countMiss(arrowScores)
    }
}

/**
 * 计算记录总分
 * @param {Array} groupScoreList - 组分数列表
 * @returns {number} - 总分
 */
export const calculateTotalScore = (groupScoreList) => {
    return groupScoreList.reduce((sum, group) => sum + (group.groupTotalScore || 0), 0)
}

/**
 * 计算箭均分（保留2位小数，避免浮点精度问题）
 * @param {number} totalScore - 总分
 * @param {number} totalArrowNum - 总箭数
 * @returns {string} - 箭均分
 */
export const calculateArrowAverage = (totalScore, totalArrowNum) => {
    if (totalArrowNum === 0) return '0.00'
    return round2(totalScore / totalArrowNum).toFixed(2)
}

/**
 * 统计环数分布
 * @param {Array} groupScoreList - 组分数列表
 * @returns {object} - 环数分布 { X: 10, 10: 20, 9: 15, ... }
 */
export const calculateRingDistribution = (groupScoreList) => {
    const distribution = {
        'X': 0, '10': 0, '9': 0, '8': 0, '7': 0, '6': 0,
        '5': 0, '4': 0, '3': 0, '2': 0, '1': 0, 'M': 0
    }

    groupScoreList.forEach(group => {
        if (group.arrowScoreList) {
            group.arrowScoreList.forEach(score => {
                if (score && distribution.hasOwnProperty(score)) {
                    distribution[score]++
                }
            })
        }
    })

    return distribution
}

/**
 * 获取弓种名称
 * @param {string} bowType - 弓种值
 * @returns {string} - 弓种名称
 */
export const getBowTypeName = (bowType) => {
    const bowTypes = {
        'competitiveRecurveBow': '竞技反曲弓',
        'compoundBow': '复合弓',
        'traditionalBow': '传统弓',
        'bareBow': '光弓',
        'americanHuntingBow': '美式猎弓'
    }
    return bowTypes[bowType] || bowType
}

/**
 * 获取靶面名称
 * @param {string} targetType - 靶面值
 * @returns {string} - 靶面名称
 */
export const getTargetTypeName = (targetType) => {
    const targetTypes = {
        '20Half': '20半',
        '40Half': '40半',
        '40Full': '40全',
        '60Half': '60半',
        '60Full': '60全',
        '80Half': '80半',
        '80Full': '80全',
        '122Full': '122全',
        '40Ring5': '40cm5环',
        '80Ring5': '80cm5环'
    }
    return targetTypes[targetType] || targetType
}

/**
 * 格式化时间戳 - 使用 dayjs 处理
 * @param {number} timestamp - 时间戳
 * @returns {string} - 格式化后的时间字符串
 */
export { formatTime, formatDate }

/**
 * 检查分数是否全部填写
 * @param {Array} arrowScores - 箭分数列表
 * @returns {boolean} - 是否全部填写
 */
export const isAllScoresFilled = (arrowScores) => {
    return arrowScores.every(score => score !== '' && score !== null && score !== undefined)
}

/**
 * 获取单组中第一个未填写分数的箭索引
 * @param {Array} arrowScores - 箭分数列表
 * @returns {number} - 第一个未填写的箭索引，全部填写则返回-1
 */
export const getFirstUnfilledArrowIndex = (arrowScores) => {
    const index = arrowScores.findIndex(
        score => score === '' || score === null || score === undefined
    )
    return index >= 0 ? index : -1
}

/**
 * 获取第一个未填写分数的位置（仅遍历已有组，兼容旧逻辑）
 * @param {Array} groupScoreList - 组分数列表
 * @returns {{ groupIndex: number, arrowIndex: number } | null} - 第一个未填写位置，全部填写则返回null
 */
export const getFirstUnfilledScoreLocation = (groupScoreList) => {
    for (let g = 0; g < groupScoreList.length; g++) {
        const group = groupScoreList[g]
        if (!group) continue
        const arrowScoreList = group.arrowScoreList || []
        for (let a = 0; a < arrowScoreList.length; a++) {
            const score = arrowScoreList[a]
            if (score === '' || score === null || score === undefined) {
                return { groupIndex: g, arrowIndex: a }
            }
        }
    }
    return null
}

/**
 * 获取某组的分数列表（不足用空字符串补齐）
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} groupIndex - 组索引
 * @param {number} arrowNum - 每组箭数
 * @returns {Array} - 该组的分数数组
 */
export const getGroupScores = (groupScoreList, groupIndex, arrowNum) => {
    const g = groupScoreList[groupIndex]
    const list = g?.arrowScoreList
    if (!list || !Array.isArray(list)) {
        return new Array(arrowNum).fill('')
    }
    return [...list].concat(new Array(arrowNum).fill('')).slice(0, arrowNum)
}

/**
 * 判断某组是否全部填完
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} groupIndex - 组索引
 * @param {number} arrowNum - 每组箭数
 * @returns {boolean}
 */
export const isGroupFilled = (groupScoreList, groupIndex, arrowNum) => {
    const scores = getGroupScores(groupScoreList, groupIndex, arrowNum)
    return scores.every(s => s !== '' && s !== null && s !== undefined)
}

/**
 * 按组数/箭数获取第一个未填写分数的位置
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} groupNum - 组数
 * @param {number} arrowNum - 每组箭数
 * @returns {{ groupIndex: number, arrowIndex: number } | null} - 第一个未填写位置，全部填写则返回null
 */
export const getFirstUnfilledLocation = (groupScoreList, groupNum, arrowNum) => {
    for (let g = 0; g < groupNum; g++) {
        const scores = getGroupScores(groupScoreList, g, arrowNum)
        for (let a = 0; a < arrowNum; a++) {
            const score = scores[a]
            if (score === '' || score === null || score === undefined) {
                return { groupIndex: g, arrowIndex: a }
            }
        }
    }
    return null
}

/**
 * 获取当前位之后下一个未填写的 (组, 箭) 位置（按组序、箭序）
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} groupNum - 组数
 * @param {number} arrowNum - 每组箭数
 * @param {number} currentGroupIndex - 当前组索引
 * @param {number} currentArrowIndex - 当前箭索引
 * @returns {{ groupIndex: number, arrowIndex: number } | null}
 */
export const getNextUnfilledLocation = (groupScoreList, groupNum, arrowNum, currentGroupIndex, currentArrowIndex) => {
    for (let g = 0; g < groupNum; g++) {
        const scores = getGroupScores(groupScoreList, g, arrowNum)
        const startA = (g === currentGroupIndex) ? currentArrowIndex + 1 : 0
        for (let a = startA; a < arrowNum; a++) {
            const score = scores[a]
            if (score === '' || score === null || score === undefined) {
                return { groupIndex: g, arrowIndex: a }
            }
        }
    }
    return null
}

/**
 * 获取当前位之前上一个未填写的 (组, 箭) 位置
 * @param {Array} groupScoreList - 组分数列表
 * @param {number} groupNum - 组数
 * @param {number} arrowNum - 每组箭数
 * @param {number} currentGroupIndex - 当前组索引
 * @param {number} currentArrowIndex - 当前箭索引
 * @returns {{ groupIndex: number, arrowIndex: number } | null}
 */
export const getPrevUnfilledLocation = (groupScoreList, groupNum, arrowNum, currentGroupIndex, currentArrowIndex) => {
    for (let g = currentGroupIndex; g >= 0; g--) {
        const scores = getGroupScores(groupScoreList, g, arrowNum)
        const endA = (g === currentGroupIndex) ? currentArrowIndex - 1 : arrowNum - 1
        for (let a = endA; a >= 0; a--) {
            const score = scores[a]
            if (score === '' || score === null || score === undefined) {
                return { groupIndex: g, arrowIndex: a }
            }
        }
    }
    return null
}

export default {
    generateId,
    scoreToNumber,
    calculateGroupScore,
    calculateAccumulateScore,
    countX,
    countTen,
    countMiss,
    createEmptyGroupScore,
    createScoreRecord,
    updateGroupScoreData,
    calculateTotalScore,
    calculateArrowAverage,
    calculateRingDistribution,
    getBowTypeName,
    getTargetTypeName,
    formatTime,
    formatDate,
    isAllScoresFilled,
    getFirstUnfilledArrowIndex,
    getFirstUnfilledScoreLocation,
    getGroupScores,
    isGroupFilled,
    getFirstUnfilledLocation,
    getNextUnfilledLocation,
    getPrevUnfilledLocation
}
