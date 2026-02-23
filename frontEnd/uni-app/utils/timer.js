/**
 * 计时器工具函数
 */

import { TIMING_STAGES, TIMING_STAGE_NAMES } from './constants.js'

// 重新导出常量供外部使用
export { TIMING_STAGES, TIMING_STAGE_NAMES }

/**
 * 格式化秒数为时间显示
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间 mm:ss
 */
export const formatSeconds = (seconds) => {
    if (seconds < 0) seconds = 0
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化秒数为分钟显示
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的分钟数
 */
export const formatMinutes = (seconds) => {
    if (seconds < 60) return `${seconds}秒`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (secs === 0) return `${mins}分钟`
    return `${mins}分${secs}秒`
}

/**
 * 获取阶段名称
 * @param {string} stage - 阶段值
 * @returns {string} - 阶段名称
 */
export const getStageName = (stage) => {
    return TIMING_STAGE_NAMES[stage] || stage
}

/**
 * 创建计时配置
 * @param {object} config - 配置参数
 * @returns {object} - 计时配置
 */
export const createTimingConfig = (config = {}) => {
    return {
        faultToleranceTime: config.faultToleranceTime || 0,
        prepareTime: config.prepareTime || 10,
        formalTime: config.formalTime || 180,
        restTime: config.restTime || 0,
        isCycle: config.isCycle || false,
        cycleTimes: config.cycleTimes || 0,  // 0为无限循环
        tipSoundType: config.tipSoundType || 'sound',
        tipSoundPoints: config.tipSoundPoints || []
    }
}

/**
 * 获取计时总时长（单次）
 * @param {object} config - 计时配置
 * @returns {number} - 总时长（秒）
 */
export const getTotalDuration = (config) => {
    let total = config.formalTime || 0
    if (config.faultToleranceTime) total += config.faultToleranceTime
    if (config.prepareTime) total += config.prepareTime
    if (config.restTime) total += config.restTime
    return total
}

/**
 * 获取下一个计时阶段
 * @param {string} currentStage - 当前阶段
 * @param {object} config - 计时配置
 * @returns {string|null} - 下一个阶段，null表示结束
 */
export const getNextStage = (currentStage, config) => {
    const stages = []

    if (config.faultToleranceTime > 0) stages.push(TIMING_STAGES.FAULT_TOLERANCE)
    if (config.prepareTime > 0) stages.push(TIMING_STAGES.PREPARE)
    stages.push(TIMING_STAGES.FORMAL)
    if (config.restTime > 0) stages.push(TIMING_STAGES.REST)

    const currentIndex = stages.indexOf(currentStage)
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
        // 如果是循环模式且在休息时间结束后，回到准备时间
        if (config.isCycle && currentStage === TIMING_STAGES.REST) {
            return config.prepareTime > 0 ? TIMING_STAGES.PREPARE : TIMING_STAGES.FORMAL
        }
        return null
    }

    return stages[currentIndex + 1]
}

/**
 * 获取阶段时长
 * @param {string} stage - 阶段
 * @param {object} config - 计时配置
 * @returns {number} - 时长（秒）
 */
export const getStageDuration = (stage, config) => {
    switch (stage) {
        case TIMING_STAGES.FAULT_TOLERANCE:
            return config.faultToleranceTime || 0
        case TIMING_STAGES.PREPARE:
            return config.prepareTime || 0
        case TIMING_STAGES.FORMAL:
            return config.formalTime || 0
        case TIMING_STAGES.REST:
            return config.restTime || 0
        default:
            return 0
    }
}

/**
 * 获取初始阶段
 * @param {object} config - 计时配置
 * @returns {string} - 初始阶段
 */
export const getInitialStage = (config) => {
    if (config.faultToleranceTime > 0) return TIMING_STAGES.FAULT_TOLERANCE
    if (config.prepareTime > 0) return TIMING_STAGES.PREPARE
    return TIMING_STAGES.FORMAL
}

/**
 * 创建计时状态
 * @param {object} config - 计时配置
 * @returns {object} - 计时状态
 */
export const createTimingState = (config) => {
    const initialStage = getInitialStage(config)
    return {
        isRunning: false,
        isPaused: false,
        currentStage: initialStage,
        remainingTime: getStageDuration(initialStage, config),
        currentCycle: 1,
        totalCycles: config.cycleTimes || 0
    }
}

/**
 * 计算计分模式的计时配置
 * @param {number} arrowNum - 箭数
 * @param {number} prepareTime - 准备时间
 * @returns {object} - 计时配置
 */
export const calculateScoreTimingConfig = (arrowNum, prepareTime = 10) => {
    // 每箭30秒
    const formalTime = arrowNum * 30
    return {
        faultToleranceTime: 0,
        prepareTime,
        formalTime,
        restTime: 0,
        isCycle: false
    }
}

/**
 * 检查是否需要播放提示音
 * @param {string} stage - 当前阶段
 * @param {number} remainingTime - 剩余时间
 * @param {Array} tipSoundPoints - 提示音关键点
 * @returns {boolean} - 是否需要播放
 */
export const shouldPlaySound = (stage, remainingTime, tipSoundPoints = []) => {
    // 阶段切换时播放提示音
    if (remainingTime === getStageDuration(stage, {}) - 1) {
        return true
    }
    // 正式时间中的关键点
    if (stage === TIMING_STAGES.FORMAL && tipSoundPoints.includes(remainingTime)) {
        return true
    }
    // 最后3秒倒计时
    if (remainingTime <= 3 && remainingTime > 0) {
        return true
    }
    return false
}

export default {
    formatSeconds,
    formatMinutes,
    getStageName,
    createTimingConfig,
    getTotalDuration,
    getNextStage,
    getStageDuration,
    getInitialStage,
    createTimingState,
    calculateScoreTimingConfig,
    shouldPlaySound
}
