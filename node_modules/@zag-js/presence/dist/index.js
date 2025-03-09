'use strict';

var core = require('@zag-js/core');
var types = require('@zag-js/types');

// src/presence.connect.ts
function connect(state, send, _normalize) {
  const present = state.matches("mounted", "unmountSuspended");
  return {
    skip: !state.context.initial && present,
    present,
    setNode(node) {
      if (!node) return;
      send({ type: "NODE.SET", node });
    },
    unmount() {
      send({ type: "UNMOUNT" });
    }
  };
}
function machine(ctx) {
  return core.createMachine(
    {
      initial: ctx.present ? "mounted" : "unmounted",
      context: {
        node: null,
        styles: null,
        unmountAnimationName: null,
        prevAnimationName: null,
        present: false,
        initial: false,
        ...ctx
      },
      exit: ["clearInitial", "cleanupNode"],
      watch: {
        present: ["setInitial", "syncPresence"]
      },
      on: {
        "NODE.SET": {
          actions: ["setNode", "setStyles"]
        }
      },
      states: {
        mounted: {
          on: {
            UNMOUNT: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"]
            },
            "UNMOUNT.SUSPEND": "unmountSuspended"
          }
        },
        unmountSuspended: {
          activities: ["trackAnimationEvents"],
          after: {
            // Fallback to timeout to ensure we exit this state even if the `animationend` event
            // did not get trigger
            ANIMATION_DURATION: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"]
            }
          },
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"]
            },
            UNMOUNT: {
              target: "unmounted",
              actions: ["invokeOnExitComplete"]
            }
          }
        },
        unmounted: {
          entry: ["clearPrevAnimationName"],
          on: {
            MOUNT: {
              target: "mounted",
              actions: ["setPrevAnimationName"]
            }
          }
        }
      }
    },
    {
      delays: {
        ANIMATION_DURATION(ctx2) {
          return parseMs(ctx2.styles?.animationDuration) + parseMs(ctx2.styles?.animationDelay) + ANIMATION_TIMEOUT_MARGIN;
        }
      },
      actions: {
        setInitial(ctx2) {
          ctx2.initial = true;
        },
        clearInitial(ctx2) {
          ctx2.initial = false;
        },
        cleanupNode(ctx2) {
          ctx2.node = null;
          ctx2.styles = null;
        },
        invokeOnExitComplete(ctx2) {
          ctx2.onExitComplete?.();
        },
        setNode(ctx2, evt) {
          ctx2.node = core.ref(evt.node);
        },
        setStyles(ctx2, evt) {
          const win = evt.node.ownerDocument.defaultView || window;
          ctx2.styles = core.ref(win.getComputedStyle(evt.node));
        },
        syncPresence(ctx2, _evt, { send }) {
          if (ctx2.present) {
            send({ type: "MOUNT", src: "presence.changed" });
            return;
          }
          if (!ctx2.present && ctx2.node?.ownerDocument.visibilityState === "hidden") {
            send({ type: "UNMOUNT", src: "visibilitychange" });
            return;
          }
          const animationName = getAnimationName(ctx2.styles);
          const exec = ctx2.immediate ? queueMicrotask : requestAnimationFrame;
          exec(() => {
            ctx2.unmountAnimationName = animationName;
            if (animationName === "none" || animationName === ctx2.prevAnimationName || ctx2.styles?.display === "none" || ctx2.styles?.animationDuration === "0s") {
              send({ type: "UNMOUNT", src: "presence.changed" });
            } else {
              send({ type: "UNMOUNT.SUSPEND" });
            }
          });
        },
        setPrevAnimationName(ctx2) {
          const exec = ctx2.immediate ? queueMicrotask : requestAnimationFrame;
          exec(() => {
            ctx2.prevAnimationName = getAnimationName(ctx2.styles);
          });
        },
        clearPrevAnimationName(ctx2) {
          ctx2.prevAnimationName = null;
        }
      },
      activities: {
        trackAnimationEvents(ctx2, _evt, { send }) {
          const node = ctx2.node;
          if (!node) return;
          const onStart = (event) => {
            const target = event.composedPath?.()?.[0] ?? event.target;
            if (target === node) {
              ctx2.prevAnimationName = getAnimationName(ctx2.styles);
            }
          };
          const onEnd = (event) => {
            const animationName = getAnimationName(ctx2.styles);
            const target = event.composedPath?.()?.[0] ?? event.target;
            if (target === node && animationName === ctx2.unmountAnimationName) {
              send({ type: "UNMOUNT", src: "animationend" });
            }
          };
          node.addEventListener("animationstart", onStart);
          node.addEventListener("animationcancel", onEnd);
          node.addEventListener("animationend", onEnd);
          return () => {
            node.removeEventListener("animationstart", onStart);
            node.removeEventListener("animationcancel", onEnd);
            node.removeEventListener("animationend", onEnd);
          };
        }
      }
    }
  );
}
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
function parseMs(value) {
  return parseFloat(value || "0") * 1e3;
}
var ANIMATION_TIMEOUT_MARGIN = 16.667;
var props = types.createProps()(["onExitComplete", "present", "immediate"]);

exports.connect = connect;
exports.machine = machine;
exports.props = props;
