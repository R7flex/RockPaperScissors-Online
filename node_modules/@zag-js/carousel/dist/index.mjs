import { createAnatomy } from '@zag-js/anatomy';
import { createScope, queryAll, getTabbables, dataAttr, getEventTarget, isFocusable, ariaAttr, getEventKey, addDomEvent, trackPointerMove, raf } from '@zag-js/dom-query';
import { createMachine, ref } from '@zag-js/core';
import { findSnapPoint, getScrollSnapPositions } from '@zag-js/scroll-snap';
import { createSplitProps, compact, isObject, add, remove, uniq, nextIndex, prevIndex, isEqual } from '@zag-js/utils';
import { createProps } from '@zag-js/types';

// src/carousel.anatomy.ts
var anatomy = createAnatomy("carousel").parts(
  "root",
  "itemGroup",
  "item",
  "control",
  "nextTrigger",
  "prevTrigger",
  "indicatorGroup",
  "indicator",
  "autoplayTrigger"
);
var parts = anatomy.build();
var dom = createScope({
  getRootId: (ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`,
  getItemId: (ctx, index) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`,
  getItemGroupId: (ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`,
  getNextTriggerId: (ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`,
  getPrevTriggerId: (ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`,
  getIndicatorGroupId: (ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`,
  getIndicatorId: (ctx, index) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`,
  getRootEl: (ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getItemGroupEl: (ctx) => dom.getById(ctx, dom.getItemGroupId(ctx)),
  getItemEl: (ctx, index) => dom.getById(ctx, dom.getItemId(ctx, index)),
  getItemEls: (ctx) => queryAll(dom.getItemGroupEl(ctx), `[data-part=item]`),
  getActiveIndicatorEl: (ctx) => dom.getById(ctx, dom.getIndicatorId(ctx, ctx.page)),
  syncTabIndex(ctx) {
    const el = dom.getItemGroupEl(ctx);
    if (!el) return;
    const tabbables = getTabbables(el);
    if (tabbables.length > 0) {
      el.removeAttribute("tabindex");
    } else {
      el.setAttribute("tabindex", "0");
    }
  }
});

// src/carousel.connect.ts
function connect(state, send, normalize) {
  const isPlaying = state.matches("autoplay");
  const isDragging = state.matches("dragging");
  const canScrollNext = state.context.canScrollNext;
  const canScrollPrev = state.context.canScrollPrev;
  const horizontal = state.context.isHorizontal;
  const pageSnapPoints = Array.from(state.context.pageSnapPoints);
  const page = state.context.page;
  const slidesPerPage = state.context.slidesPerPage;
  const padding = state.context.padding;
  const translations = state.context.translations;
  return {
    isPlaying,
    isDragging,
    page,
    pageSnapPoints,
    canScrollNext,
    canScrollPrev,
    getProgress() {
      return page / pageSnapPoints.length;
    },
    scrollToIndex(index, instant) {
      send({ type: "INDEX.SET", index, instant });
    },
    scrollTo(index, instant) {
      send({ type: "PAGE.SET", index, instant });
    },
    scrollNext(instant) {
      send({ type: "PAGE.NEXT", instant });
    },
    scrollPrev(instant) {
      send({ type: "PAGE.PREV", instant });
    },
    play() {
      send("AUTOPLAY.START");
    },
    pause() {
      send("AUTOPLAY.PAUSE");
    },
    isInView(index) {
      return Array.from(state.context.slidesInView).includes(index);
    },
    refresh() {
      send({ type: "SNAP.REFRESH" });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        role: "region",
        "aria-roledescription": "carousel",
        "data-orientation": state.context.orientation,
        dir: state.context.dir,
        style: {
          "--slides-per-page": slidesPerPage,
          "--slide-spacing": state.context.spacing,
          "--slide-item-size": "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))"
        }
      });
    },
    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        id: dom.getItemGroupId(state.context),
        "data-orientation": state.context.orientation,
        "data-dragging": dataAttr(isDragging),
        dir: state.context.dir,
        "aria-live": isPlaying ? "off" : "polite",
        onMouseDown(event) {
          if (!state.context.allowMouseDrag) return;
          if (event.button !== 0) return;
          if (event.defaultPrevented) return;
          const target = getEventTarget(event);
          if (isFocusable(target) && target !== event.currentTarget) return;
          event.preventDefault();
          send({ type: "DRAGGING.START" });
        },
        style: {
          display: "grid",
          gap: "var(--slide-spacing)",
          scrollSnapType: [horizontal ? "x" : "y", state.context.snapType].join(" "),
          gridAutoFlow: horizontal ? "column" : "row",
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
          [horizontal ? "gridAutoColumns" : "gridAutoRows"]: "var(--slide-item-size)",
          [horizontal ? "scrollPaddingInline" : "scrollPaddingBlock"]: padding,
          [horizontal ? "paddingInline" : "paddingBlock"]: padding,
          [horizontal ? "overflowX" : "overflowY"]: "auto"
        }
      });
    },
    getItemProps(props2) {
      const isInView = state.context.slidesInView.includes(props2.index);
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, props2.index),
        dir: state.context.dir,
        role: "group",
        "data-index": props2.index,
        "data-inview": dataAttr(isInView),
        "aria-roledescription": "slide",
        "data-orientation": state.context.orientation,
        "aria-label": state.context.slideCount ? translations.item(props2.index, state.context.slideCount) : void 0,
        "aria-hidden": ariaAttr(!isInView),
        style: {
          scrollSnapAlign: getSnapAlign(state.context, props2)
        }
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-orientation": state.context.orientation
      });
    },
    getPrevTriggerProps() {
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(state.context),
        type: "button",
        disabled: !canScrollPrev,
        dir: state.context.dir,
        "aria-label": translations.prevTrigger,
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "PAGE.PREV", src: "trigger" });
        }
      });
    },
    getNextTriggerProps() {
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: state.context.dir,
        id: dom.getNextTriggerId(state.context),
        type: "button",
        "aria-label": translations.nextTrigger,
        "data-orientation": state.context.orientation,
        "aria-controls": dom.getItemGroupId(state.context),
        disabled: !canScrollNext,
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "PAGE.NEXT", src: "trigger" });
        }
      });
    },
    getIndicatorGroupProps() {
      return normalize.element({
        ...parts.indicatorGroup.attrs,
        dir: state.context.dir,
        id: dom.getIndicatorGroupId(state.context),
        "data-orientation": state.context.orientation,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          const src = "indicator";
          const keyMap = {
            ArrowDown(event2) {
              if (horizontal) return;
              send({ type: "PAGE.NEXT", src });
              event2.preventDefault();
            },
            ArrowUp(event2) {
              if (horizontal) return;
              send({ type: "PAGE.PREV", src });
              event2.preventDefault();
            },
            ArrowRight(event2) {
              if (!horizontal) return;
              send({ type: "PAGE.NEXT", src });
              event2.preventDefault();
            },
            ArrowLeft(event2) {
              if (!horizontal) return;
              send({ type: "PAGE.PREV", src });
              event2.preventDefault();
            },
            Home(event2) {
              send({ type: "PAGE.SET", index: 0, src });
              event2.preventDefault();
            },
            End(event2) {
              send({ type: "PAGE.SET", index: pageSnapPoints.length - 1, src });
              event2.preventDefault();
            }
          };
          const key = getEventKey(event, {
            dir: state.context.dir,
            orientation: state.context.orientation
          });
          const exec = keyMap[key];
          exec?.(event);
        }
      });
    },
    getIndicatorProps(props2) {
      return normalize.button({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        id: dom.getIndicatorId(state.context, props2.index),
        type: "button",
        "data-orientation": state.context.orientation,
        "data-index": props2.index,
        "data-readonly": dataAttr(props2.readOnly),
        "data-current": dataAttr(props2.index === state.context.page),
        "aria-label": translations.indicator(props2.index),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (props2.readOnly) return;
          send({ type: "PAGE.SET", index: props2.index, src: "indicator" });
        }
      });
    },
    getAutoplayTriggerProps() {
      return normalize.button({
        ...parts.autoplayTrigger.attrs,
        type: "button",
        "data-orientation": state.context.orientation,
        "data-pressed": dataAttr(isPlaying),
        "aria-label": isPlaying ? translations.autoplayStop : translations.autoplayStart,
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: isPlaying ? "AUTOPLAY.PAUSE" : "AUTOPLAY.START" });
        }
      });
    }
  };
}
function getSnapAlign(ctx, props2) {
  const { snapAlign = "start", index } = props2;
  const perMove = ctx.slidesPerMove === "auto" ? Math.floor(ctx.slidesPerPage) : ctx.slidesPerMove;
  const shouldSnap = (index + perMove) % perMove === 0;
  return shouldSnap ? snapAlign : void 0;
}
var DEFAULT_SLIDES_PER_PAGE = 1;
var DEFAULT_SLIDES_PER_MOVE = "auto";
function machine(userContext) {
  const ctx = compact(userContext);
  return createMachine(
    {
      id: "carousel",
      initial: ctx.autoplay ? "autoplay" : "idle",
      context: {
        dir: "ltr",
        page: 0,
        orientation: "horizontal",
        snapType: "mandatory",
        loop: false,
        slidesPerPage: DEFAULT_SLIDES_PER_PAGE,
        slidesPerMove: DEFAULT_SLIDES_PER_MOVE,
        spacing: "0px",
        autoplay: false,
        allowMouseDrag: false,
        inViewThreshold: 0.6,
        ...ctx,
        timeoutRef: ref({ current: void 0 }),
        translations: {
          nextTrigger: "Next slide",
          prevTrigger: "Previous slide",
          indicator: (index) => `Go to slide ${index + 1}`,
          item: (index, count) => `${index + 1} of ${count}`,
          autoplayStart: "Start slide rotation",
          autoplayStop: "Stop slide rotation",
          ...ctx.translations
        },
        pageSnapPoints: getPageSnapPoints(
          ctx.slideCount,
          ctx.slidesPerMove ?? DEFAULT_SLIDES_PER_MOVE,
          ctx.slidesPerPage ?? DEFAULT_SLIDES_PER_PAGE
        ),
        slidesInView: []
      },
      computed: {
        isRtl: (ctx2) => ctx2.dir === "rtl",
        isHorizontal: (ctx2) => ctx2.orientation === "horizontal",
        canScrollNext: (ctx2) => ctx2.loop || ctx2.page < ctx2.pageSnapPoints.length - 1,
        canScrollPrev: (ctx2) => ctx2.loop || ctx2.page > 0,
        autoplayInterval: (ctx2) => isObject(ctx2.autoplay) ? ctx2.autoplay.delay : 4e3
      },
      watch: {
        slidesPerPage: ["setSnapPoints"],
        slidesPerMove: ["setSnapPoints"],
        page: ["scrollToPage", "focusIndicatorEl"],
        orientation: ["setSnapPoints", "scrollToPage"]
      },
      on: {
        "PAGE.NEXT": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setNextPage"]
        },
        "PAGE.PREV": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setPrevPage"]
        },
        "PAGE.SET": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setPage"]
        },
        "INDEX.SET": {
          target: "idle",
          actions: ["clearScrollEndTimer", "setMatchingPage"]
        },
        "SNAP.REFRESH": {
          actions: ["setSnapPoints", "clampPage"]
        }
      },
      activities: ["trackSlideMutation", "trackSlideIntersections", "trackSlideResize"],
      entry: ["resetScrollPosition", "setSnapPoints", "setPage"],
      exit: ["clearScrollEndTimer"],
      states: {
        idle: {
          activities: ["trackScroll"],
          on: {
            "DRAGGING.START": {
              target: "dragging",
              actions: ["invokeDragStart"]
            },
            "AUTOPLAY.START": {
              target: "autoplay",
              actions: ["invokeAutoplayStart"]
            }
          }
        },
        dragging: {
          activities: ["trackPointerMove"],
          entry: ["disableScrollSnap"],
          on: {
            DRAGGING: {
              actions: ["scrollSlides", "invokeDragging"]
            },
            "DRAGGING.END": {
              target: "idle",
              actions: ["endDragging", "invokeDraggingEnd"]
            }
          }
        },
        autoplay: {
          activities: ["trackDocumentVisibility", "trackScroll"],
          exit: ["invokeAutoplayEnd"],
          every: {
            AUTOPLAY_INTERVAL: ["setNextPage", "invokeAutoplay"]
          },
          on: {
            "DRAGGING.START": {
              target: "dragging",
              actions: ["invokeDragStart"]
            },
            "AUTOPLAY.PAUSE": "idle"
          }
        }
      }
    },
    {
      activities: {
        trackSlideMutation(ctx2, _evt, { send }) {
          const el = dom.getItemGroupEl(ctx2);
          if (!el) return;
          const win = dom.getWin(ctx2);
          const observer = new win.MutationObserver(() => {
            send({ type: "SNAP.REFRESH", src: "slide.mutation" });
            dom.syncTabIndex(ctx2);
          });
          dom.syncTabIndex(ctx2);
          observer.observe(el, { childList: true, subtree: true });
          return () => observer.disconnect();
        },
        trackSlideResize(ctx2, _evt, { send }) {
          const el = dom.getItemGroupEl(ctx2);
          if (!el) return;
          const win = dom.getWin(ctx2);
          const observer = new win.ResizeObserver(() => {
            send({ type: "SNAP.REFRESH", src: "slide.resize" });
          });
          dom.getItemEls(ctx2).forEach((slide) => observer.observe(slide));
          return () => observer.disconnect();
        },
        trackSlideIntersections(ctx2) {
          const el = dom.getItemGroupEl(ctx2);
          const win = dom.getWin(ctx2);
          const observer = new win.IntersectionObserver(
            (entries) => {
              const slidesInView = entries.reduce((acc, entry) => {
                const target = entry.target;
                const index = Number(target.dataset.index ?? "-1");
                if (index == null || Number.isNaN(index) || index === -1) return acc;
                return entry.isIntersecting ? add(acc, index) : remove(acc, index);
              }, ctx2.slidesInView);
              ctx2.slidesInView = uniq(slidesInView);
            },
            {
              root: el,
              threshold: ctx2.inViewThreshold
            }
          );
          dom.getItemEls(ctx2).forEach((slide) => observer.observe(slide));
          return () => observer.disconnect();
        },
        trackScroll(ctx2) {
          const el = dom.getItemGroupEl(ctx2);
          if (!el) return;
          const onScrollEnd = () => {
            if (ctx2.slidesInView.length === 0) return;
            const scrollPosition = ctx2.isHorizontal ? el.scrollLeft : el.scrollTop;
            const page = ctx2.pageSnapPoints.findIndex((point) => Math.abs(point - scrollPosition) < 1);
            if (page === -1) return;
            set.page(ctx2, page);
          };
          const onScroll = () => {
            clearTimeout(ctx2.timeoutRef.current);
            ctx2.timeoutRef.current = setTimeout(() => {
              onScrollEnd?.();
            }, 150);
          };
          return addDomEvent(el, "scroll", onScroll, { passive: true });
        },
        trackDocumentVisibility(ctx2, _evt, { send }) {
          const doc = dom.getDoc(ctx2);
          const onVisibilityChange = () => {
            if (doc.visibilityState === "visible") return;
            send({ type: "AUTOPLAY.PAUSE", src: "doc.hidden" });
          };
          return addDomEvent(doc, "visibilitychange", onVisibilityChange);
        },
        trackPointerMove(ctx2, _evt, { send }) {
          const doc = dom.getDoc(ctx2);
          return trackPointerMove(doc, {
            onPointerMove({ event }) {
              send({ type: "DRAGGING", left: -event.movementX, top: -event.movementY });
            },
            onPointerUp() {
              send({ type: "DRAGGING.END" });
            }
          });
        }
      },
      actions: {
        resetScrollPosition(ctx2) {
          const el = dom.getItemGroupEl(ctx2);
          el.scrollTo(0, 0);
        },
        clearScrollEndTimer(ctx2) {
          if (ctx2.timeoutRef.current == null) return;
          clearTimeout(ctx2.timeoutRef.current);
          ctx2.timeoutRef.current = void 0;
        },
        scrollToPage(ctx2, evt) {
          const behavior = evt.instant ? "instant" : "smooth";
          const index = clamp(evt.index ?? ctx2.page, 0, ctx2.pageSnapPoints.length - 1);
          const el = dom.getItemGroupEl(ctx2);
          const axis = ctx2.isHorizontal ? "left" : "top";
          el.scrollTo({ [axis]: ctx2.pageSnapPoints[index], behavior });
        },
        setNextPage(ctx2) {
          const page = nextIndex(ctx2.pageSnapPoints, ctx2.page, { loop: ctx2.loop });
          set.page(ctx2, page);
        },
        setPrevPage(ctx2) {
          const page = prevIndex(ctx2.pageSnapPoints, ctx2.page, { loop: ctx2.loop });
          set.page(ctx2, page);
        },
        setMatchingPage(ctx2, evt) {
          const snapPoint = findSnapPoint(
            dom.getItemGroupEl(ctx2),
            ctx2.isHorizontal ? "x" : "y",
            (node) => node.dataset.index === evt.index.toString()
          );
          if (snapPoint == null) return;
          const page = ctx2.pageSnapPoints.indexOf(snapPoint);
          set.page(ctx2, page);
        },
        setPage(ctx2, evt) {
          set.page(ctx2, evt.index ?? ctx2.page);
        },
        clampPage(ctx2) {
          const index = clamp(ctx2.page, 0, ctx2.pageSnapPoints.length - 1);
          set.page(ctx2, index);
        },
        setSnapPoints(ctx2) {
          queueMicrotask(() => {
            const el = dom.getItemGroupEl(ctx2);
            const scrollSnapPoints = getScrollSnapPositions(el);
            ctx2.pageSnapPoints = ctx2.isHorizontal ? scrollSnapPoints.x : scrollSnapPoints.y;
          });
        },
        disableScrollSnap(ctx2) {
          const el = dom.getItemGroupEl(ctx2);
          const styles = getComputedStyle(el);
          el.dataset.scrollSnapType = styles.getPropertyValue("scroll-snap-type");
          el.style.setProperty("scroll-snap-type", "none");
        },
        scrollSlides(ctx2, evt) {
          const el = dom.getItemGroupEl(ctx2);
          el.scrollBy({ left: evt.left, top: evt.top, behavior: "instant" });
        },
        endDragging(ctx2) {
          const el = dom.getItemGroupEl(ctx2);
          const startX = el.scrollLeft;
          const startY = el.scrollTop;
          const snapPositions = getScrollSnapPositions(el);
          const closestX = snapPositions.x.reduce((closest, curr) => {
            return Math.abs(curr - startX) < Math.abs(closest - startX) ? curr : closest;
          }, snapPositions.x[0]);
          const closestY = snapPositions.y.reduce((closest, curr) => {
            return Math.abs(curr - startY) < Math.abs(closest - startY) ? curr : closest;
          }, snapPositions.y[0]);
          raf(() => {
            el.scrollTo({ left: closestX, top: closestY, behavior: "smooth" });
            const scrollSnapType = el.dataset.scrollSnapType;
            if (scrollSnapType) {
              el.style.removeProperty("scroll-snap-type");
              delete el.dataset.scrollSnapType;
            }
          });
        },
        focusIndicatorEl(ctx2, evt) {
          if (evt.src !== "indicator") return;
          const el = dom.getActiveIndicatorEl(ctx2);
          raf(() => el.focus({ preventScroll: true }));
        },
        invokeDragStart(ctx2) {
          ctx2.onDragStatusChange?.({ type: "dragging.start", isDragging: true, page: ctx2.page });
        },
        invokeDragging(ctx2) {
          ctx2.onDragStatusChange?.({ type: "dragging", isDragging: true, page: ctx2.page });
        },
        invokeDraggingEnd(ctx2) {
          ctx2.onDragStatusChange?.({ type: "dragging.end", isDragging: false, page: ctx2.page });
        },
        invokeAutoplay(ctx2) {
          ctx2.onAutoplayStatusChange?.({ type: "autoplay", isPlaying: true, page: ctx2.page });
        },
        invokeAutoplayStart(ctx2) {
          ctx2.onAutoplayStatusChange?.({ type: "autoplay.start", isPlaying: true, page: ctx2.page });
        },
        invokeAutoplayEnd(ctx2) {
          ctx2.onAutoplayStatusChange?.({ type: "autoplay.stop", isPlaying: false, page: ctx2.page });
        }
      },
      delays: {
        AUTOPLAY_INTERVAL: (ctx2) => ctx2.autoplayInterval
      }
    }
  );
}
var invoke = {
  pageChange: (ctx) => {
    ctx.onPageChange?.({
      page: ctx.page,
      pageSnapPoint: ctx.pageSnapPoints[ctx.page]
    });
  }
};
var set = {
  page: (ctx, value) => {
    const page = clamp(value, 0, ctx.pageSnapPoints.length - 1);
    if (isEqual(ctx.page, page)) return;
    ctx.page = page;
    invoke.pageChange(ctx);
  }
};
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function getPageSnapPoints(totalSlides, slidesPerMove, slidesPerPage) {
  if (totalSlides == null) return [];
  const snapPoints = [];
  const perMove = slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove;
  for (let i = 0; i < totalSlides - 1; i += perMove) snapPoints.push(i);
  return snapPoints;
}
var props = createProps()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "page",
  "onPageChange",
  "orientation",
  "slideCount",
  "slidesPerPage",
  "slidesPerMove",
  "spacing",
  "padding",
  "autoplay",
  "allowMouseDrag",
  "inViewThreshold",
  "translations",
  "snapType",
  "onDragStatusChange",
  "onAutoplayStatusChange"
]);
var splitProps = createSplitProps(props);
var indicatorProps = createProps()(["index", "readOnly"]);
var splitIndicatorProps = createSplitProps(indicatorProps);
var itemProps = createProps()(["index", "snapAlign"]);
var splitItemProps = createSplitProps(itemProps);

export { anatomy, connect, indicatorProps, itemProps, machine, props, splitIndicatorProps, splitItemProps, splitProps };
