/**
 * 时间处理工具 - 基于 dayjs
 * 技术文档要求使用 dayjs 处理计分记录的时间相关逻辑
 */
const dayjs = require('../static/js/dayjs.min.js')

/**
 * 格式化时间戳为日期时间字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 格式模板，默认 'YYYY/MM/DD HH:mm'
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (timestamp, format = 'YYYY/MM/DD HH:mm') => {
  if (!timestamp) return ''
  const d = dayjs(timestamp)
  return d.isValid() ? d.format(format) : ''
}

/**
 * 格式化时间戳为日期字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 格式模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (timestamp, format = 'YYYY-MM-DD') => {
  if (!timestamp) return ''
  const d = dayjs(timestamp)
  return d.isValid() ? d.format(format) : ''
}

/**
 * 获取今天的起始时间戳
 * @returns {number} 今天 00:00:00 的时间戳
 */
export const getTodayStart = () => {
  return dayjs().startOf('day').valueOf()
}

/**
 * 获取本周起始时间戳（7天前）
 * @returns {number} 7天前的起始时间戳
 */
export const getWeekStart = () => {
  return dayjs().subtract(7, 'day').valueOf()
}

/**
 * 获取本月起始时间戳（30天前）
 * @returns {number} 30天前的起始时间戳
 */
export const getMonthStart = () => {
  return dayjs().subtract(30, 'day').valueOf()
}

/**
 * 将日期字符串转为时间戳
 * @param {string} dateStr - 日期字符串，如 'YYYY-MM-DD'
 * @returns {number} 时间戳
 */
export const parseToTimestamp = (dateStr) => {
  if (!dateStr) return 0
  return dayjs(dateStr).valueOf()
}

export default {
  formatTime,
  formatDate,
  getTodayStart,
  getWeekStart,
  getMonthStart,
  parseToTimestamp,
  dayjs
}
