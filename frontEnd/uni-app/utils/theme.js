/**
 * 主题管理工具
 */

import { getUserInfo } from './storage.js';

/**
 * 获取当前主题色
 */
export function getThemeColor() {
    const userInfo = getUserInfo();
    return userInfo.themeColor || '#00C853';
}

/**
 * 设置主题色
 */
export function setThemeColor(color) {
    uni.$emit('themeColorChange', color);
}

/**
 * 应用主题色到页面元素
 * @param {Object} refs - 页面refs对象
 * @param {String} color - 主题色
 */
export function applyThemeColor(refs, color) {
    // 可以在这里实现具体的主题色应用逻辑
    // 由于uni-app的限制，建议使用动态style绑定
}

/**
 * Vue3 Composition API Hook - 使用主题色
 */
export function useThemeColor() {
    const { ref, onMounted, onUnmounted } = require('vue');
    const themeColor = ref(getThemeColor());

    const updateThemeColor = (color) => {
        themeColor.value = color;
    };

    onMounted(() => {
        uni.$on('themeColorChange', updateThemeColor);
    });

    onUnmounted(() => {
        uni.$off('themeColorChange', updateThemeColor);
    });

    return themeColor;
}

export default {
    getThemeColor,
    setThemeColor,
    applyThemeColor,
    useThemeColor
};
