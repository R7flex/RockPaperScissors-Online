'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var domQuery = require('@zag-js/dom-query');
var core = require('@zag-js/core');
var utils = require('@zag-js/utils');
var proxyMemoize = require('proxy-memoize');
var uqr = require('uqr');
var types = require('@zag-js/types');

// src/qr-code.anatomy.ts
var anatomy = anatomy$1.createAnatomy("qr-code").parts("root", "frame", "pattern", "overlay", "downloadTrigger");
var parts = anatomy.build();
var dom = domQuery.createScope({
  getRootId: (ctx) => ctx.ids?.root ?? `qrcode:${ctx.id}:root`,
  getFrameId: (ctx) => ctx.ids?.frame ?? `qrcode:${ctx.id}:frame`,
  getFrameEl: (ctx) => dom.getById(ctx, dom.getFrameId(ctx))
});

// src/qr-code.connect.ts
function connect(state, send, normalize) {
  const encoded = state.context.encoded;
  const pixelSize = state.context.pixelSize;
  const height = encoded.size * pixelSize;
  const width = encoded.size * pixelSize;
  const paths = [];
  for (let row = 0; row < encoded.size; row++) {
    for (let col = 0; col < encoded.size; col++) {
      const x = col * pixelSize;
      const y = row * pixelSize;
      if (encoded.data[row][col]) {
        paths.push(`M${x},${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
      }
    }
  }
  return {
    value: state.context.value,
    setValue(value) {
      send({ type: "VALUE.SET", value });
    },
    getDataUrl(type, quality) {
      const svgEl = dom.getFrameEl(state.context);
      return domQuery.getDataUrl(svgEl, { type, quality });
    },
    getRootProps() {
      return normalize.element({
        id: dom.getRootId(state.context),
        ...parts.root.attrs,
        style: {
          "--qrcode-pixel-size": `${pixelSize}px`,
          "--qrcode-width": `${width}px`,
          "--qrcode-height": `${height}px`,
          position: "relative"
        }
      });
    },
    getFrameProps() {
      return normalize.svg({
        id: dom.getFrameId(state.context),
        ...parts.frame.attrs,
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: `0 0 ${width} ${height}`
      });
    },
    getPatternProps() {
      return normalize.path({
        d: paths.join(""),
        ...parts.pattern.attrs
      });
    },
    getOverlayProps() {
      return normalize.element({
        ...parts.overlay.attrs,
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          translate: "-50% -50%"
        }
      });
    },
    getDownloadTriggerProps(props2) {
      return normalize.button({
        type: "button",
        ...parts.downloadTrigger.attrs,
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "DOWNLOAD_TRIGGER.CLICK", ...props2 });
        }
      });
    }
  };
}
function machine(userContext) {
  const ctx = utils.compact(userContext);
  return core.createMachine(
    {
      id: "qr-code",
      initial: "idle",
      context: {
        value: "",
        ...ctx,
        pixelSize: 10
      },
      computed: {
        encoded: proxyMemoize.memoize((ctx2) => uqr.encode(ctx2.value, ctx2.encoding))
      },
      on: {
        "VALUE.SET": {
          actions: ["setValue"]
        },
        "DOWNLOAD_TRIGGER.CLICK": {
          actions: ["downloadQrCode"]
        }
      }
    },
    {
      actions: {
        setValue(ctx2, evt) {
          set.value(ctx2, evt.value);
        },
        downloadQrCode(ctx2, evt) {
          const { mimeType, quality, fileName } = evt;
          const svgEl = dom.getFrameEl(ctx2);
          const doc = dom.getDoc(ctx2);
          domQuery.getDataUrl(svgEl, { type: mimeType, quality }).then((dataUri) => {
            const a = doc.createElement("a");
            a.href = dataUri;
            a.rel = "noopener";
            a.download = fileName;
            a.click();
            setTimeout(() => {
              a.remove();
            }, 0);
          });
        }
      }
    }
  );
}
var set = {
  value(ctx, value) {
    if (utils.isEqual(ctx.value, value)) return;
    ctx.value = value;
    ctx.onValueChange?.({ value });
  }
};
var props = types.createProps()([
  "ids",
  "value",
  "id",
  "encoding",
  "dir",
  "getRootNode",
  "onValueChange"
]);
var splitProps = utils.createSplitProps(props);

exports.anatomy = anatomy;
exports.connect = connect;
exports.machine = machine;
exports.props = props;
exports.splitProps = splitProps;
