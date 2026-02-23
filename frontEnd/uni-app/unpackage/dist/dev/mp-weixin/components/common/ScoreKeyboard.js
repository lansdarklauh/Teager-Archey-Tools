"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "ScoreKeyboard",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    maxScore: {
      type: Number,
      default: 10
    }
  },
  emits: ["input", "delete", "done", "close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const row1 = common_vendor.computed(() => [
      { value: "1", label: "1", score: 1, colorClass: "key-white" },
      { value: "2", label: "2", score: 2, colorClass: "key-white" },
      { value: "3", label: "3", score: 3, colorClass: "key-black" }
    ]);
    const row2 = common_vendor.computed(() => [
      { value: "4", label: "4", score: 4, colorClass: "key-black" },
      { value: "5", label: "5", score: 5, colorClass: "key-blue" },
      { value: "6", label: "6", score: 6, colorClass: "key-blue" }
    ]);
    const row3 = common_vendor.computed(() => [
      { value: "7", label: "7", score: 7, colorClass: "key-red" },
      { value: "8", label: "8", score: 8, colorClass: "key-red" },
      { value: "9", label: "9", score: 9, colorClass: "key-yellow" }
    ]);
    const onKeyPress = (key) => {
      emit("input", key);
    };
    const onDelete = () => {
      emit("delete");
    };
    const onDone = () => {
      emit("done");
      emit("close");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.t(__props.title),
        c: common_vendor.o(onDelete),
        d: common_vendor.o(onDone),
        e: common_vendor.f(row1.value, (key, k0, i0) => {
          return {
            a: common_vendor.t(key.label),
            b: common_vendor.n(key.colorClass),
            c: key.value,
            d: common_vendor.o(($event) => onKeyPress(key), key.value)
          };
        }),
        f: common_vendor.f(row2.value, (key, k0, i0) => {
          return {
            a: common_vendor.t(key.label),
            b: common_vendor.n(key.colorClass),
            c: key.value,
            d: common_vendor.o(($event) => onKeyPress(key), key.value)
          };
        }),
        g: common_vendor.f(row3.value, (key, k0, i0) => {
          return {
            a: common_vendor.t(key.label),
            b: common_vendor.n(key.colorClass),
            c: key.value,
            d: common_vendor.o(($event) => onKeyPress(key), key.value)
          };
        }),
        h: common_vendor.o(($event) => onKeyPress({
          value: "X",
          label: "X",
          score: 10
        })),
        i: common_vendor.o(($event) => onKeyPress({
          value: "10",
          label: "10",
          score: 10
        })),
        j: common_vendor.o(($event) => onKeyPress({
          value: "M",
          label: "M",
          score: 0
        })),
        k: common_vendor.o(() => {
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9897bdb5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/ScoreKeyboard.js.map
