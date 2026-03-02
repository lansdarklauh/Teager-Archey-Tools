/**
 * 本地存储工具类
 * 基于小程序 storage 封装，支持数据的增删改查
 */

// 存储 key 常量
export const STORAGE_KEYS = {
    SCORE_RECORDS: 'scoreRecords',      // 计分记录
    BASE_CONFIG: 'baseConfig',          // 基础配置
    TIMING_PRESET: 'timingPreset',      // 计时预设
    CUSTOM_PRESET: 'customPreset',      // 自定义模式预设
    USER_INFO: 'userInfo'               // 用户信息
}

/**
 * 设置存储
 * @param {string} key - 存储键名
 * @param {any} value - 存储值
 * @returns {Promise<boolean>} - 是否成功
 */
export const setItem = (key, value) => {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.stringify(value)
            uni.setStorageSync(key, data)
            resolve(true)
        } catch (e) {
            console.error('存储数据失败:', e)
            reject(e)
        }
    })
}

/**
 * 获取存储
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} - 存储值
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const data = uni.getStorageSync(key)
        if (data) {
            return JSON.parse(data)
        }
        return defaultValue
    } catch (e) {
        console.error('获取数据失败:', e)
        return defaultValue
    }
}

/**
 * 更新存储（局部更新对象类型）
 * @param {string} key - 存储键名
 * @param {object} updateData - 更新数据
 * @returns {Promise<boolean>} - 是否成功
 */
export const updateItem = (key, updateData) => {
    return new Promise((resolve, reject) => {
        try {
            const oldData = getItem(key, {})
            const newData = { ...oldData, ...updateData }
            setItem(key, newData)
            resolve(true)
        } catch (e) {
            console.error('更新数据失败:', e)
            reject(e)
        }
    })
}

/**
 * 删除存储
 * @param {string} key - 存储键名
 * @returns {Promise<boolean>} - 是否成功
 */
export const removeItem = (key) => {
    return new Promise((resolve, reject) => {
        try {
            uni.removeStorageSync(key)
            resolve(true)
        } catch (e) {
            console.error('删除数据失败:', e)
            reject(e)
        }
    })
}

/**
 * 清空所有存储
 * @returns {Promise<boolean>} - 是否成功
 */
export const clearAll = () => {
    return new Promise((resolve, reject) => {
        try {
            uni.clearStorageSync()
            resolve(true)
        } catch (e) {
            console.error('清空数据失败:', e)
            reject(e)
        }
    })
}

// =============== 计分记录专用方法 ===============

/**
 * 获取所有计分记录
 * @returns {Array} - 计分记录列表
 */
export const getScoreRecords = () => {
    return getItem(STORAGE_KEYS.SCORE_RECORDS, [])
}

/**
 * 添加计分记录
 * @param {object} record - 计分记录
 * @returns {Promise<boolean>} - 是否成功
 */
export const addScoreRecord = (record) => {
    const records = getScoreRecords()
    records.unshift(record) // 新记录添加到开头
    return setItem(STORAGE_KEYS.SCORE_RECORDS, records)
}

/**
 * 更新计分记录
 * @param {string} recordId - 记录ID
 * @param {object} updateData - 更新数据
 * @returns {Promise<boolean>} - 是否成功
 */
export const updateScoreRecord = (recordId, updateData) => {
    const records = getScoreRecords()
    const index = records.findIndex(r => r.scoreRecordId === recordId)
    if (index > -1) {
        records[index] = { ...records[index], ...updateData, updateTime: Date.now() }
        return setItem(STORAGE_KEYS.SCORE_RECORDS, records)
    }
    return Promise.resolve(false)
}

/**
 * 删除计分记录
 * @param {string} recordId - 记录ID
 * @returns {Promise<boolean>} - 是否成功
 */
export const deleteScoreRecord = (recordId) => {
    const records = getScoreRecords()
    const newRecords = records.filter(r => r.scoreRecordId !== recordId)
    return setItem(STORAGE_KEYS.SCORE_RECORDS, newRecords)
}

/**
 * 根据ID获取计分记录
 * @param {string} recordId - 记录ID
 * @returns {object|null} - 计分记录
 */
export const getScoreRecordById = (recordId) => {
    const records = getScoreRecords()
    return records.find(r => r.scoreRecordId === recordId) || null
}

// =============== 自定义预设专用方法 ===============

