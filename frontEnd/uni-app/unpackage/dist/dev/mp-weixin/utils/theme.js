"use strict";
require("../common/vendor.js");
const utils_storage = require("./storage.js");
function getThemeColor() {
  const userInfo = utils_storage.getUserInfo();
  return userInfo.themeColor || "#00C853";
}
exports.getThemeColor = getThemeColor;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/theme.js.map
