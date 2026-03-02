"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const _sfc_main = {
  __name: "GroupPicker",
  props: {
    defaultGroupNum: {
      type: Number,
      default: 6
    },
    defaultArrowNum: {
      type: Number,
      default: 6
    },
    hasExistingData: {
      type: Boolean,
      default: false
    }
  },
  emits: ["confirm", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const usePreset = common_vendor.ref(true);
    const groupNum = common_vendor.ref(props.defaultGroupNum);
    const arrowNum = common_vendor.ref(props.defaultArrowNum);
    const currentPreset = common_vendor.ref("");
    const presets = common_vendor.ref(utils_constants.GROUP_ARROW_PRESETS);
    const totalArrows = common_vendor.computed(() => {
      return (parseInt(groupNum.value) || 0) * (parseInt(arrowNum.value) || 0);
    });
    const initPreset = () => {
      const preset = presets.value.find(
        (p) => p.groupNum === props.defaultGroupNum && p.arrowNum === props.defaultArrowNum
      );
      if (preset) {
        currentPreset.value = preset.label;
      }
    };
    initPreset();
    const onPresetChange = (e) => {
      usePreset.value = e.detail.value;
      if (!usePreset.value) {
        currentPreset.value = "";
      }
    };
    const selectPreset = (preset) => {
      currentPreset.value = preset.label;
      groupNum.value = preset.groupNum;
      arrowNum.value = preset.arrowNum;
    };
    const onConfirm = () => {
      const g = parseInt(groupNum.value) || 6;
      const a = parseInt(arrowNum.value) || 6;
      if (g === props.defaultGroupNum && a === props.defaultArrowNum) {
        emit("close");
        return;
      }
      if (props.hasExistingData) {
        emit("confirm", {
          groupNum: g,
          arrowNum: a,
          totalArrows: g * a,
          label: `${a}箭/${g}组/共${g * a}箭`,
          needConfirm: true
          // 标记需要二次确认
        });
      } else {
        emit("confirm", {
          groupNum: g,
          arrowNum: a,
          totalArrows: g * a,
          label: `${a}箭/${g}组/共${g * a}箭`,
          needConfirm: false
        });
      }
    };
    const onClose = () => {
      emit("close");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onClose),
        b: usePreset.value,
        c: common_vendor.o(onPresetChange),
        d: usePreset.value
      }, usePreset.value ? {
        e: common_vendor.f(presets.value, (preset, k0, i0) => {
          return {
            a: common_vendor.t(preset.label),
            b: currentPreset.value === preset.label ? 1 : "",
            c: preset.label,
            d: common_vendor.o(($event) => selectPreset(preset), preset.label)
          };
        })
      } : {}, {
        f: !usePreset.value
      }, !usePreset.value ? {
        g: groupNum.value,
        h: common_vendor.o(($event) => groupNum.value = $event.detail.value),
        i: arrowNum.value,
        j: common_vendor.o(($event) => arrowNum.value = $event.detail.value)
      } : {}, {
        k: common_vendor.t(groupNum.value),
        l: common_vendor.t(arrowNum.value),
        m: common_vendor.t(totalArrows.value),
        n: common_vendor.o(onConfirm)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7004e133"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/GroupPicker.js.map