/**
 * 获取自定义预设
 * @returns {Array} - 预设列表
 */
export const getCustomPresets = () => {
    return getItem(STORAGE_KEYS.CUSTOM_PRESET, [])
}

/**
 * 添加自定义预设
 * @param {object} preset - 预设配置
 * @returns {Promise<boolean>} - 是否成功
 */
export const addCustomPreset = (preset) => {
    const presets = getCustomPresets()
    if (presets.length >= 3) {
        return Promise.reject(new Error('预设数量已达上限'))
    }
    presets.push(preset)
    return setItem(STORAGE_KEYS.CUSTOM_PRESET, presets)
}

/**
 * 删除自定义预设
 * @param {string} presetId - 预设ID
 * @returns {Promise<boolean>} - 是否成功
 */
export const deleteCustomPreset = (presetId) => {
    const presets = getCustomPresets()
    const newPresets = presets.filter(p => p.presetId !== presetId)
    return setItem(STORAGE_KEYS.CUSTOM_PRESET, newPresets)
}

// =============== 计时预设专用方法 ===============

/**
 * 获取计时预设
 * @returns {Array} - 预设列表
 */
export const getTimingPresets = () => {
    return getItem(STORAGE_KEYS.TIMING_PRESET, [
        {
            presetId: 'default_1',
            name: '标准运动模式',
            config: { faultToleranceTime: 0, prepareTime: 10, formalTime: 180, restTime: 0, isCycle: false }
        },
        {
            presetId: 'default_2',
            name: '循环训练模式',
            config: { faultToleranceTime: 5, prepareTime: 5, formalTime: 30, restTime: 30, isCycle: true }
        }
    ])
}

/**
 * 保存计时预设
 * @param {Array} presets - 预设列表
 * @returns {Promise<boolean>} - 是否成功
 */
export const saveTimingPresets = (presets) => {
    return setItem(STORAGE_KEYS.TIMING_PRESET, presets)
}

// =============== 用户信息专用方法 ===============

/**
 * 获取用户信息
 * @returns {object} - 用户信息
 */
export const getUserInfo = () => {
    return getItem(STORAGE_KEYS.USER_INFO, {
        nickname: '射箭爱好者',
        avatar: '',
        bowTypes: [],
        bows: [],
        introduction: '',
        defaultBowType: 'americanHuntingBow',
        defaultDistance: '30m',
        defaultTarget: '80Full',
        defaultGroupArrow: '6箭/6组/共36箭',
        themeColor: '#00C853'
    })
}

/**
 * 更新用户信息
 * @param {object} info - 用户信息
 * @returns {Promise<boolean>} - 是否成功
 */
export const updateUserInfo = (info) => {
    const oldInfo = getUserInfo()
    return setItem(STORAGE_KEYS.USER_INFO, { ...oldInfo, ...info })
}

// =============== 基础配置专用方法 ===============

/**
 * 获取基础配置
 * @returns {object} - 基础配置
 */
export const getBaseConfig = () => {
    return getItem(STORAGE_KEYS.BASE_CONFIG, {
        defaultBowType: 'americanHuntingBow',
        defaultDistance: '30m',
        defaultTarget: '80Full',
        defaultGroupArrow: { groupNum: 6, arrowNum: 6 },
        defaultIs11Score: false,
        defaultIsTakePhoto: false,
        defaultIsTiming: false,
        defaultPrepareTime: 10,
        defaultFormalTime: 180,
        themeColor: '#00C853',
        defaultMode: 'normal'
    })
}

/**
 * 更新基础配置
 * @param {object} config - 配置项
 * @returns {Promise<boolean>} - 是否成功
 */
export const updateBaseConfig = (config) => {
    const oldConfig = getBaseConfig()
    return setItem(STORAGE_KEYS.BASE_CONFIG, { ...oldConfig, ...config })
}

export default {
    STORAGE_KEYS,
    setItem,
    getItem,
    updateItem,
    removeItem,
    clearAll,
    getScoreRecords,
    addScoreRecord,
    updateScoreRecord,
    deleteScoreRecord,
    getScoreRecordById,
    getCustomPresets,
    addCustomPreset,
    deleteCustomPreset,
    getTimingPresets,
    saveTimingPresets,
    getUserInfo,
    updateUserInfo,
    getBaseConfig,
    updateBaseConfig
}
