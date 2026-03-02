/**
 * 数字处理工具 - 解决 JS 浮点数精度问题
 */

/**
 * 保留两位小数（返回数字）
 * 使用 Math.round 避免浮点精度问题，如 0.1 + 0.2 !== 0.3
 * @param {number} num - 待处理数字
 * @returns {number} 保留2位小数的数字
 */
export const round2 = (num) => {
  if (num == null || num === '' || isNaN(Number(num))) return 0
  return Math.round(Number(num) * 100) / 100
}

/**
 * 保留两位小数（返回字符串，用于显示）
 * @param {number} num - 待处理数字
 * @returns {string} 如 "12.34"
 */
export const formatDecimal2 = (num) => {
  return round2(num).toFixed(2)
}
