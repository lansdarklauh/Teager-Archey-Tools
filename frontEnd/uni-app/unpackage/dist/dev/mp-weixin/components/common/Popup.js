"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "Popup",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    position: {
      type: String,
      default: "center"
      // center, bottom
    },
    closeOnMask: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "确定"
    }
  },
  emits: ["update:visible", "close", "confirm", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const onMaskClick = () => {
      if (props.closeOnMask) {
        onClose();
      }
    };
    const onClose = () => {
      emit("update:visible", false);
      emit("close");
    };
    const onCancel = () => {
      emit("cancel");
      onClose();
    };
    const onConfirm = () => {
      emit("confirm");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: __props.showHeader
      }, __props.showHeader ? {
        c: common_vendor.t(__props.title),
        d: common_vendor.o(onClose)
      } : {}, {
        e: __props.showFooter
      }, __props.showFooter ? {
        f: common_vendor.t(__props.cancelText),
        g: common_vendor.o(onCancel),
        h: common_vendor.t(__props.confirmText),
        i: common_vendor.o(onConfirm)
      } : {}, {
        j: common_vendor.n(__props.position),
        k: common_vendor.o(() => {
        }),
        l: common_vendor.o(onMaskClick)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-356bb9cf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/Popup.js.map
