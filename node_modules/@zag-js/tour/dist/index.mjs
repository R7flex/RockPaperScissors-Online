import { createAnatomy } from '@zag-js/anatomy';
import { mergeProps, createMachine, ref, guards } from '@zag-js/core';
import { createScope, dataAttr, contains, isHTMLElement, raf, getComputedStyle as getComputedStyle$1, getWindow, getDocument } from '@zag-js/dom-query';
import { getPlacementStyles, getPlacement } from '@zag-js/popper';
import { trackDismissableBranch } from '@zag-js/dismissable';
import { trapFocus } from '@zag-js/focus-trap';
import { trackInteractOutside } from '@zag-js/interact-outside';
import { createSplitProps, compact, isString, nextIndex, prevIndex, isEqual } from '@zag-js/utils';
import { createProps } from '@zag-js/types';

// src/tour.anatomy.ts
var anatomy = createAnatomy("tour").parts(
  "content",
  "actionTrigger",
  "closeTrigger",
  "progressText",
  "title",
  "description",
  "positioner",
  "arrow",
  "arrowTip",
  "backdrop",
  "spotlight"
);
var parts = anatomy.build();
var dom = createScope({
  getPositionerId: (ctx) => ctx.ids?.positioner ?? `tour-positioner-${ctx.id}`,
  getContentId: (ctx) => ctx.ids?.content ?? `tour-content-${ctx.id}`,
  getTitleId: (ctx) => ctx.ids?.title ?? `tour-title-${ctx.id}`,
  getDescriptionId: (ctx) => ctx.ids?.description ?? `tour-desc-${ctx.id}`,
  getArrowId: (ctx) => ctx.ids?.arrow ?? `tour-arrow-${ctx.id}`,
  getBackdropId: (ctx) => ctx.ids?.backdrop ?? `tour-backdrop-${ctx.id}`,
  getContentEl: (ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getPositionerEl: (ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getBackdropEl: (ctx) => dom.getById(ctx, dom.getBackdropId(ctx))
});

// src/utils/clip-path.ts
function getClipPath(options) {
  const {
    radius = 0,
    rootSize: { width: w, height: h },
    rect: { width, height, x, y },
    enabled = true
  } = options;
  if (!enabled) return "";
  const {
    topLeft = 0,
    topRight = 0,
    bottomRight = 0,
    bottomLeft = 0
  } = typeof radius === "number" ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius } : radius;
  return `M${w},${h}  H0  V0  H${w}  V${h}  Z  M${x + topLeft},${y}  a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}  V${height + y - bottomLeft}  a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}  H${width + x - bottomRight}  a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}  V${y + topRight}  a${topRight},${topRight},0,0,0-${topRight}-${topRight}  Z`;
}

// src/utils/step.ts
var isTooltipStep = (step) => {
  return step?.type === "tooltip";
};
var isDialogStep = (step) => {
  return step?.type === "dialog";
};
var isTooltipPlacement = (placement) => {
  return placement != null && placement != "center";
};
var normalizeStep = (step) => {
  if (step.type === "floating") {
    return { backdrop: false, arrow: false, placement: "bottom-end", ...step };
  }
  if (step.target == null || step.type === "dialog") {
    return { type: "dialog", placement: "center", backdrop: true, ...step };
  }
  if (!step.type || step.type === "tooltip") {
    return { type: "tooltip", arrow: true, backdrop: true, ...step };
  }
  return step;
};
var findStep = (steps, id) => {
  const res = id != null ? steps.find((step) => step.id === id) : null;
  return res ? normalizeStep(res) : null;
};
var findStepIndex = (steps, id) => {
  return id != null ? steps.findIndex((step) => step.id === id) : -1;
};

// src/tour.connect.ts
function connect(state, send, normalize) {
  const open = state.hasTag("open");
  const steps = Array.from(state.context.steps);
  const stepIndex = state.context.stepIndex;
  const step = state.context.step;
  const hasTarget = typeof step?.target?.() !== "undefined";
  const hasNextStep = state.context.hasNextStep;
  const hasPrevStep = state.context.hasPrevStep;
  const firstStep = state.context.isFirstStep;
  const lastStep = state.context.isLastStep;
  const placement = state.context.currentPlacement;
  const targetRect = state.context.targetRect;
  const popperStyles = getPlacementStyles({
    strategy: "absolute",
    placement: isTooltipPlacement(placement) ? placement : void 0
  });
  const clipPath = getClipPath({
    enabled: isTooltipStep(step),
    rect: targetRect,
    rootSize: state.context.boundarySize,
    radius: state.context.spotlightRadius
  });
  const actionMap = {
    next() {
      send({ type: "STEP.NEXT", src: "actionTrigger" });
    },
    prev() {
      send({ type: "STEP.PREV", src: "actionTrigger" });
    },
    dismiss() {
      send({ type: "DISMISS", src: "actionTrigger" });
    },
    goto(id) {
      send({ type: "STEP.SET", value: id, src: "actionTrigger" });
    }
  };
  return {
    open,
    totalSteps: steps.length,
    stepIndex,
    step,
    hasNextStep,
    hasPrevStep,
    firstStep,
    lastStep,
    addStep(step2) {
      const next = steps.concat(step2);
      send({ type: "STEPS.SET", value: next, src: "addStep" });
    },
    removeStep(id) {
      const next = steps.filter((step2) => step2.id !== id);
      send({ type: "STEPS.SET", value: next, src: "removeStep" });
    },
    updateStep(id, stepOverrides) {
      const next = steps.map((step2) => step2.id === id ? mergeProps(step2, stepOverrides) : step2);
      send({ type: "STEPS.SET", value: next, src: "updateStep" });
    },
    setSteps(steps2) {
      send({ type: "STEPS.SET", value: steps2, src: "setSteps" });
    },
    setStep(id) {
      send({ type: "STEP.SET", value: id });
    },
    start(id) {
      send({ type: "START", id });
    },
    isValidStep(id) {
      return steps.some((step2) => step2.id === id);
    },
    isCurrentStep(id) {
      return Boolean(step?.id === id);
    },
    next() {
      send({ type: "STEP.NEXT" });
    },
    prev() {
      send({ type: "STEP.PREV" });
    },
    getProgressPercent() {
      return stepIndex / steps.length * 100;
    },
    getProgressText() {
      const effectiveSteps = steps.filter((step2) => step2.type !== "wait");
      const index = findStepIndex(effectiveSteps, step?.id);
      const details = { current: index, total: effectiveSteps.length };
      return state.context.translations.progressText?.(details) ?? "";
    },
    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(state.context),
        dir: state.context.dir,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        style: {
          "--tour-layer": 0,
          clipPath: isTooltipStep(step) ? `path("${clipPath}")` : void 0,
          position: "absolute",
          inset: "0",
          willChange: "clip-path"
        }
      });
    },
    getSpotlightProps() {
      return normalize.element({
        ...parts.spotlight.attrs,
        hidden: !open || !step?.target?.(),
        style: {
          "--tour-layer": 1,
          position: "absolute",
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          left: `${targetRect.x}px`,
          top: `${targetRect.y}px`,
          borderRadius: `${state.context.spotlightRadius}px`,
          pointerEvents: "none"
        }
      });
    },
    getProgressTextProps() {
      return normalize.element({
        ...parts.progressText.attrs
      });
    },
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        "data-type": step?.type,
        "data-placement": state.context.currentPlacement,
        style: {
          "--tour-layer": 2,
          ...step?.type === "tooltip" && popperStyles.floating
        }
      });
    },
    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(state.context),
        ...parts.arrow.attrs,
        dir: state.context.dir,
        hidden: step?.type !== "tooltip",
        style: step?.type === "tooltip" ? popperStyles.arrow : void 0,
        opacity: hasTarget ? void 0 : 0
      });
    },
    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: state.context.dir,
        style: popperStyles.arrowTip
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(state.context),
        dir: state.context.dir,
        role: "alertdialog",
        "aria-modal": "true",
        "aria-live": "polite",
        "aria-atomic": "true",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-type": step?.type,
        "data-placement": state.context.currentPlacement,
        "data-step": step?.id,
        "aria-labelledby": dom.getTitleId(state.context),
        "aria-describedby": dom.getDescriptionId(state.context),
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!state.context.keyboardNavigation) return;
          const isRtl = state.context.dir === "rtl";
          switch (event.key) {
            case "ArrowRight":
              if (!hasNextStep) return;
              send({ type: isRtl ? "STEP.PREV" : "STEP.NEXT", src: "keydown" });
              break;
            case "ArrowLeft":
              if (!hasPrevStep) return;
              send({ type: isRtl ? "STEP.NEXT" : "STEP.PREV", src: "keydown" });
              break;
          }
        }
      });
    },
    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(state.context),
        "data-placement": hasTarget ? state.context.currentPlacement : "center"
      });
    },
    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(state.context),
        "data-placement": hasTarget ? state.context.currentPlacement : "center"
      });
    },
    getCloseTriggerProps() {
      return normalize.element({
        ...parts.closeTrigger.attrs,
        "data-type": step?.type,
        "aria-label": state.context.translations.close,
        onClick: actionMap.dismiss
      });
    },
    getActionTriggerProps(props2) {
      const { action, attrs } = props2.action;
      let actionProps = {};
      switch (action) {
        case "next":
          actionProps = {
            "data-type": "next",
            disabled: !hasNextStep,
            "data-disabled": dataAttr(!hasNextStep),
            "aria-label": state.context.translations.nextStep,
            onClick: actionMap.next
          };
          break;
        case "prev":
          actionProps = {
            "data-type": "prev",
            disabled: !hasPrevStep,
            "data-disabled": dataAttr(!hasPrevStep),
            "aria-label": state.context.translations.prevStep,
            onClick: actionMap.prev
          };
          break;
        case "dismiss":
          actionProps = {
            "data-type": "close",
            "aria-label": state.context.translations.close,
            onClick: actionMap.dismiss
          };
          break;
        default:
          actionProps = {
            "data-type": "custom",
            onClick() {
              if (typeof action === "function") {
                action(actionMap);
              }
            }
          };
          break;
      }
      return normalize.button({
        ...parts.actionTrigger.attrs,
        type: "button",
        ...attrs,
        ...actionProps
      });
    }
  };
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
var normalizeEventPoint = (event) => {
  let clientX = event.clientX;
  let clientY = event.clientY;
  let win = event.view || window;
  let frame = getFrameElement(win);
  while (frame) {
    const iframeRect = frame.getBoundingClientRect();
    const css = getComputedStyle(frame);
    const left = iframeRect.left + (frame.clientLeft + parseFloat(css.paddingLeft));
    const top = iframeRect.top + (frame.clientTop + parseFloat(css.paddingTop));
    clientX += left;
    clientY += top;
    win = getWindow(frame);
    frame = getFrameElement(win);
  }
  return { clientX, clientY };
};
function isEventInRect(rect, event) {
  const { clientX, clientY } = normalizeEventPoint(event);
  return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width;
}
function offset(r, i) {
  const dx = i.x || 0;
  const dy = i.y || 0;
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy
  };
}

