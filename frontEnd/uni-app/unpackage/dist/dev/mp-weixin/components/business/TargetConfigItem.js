"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_constants = require("../../utils/constants.js");
const utils_theme = require("../../utils/theme.js");
if (!Math) {
  Popup();
}
const Popup = () => "../common/Popup.js";
const _sfc_main = {
  __name: "TargetConfigItem",
  props: {
    index: {
      type: Number,
      default: 1
    },
    config: {
      type: Object,
      default: () => ({
        arrowNum: 6,
        distance: "30m",
        targetType: "80Full"
      })
    },
    showCopy: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    }
  },
  emits: ["change", "copy", "delete"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "ee2c1684": themeColor.value,
      "22546df2": themeColor.value + "1A"
    }));
    const props = __props;
    const emit = __emit;
    const themeColor = common_vendor.ref(utils_theme.getThemeColor());
    const localConfig = common_vendor.reactive({
      arrowNum: props.config.arrowNum || 6,
      distance: props.config.distance || "30m",
      targetType: props.config.targetType || "80Full"
    });
    const distances = common_vendor.ref(utils_constants.DISTANCES);
    const targets = common_vendor.ref(utils_constants.TARGET_TYPES);
    const showDistancePicker = common_vendor.ref(false);
    const showTargetPicker = common_vendor.ref(false);
    const customDistance = common_vendor.ref("");
    common_vendor.watch(
      () => props.config,
      (newVal) => {
        localConfig.arrowNum = newVal.arrowNum || 6;
        localConfig.distance = newVal.distance || "30m";
        localConfig.targetType = newVal.targetType || "80Full";
      },
      { deep: true }
    );
    const getTargetLabel = (value) => {
      const target = targets.value.find((t) => t.value === value);
      return target ? target.label : value;
    };
    const selectDistance = (d) => {
      localConfig.distance = d.value;
      customDistance.value = "";
    };
    const selectTarget = (t) => {
      localConfig.targetType = t.value;
    };
    const onDistanceConfirm = () => {
      if (customDistance.value) {
        localConfig.distance = customDistance.value + "m";
      }
      showDistancePicker.value = false;
      onConfigChange();
    };
    const onTargetConfirm = () => {
      showTargetPicker.value = false;
      onConfigChange();
    };
    const onConfigChange = () => {
      emit("change", { ...localConfig });
    };
    const onCopy = () => {
      emit("copy", props.index - 1);
    };
    const onDelete = () => {
      emit("delete", props.index - 1);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(__props.index),
        b: __props.showCopy
      }, __props.showCopy ? {
        c: common_vendor.o(onCopy)
      } : {}, {
        d: __props.showDelete
      }, __props.showDelete ? {
        e: common_vendor.o(onDelete)
      } : {}, {
        f: common_vendor.o(onConfigChange),
        g: localConfig.arrowNum,
        h: common_vendor.o(($event) => localConfig.arrowNum = $event.detail.value),
        i: common_vendor.t(localConfig.distance || "选择距离"),
        j: common_vendor.o(($event) => showDistancePicker.value = true),
        k: common_vendor.t(getTargetLabel(localConfig.targetType) || "选择靶面"),
        l: common_vendor.o(($event) => showTargetPicker.value = true),
        m: common_vendor.f(distances.value, (d, k0, i0) => {
          return {
            a: common_vendor.t(d.label),
            b: localConfig.distance === d.value ? 1 : "",
            c: d.value,
            d: common_vendor.o(($event) => selectDistance(d), d.value)
          };
        }),
        n: customDistance.value,
        o: common_vendor.o(($event) => customDistance.value = $event.detail.value),
        p: common_vendor.o(onDistanceConfirm),
        q: common_vendor.o(($event) => showDistancePicker.value = $event),
        r: common_vendor.p({
          title: "选择距离",
          position: "bottom",
          visible: showDistancePicker.value
        }),
        s: common_vendor.f(targets.value, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.label),
            b: localConfig.targetType === t.value ? 1 : "",
            c: t.value,
            d: common_vendor.o(($event) => selectTarget(t), t.value)
          };
        }),
        t: common_vendor.o(onTargetConfirm),
        v: common_vendor.o(($event) => showTargetPicker.value = $event),
        w: common_vendor.p({
          title: "选择靶面",
          position: "bottom",
          visible: showTargetPicker.value
        }),
        x: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0e59c976"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/business/TargetConfigItem.js.map