// src/tour.machine.ts
var { and } = guards;
function machine(userContext) {
  const ctx = compact(userContext);
  return createMachine(
    {
      id: "tour",
      initial: "tour.inactive",
      context: {
        stepId: null,
        steps: [],
        preventInteraction: false,
        closeOnInteractOutside: true,
        closeOnEscape: true,
        keyboardNavigation: true,
        spotlightOffset: { x: 10, y: 10 },
        spotlightRadius: 4,
        translations: {
          nextStep: "next step",
          prevStep: "previous step",
          close: "close tour",
          progressText: ({ current, total }) => `${current + 1} of ${total}`,
          skip: "skip tour",
          ...ctx.translations
        },
        ...ctx,
        resolvedTarget: ref({ value: null }),
        targetRect: ref({ width: 0, height: 0, x: 0, y: 0 }),
        boundarySize: ref({ width: 0, height: 0 })
      },
      computed: {
        stepIndex: (ctx2) => findStepIndex(ctx2.steps, ctx2.stepId),
        step: (ctx2) => findStep(ctx2.steps, ctx2.stepId),
        hasNextStep: (ctx2) => ctx2.stepIndex < ctx2.steps.length - 1,
        hasPrevStep: (ctx2) => ctx2.stepIndex > 0,
        isFirstStep: (ctx2) => ctx2.stepIndex === 0,
        isLastStep: (ctx2) => ctx2.stepIndex === ctx2.steps.length - 1
      },
      created: ["validateSteps"],
      watch: {
        stepId: ["setResolvedTarget", "raiseStepChange", "syncTargetAttrs"]
      },
      activities: ["trackBoundarySize"],
      exit: ["clearStep", "cleanupFns"],
      on: {
        "STEPS.SET": {
          actions: ["setSteps"]
        },
        "STEP.SET": {
          actions: ["setStep"]
        },
        "STEP.NEXT": {
          actions: ["setNextStep"]
        },
        "STEP.PREV": {
          actions: ["setPrevStep"]
        },
        "STEP.CHANGED": [
          {
            guard: and("isValidStep", "hasResolvedTarget"),
            target: "target.scrolling"
          },
          {
            guard: and("isValidStep", "hasTarget"),
            target: "target.resolving"
          },
          {
            guard: and("isValidStep", "isWaitingStep"),
            target: "step.waiting"
          },
          {
            guard: "isValidStep",
            target: "tour.active"
          }
        ],
        DISMISS: [
          {
            guard: "isLastStep",
            target: "tour.inactive",
            actions: ["invokeOnDismiss", "invokeOnComplete", "clearStep"]
          },
          {
            target: "tour.inactive",
            actions: ["invokeOnDismiss", "clearStep"]
          }
        ]
      },
      states: {
        "tour.inactive": {
          tags: ["closed"],
          on: {
            START: {
              actions: ["setInitialStep", "invokeOnStart"]
            }
          }
        },
        "target.resolving": {
          tags: ["closed"],
          activities: ["waitForTarget"],
          after: {
            MISSING_TARGET_TIMEOUT: {
              target: "tour.inactive",
              actions: ["invokeOnNotFound", "clearStep"]
            }
          },
          on: {
            "TARGET.RESOLVED": {
              target: "target.scrolling",
              actions: ["setResolvedTarget"]
            }
          }
        },
        "target.scrolling": {
          tags: ["open"],
          entry: ["scrollToTarget"],
          activities: [
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown"
          ],
          after: {
            100: "tour.active"
          }
        },
        "step.waiting": {
          tags: ["closed"]
        },
        "tour.active": {
          tags: ["open"],
          activities: [
            "trapFocus",
            "trackPlacement",
            "trackDismissableBranch",
            "trackInteractOutside",
            "trackEscapeKeydown"
          ]
        }
      }
    },
    {
      delays: {
        MISSING_TARGET_TIMEOUT: 3e3
      },
      guards: {
        isLastStep: (ctx2) => ctx2.isLastStep,
        isValidStep: (ctx2) => ctx2.stepId != null,
        hasTarget: (ctx2) => ctx2.step?.target != null,
        hasResolvedTarget: (ctx2) => ctx2.resolvedTarget.value != null,
        isWaitingStep: (ctx2) => ctx2.step?.type === "wait"
      },
      actions: {
        scrollToTarget(ctx2, _evt) {
          const node = ctx2.resolvedTarget.value;
          node?.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
        },
        setStep(ctx2, evt) {
          set.step(ctx2, evt.value);
        },
        clearStep(ctx2) {
          ctx2.targetRect = ref({ width: 0, height: 0, x: 0, y: 0 });
          set.step(ctx2, -1);
        },
        setInitialStep(ctx2, evt) {
          if (ctx2.steps.length === 0) return;
          if (isString(evt.id)) {
            const idx = findStepIndex(ctx2.steps, evt.id);
            set.step(ctx2, idx);
            return;
          }
          set.step(ctx2, 0);
        },
        setNextStep(ctx2) {
          const idx = nextIndex(ctx2.steps, ctx2.stepIndex);
          set.step(ctx2, idx);
        },
        setPrevStep(ctx2) {
          const idx = prevIndex(ctx2.steps, ctx2.stepIndex);
          set.step(ctx2, idx);
        },
        invokeOnStart(ctx2) {
          invoke.statusChange(ctx2, "started");
        },
        invokeOnDismiss(ctx2) {
          invoke.statusChange(ctx2, "dismissed");
        },
        invokeOnComplete(ctx2) {
          invoke.statusChange(ctx2, "completed");
        },
        invokeOnSkip(ctx2) {
          invoke.statusChange(ctx2, "skipped");
        },
        invokeOnNotFound(ctx2) {
          invoke.statusChange(ctx2, "not-found");
        },
        raiseStepChange(_ctx, _evt, { send }) {
          send({ type: "STEP.CHANGED" });
        },
        setResolvedTarget(ctx2, evt) {
          const node = evt.node ?? ctx2.step?.target?.();
          ctx2.resolvedTarget.value = node ?? null;
        },
        syncTargetAttrs(ctx2) {
          ctx2._targetCleanup?.();
          ctx2._targetCleanup = void 0;
          const targetEl = ctx2.resolvedTarget.value;
          if (!targetEl) return;
          if (ctx2.preventInteraction) targetEl.inert = true;
          targetEl.setAttribute("data-tour-highlighted", "");
          ctx2._targetCleanup = () => {
            if (ctx2.preventInteraction) targetEl.inert = false;
            targetEl.removeAttribute("data-tour-highlighted");
          };
        },
        cleanupFns(ctx2) {
          ctx2._targetCleanup?.();
          ctx2._targetCleanup = void 0;
          ctx2._effectCleanup?.();
          ctx2._effectCleanup = void 0;
        },
        validateSteps(ctx2) {
          const ids = /* @__PURE__ */ new Set();
          ctx2.steps.forEach((step) => {
            if (ids.has(step.id)) {
              throw new Error(`[zag-js/tour] Duplicate step id: ${step.id}`);
            }
            if (step.target == null && step.type == null) {
              throw new Error(`[zag-js/tour] Step ${step.id} has no target or type. At least one of those is required.`);
            }
            ids.add(step.id);
          });
        }
      },
      activities: {
        waitForTarget(ctx2, _evt, { send }) {
          const targetEl = ctx2.step?.target;
          const win = dom.getWin(ctx2);
          const rootNode = dom.getRootNode(ctx2);
          const observer = new win.MutationObserver(() => {
            const node = targetEl?.();
            if (node) {
              send({ type: "TARGET.RESOLVED", node });
              observer.disconnect();
            }
          });
          observer.observe(rootNode, {
            childList: true,
            subtree: true,
            characterData: true
          });
          return () => {
            observer.disconnect();
          };
        },
        trackBoundarySize(ctx2) {
          const win = dom.getWin(ctx2);
          const doc = dom.getDoc(ctx2);
          const onResize = () => {
            const width = visualViewport?.width ?? win.innerWidth;
            const height = doc.documentElement.scrollHeight;
            ctx2.boundarySize = { width, height };
          };
          onResize();
          const viewport = win.visualViewport ?? win;
          viewport.addEventListener("resize", onResize);
          return () => viewport.removeEventListener("resize", onResize);
        },
        trackEscapeKeydown(ctx2, _evt, { send }) {
          if (!ctx2.closeOnEscape) return;
          const doc = dom.getDoc(ctx2);
          const onKeyDown = (event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              send({ type: "DISMISS", src: "esc" });
            }
          };
          doc.addEventListener("keydown", onKeyDown, true);
          return () => {
            doc.removeEventListener("keydown", onKeyDown, true);
          };
        },
        trackInteractOutside(ctx2, _evt, { send }) {
          if (ctx2.step == null) return;
          const contentEl = () => dom.getContentEl(ctx2);
          return trackInteractOutside(contentEl, {
            defer: true,
            exclude(target) {
              return contains(ctx2.step?.target?.(), target);
            },
            onFocusOutside(event) {
              ctx2.onFocusOutside?.(event);
              if (!ctx2.closeOnInteractOutside) {
                event.preventDefault();
              }
            },
            onPointerDownOutside(event) {
              ctx2.onPointerDownOutside?.(event);
              const isWithin = isEventInRect(ctx2.targetRect, event.detail.originalEvent);
              if (isWithin) {
                event.preventDefault();
                return;
              }
              if (!ctx2.closeOnInteractOutside) {
                event.preventDefault();
              }
            },
            onInteractOutside(event) {
              ctx2.onInteractOutside?.(event);
              if (event.defaultPrevented) return;
              send({ type: "DISMISS", src: "interact-outside" });
            }
          });
        },
        trackDismissableBranch(ctx2) {
          if (ctx2.step == null) return;
          const contentEl = () => dom.getContentEl(ctx2);
          return trackDismissableBranch(contentEl, { defer: !contentEl() });
        },
        trapFocus(ctx2) {
          const contentEl = () => dom.getContentEl(ctx2);
          return trapFocus(contentEl, {
            escapeDeactivates: false,
            allowOutsideClick: true,
            preventScroll: true,
            returnFocusOnDeactivate: false
          });
        },
        trackPlacement(ctx2) {
          if (ctx2.step == null) return;
          ctx2.currentPlacement = ctx2.step.placement ?? "bottom";
          if (isDialogStep(ctx2.step)) return syncZIndex(ctx2);
          if (!isTooltipStep(ctx2.step)) return;
          const positionerEl = () => dom.getPositionerEl(ctx2);
          return getPlacement(ctx2.resolvedTarget.value, positionerEl, {
            defer: true,
            placement: ctx2.step.placement ?? "bottom",
            strategy: "absolute",
            gutter: 10,
            offset: ctx2.step.offset,
            getAnchorRect(el) {
              if (!isHTMLElement(el)) return null;
              const rect = el.getBoundingClientRect();
              return offset(rect, ctx2.spotlightOffset);
            },
            onComplete(data) {
              const { rects } = data.middlewareData;
              ctx2.currentPlacement = data.placement;
              ctx2.targetRect = rects.reference;
            }
          });
        }
      }
    }
  );
}
function syncZIndex(ctx) {
  return raf(() => {
    const contentEl = dom.getContentEl(ctx);
    if (!contentEl) return;
    const styles = getComputedStyle$1(contentEl);
    const positionerEl = dom.getPositionerEl(ctx);
    const backdropEl = dom.getBackdropEl(ctx);
    if (positionerEl) {
      positionerEl.style.setProperty("--z-index", styles.zIndex);
      positionerEl.style.setProperty("z-index", "var(--z-index)");
    }
    if (backdropEl) {
      backdropEl.style.setProperty("--z-index", styles.zIndex);
    }
  });
}
var invoke = {
  stepChange(ctx) {
    const effectiveLength = ctx.steps.filter((step) => step.type !== "wait").length;
    const progress = (ctx.stepIndex + 1) / effectiveLength;
    ctx.onStepChange?.({
      complete: ctx.isLastStep,
      stepId: ctx.stepId,
      totalSteps: ctx.steps.length,
      stepIndex: ctx.stepIndex,
      progress
    });
    ctx._effectCleanup?.();
    ctx._effectCleanup = void 0;
  },
  statusChange(ctx, status) {
    ctx.onStatusChange?.({
      status,
      stepId: ctx.stepId,
      stepIndex: ctx.stepIndex
    });
  }
};
var set = {
  step(ctx, idx) {
    const step = ctx.steps[idx];
    if (!step) {
      ctx.stepId = null;
      invoke.stepChange(ctx);
      return;
    }
    if (isEqual(ctx.stepId, step.id)) return;
    const update = (data) => {
      ctx.steps[idx] = { ...step, ...data };
    };
    const next = () => {
      const idx2 = nextIndex(ctx.steps, ctx.stepIndex);
      ctx.stepId = ctx.steps[idx2].id;
      invoke.stepChange(ctx);
    };
    const goto = (id) => {
      const idx2 = ctx.steps.findIndex((s) => s.id === id);
      ctx.stepId = ctx.steps[idx2].id;
      invoke.stepChange(ctx);
    };
    const dismiss = () => {
      ctx.stepId = null;
      invoke.stepChange(ctx);
      invoke.statusChange(ctx, "dismissed");
    };
    const show = () => {
      ctx.stepId = step.id;
      invoke.stepChange(ctx);
    };
    if (!step.effect) {
      show();
      return;
    }
    ctx._effectCleanup = step.effect({
      show,
      next,
      update,
      target: step.target,
      dismiss,
      goto
    });
  }
};
var props = createProps()([
  "closeOnEscape",
  "closeOnInteractOutside",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "keyboardNavigation",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onStatusChange",
  "onStepChange",
  "preventInteraction",
  "spotlightOffset",
  "spotlightRadius",
  "stepId",
  "steps",
  "translations"
]);
var splitProps = createSplitProps(props);
function waitForPromise(promise, controller, timeout) {
  const { signal } = controller;
  const wrappedPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`));
    }, timeout);
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("Promise aborted"));
    });
    promise.then((result) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        resolve(result);
      }
    }).catch((error) => {
      if (!signal.aborted) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
  const abort = () => controller.abort();
  return [wrappedPromise, abort];
}
function waitForElement(target, options) {
  const { timeout, rootNode } = options;
  const win = getWindow(rootNode);
  const doc = getDocument(rootNode);
  const controller = new win.AbortController();
  return waitForPromise(
    new Promise((resolve) => {
      const el = target();
      if (el) {
        resolve(el);
        return;
      }
      const observer = new win.MutationObserver(() => {
        const el2 = target();
        if (el2) {
          observer.disconnect();
          resolve(el2);
        }
      });
      observer.observe(doc.body, {
        childList: true,
        subtree: true
      });
    }),
    controller,
    timeout
  );
}
function waitForElementValue(target, value, options) {
  const { timeout, rootNode } = options;
  const win = getWindow(rootNode);
  const controller = new win.AbortController();
  return waitForPromise(
    new Promise((resolve) => {
      const el = target();
      if (!el) return;
      const checkValue = () => {
        if (el.value === value) {
          resolve();
          el.removeEventListener("input", checkValue);
        }
      };
      checkValue();
      el.addEventListener("input", checkValue, { signal: controller.signal });
    }),
    controller,
    timeout
  );
}

export { anatomy, connect, machine, props, splitProps, waitForElement, waitForElementValue };
