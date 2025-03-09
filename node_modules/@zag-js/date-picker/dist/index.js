'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var date = require('@internationalized/date');
var dateUtils = require('@zag-js/date-utils');
var domQuery = require('@zag-js/dom-query');
var popper = require('@zag-js/popper');
var utils = require('@zag-js/utils');
var core = require('@zag-js/core');
var dismissable = require('@zag-js/dismissable');
var liveRegion = require('@zag-js/live-region');
var types = require('@zag-js/types');

// src/date-picker.anatomy.ts
var anatomy = anatomy$1.createAnatomy("date-picker").parts(
  "root",
  "label",
  "clearTrigger",
  "content",
  "control",
  "input",
  "monthSelect",
  "nextTrigger",
  "positioner",
  "prevTrigger",
  "rangeText",
  "table",
  "tableBody",
  "tableCell",
  "tableCellTrigger",
  "tableHead",
  "tableHeader",
  "tableRow",
  "trigger",
  "viewTrigger",
  "viewControl",
  "yearSelect",
  "presetTrigger"
);
var parts = anatomy.build();
var dom = domQuery.createScope({
  getLabelId: (ctx, index) => ctx.ids?.label?.(index) ?? `datepicker:${ctx.id}:label:${index}`,
  getRootId: (ctx) => ctx.ids?.root ?? `datepicker:${ctx.id}`,
  getTableId: (ctx, id) => ctx.ids?.table?.(id) ?? `datepicker:${ctx.id}:table:${id}`,
  getTableHeaderId: (ctx, id) => ctx.ids?.tableHeader?.(id) ?? `datepicker:${ctx.id}:thead`,
  getTableBodyId: (ctx, id) => ctx.ids?.tableBody?.(id) ?? `datepicker:${ctx.id}:tbody`,
  getTableRowId: (ctx, id) => ctx.ids?.tableRow?.(id) ?? `datepicker:${ctx.id}:tr:${id}`,
  getContentId: (ctx) => ctx.ids?.content ?? `datepicker:${ctx.id}:content`,
  getCellTriggerId: (ctx, id) => ctx.ids?.cellTrigger?.(id) ?? `datepicker:${ctx.id}:cell-trigger:${id}`,
  getPrevTriggerId: (ctx, view) => ctx.ids?.prevTrigger?.(view) ?? `datepicker:${ctx.id}:prev:${view}`,
  getNextTriggerId: (ctx, view) => ctx.ids?.nextTrigger?.(view) ?? `datepicker:${ctx.id}:next:${view}`,
  getViewTriggerId: (ctx, view) => ctx.ids?.viewTrigger?.(view) ?? `datepicker:${ctx.id}:view:${view}`,
  getClearTriggerId: (ctx) => ctx.ids?.clearTrigger ?? `datepicker:${ctx.id}:clear`,
  getControlId: (ctx) => ctx.ids?.control ?? `datepicker:${ctx.id}:control`,
  getInputId: (ctx, index) => ctx.ids?.input?.(index) ?? `datepicker:${ctx.id}:input:${index}`,
  getTriggerId: (ctx) => ctx.ids?.trigger ?? `datepicker:${ctx.id}:trigger`,
  getPositionerId: (ctx) => ctx.ids?.positioner ?? `datepicker:${ctx.id}:positioner`,
  getMonthSelectId: (ctx) => ctx.ids?.monthSelect ?? `datepicker:${ctx.id}:month-select`,
  getYearSelectId: (ctx) => ctx.ids?.yearSelect ?? `datepicker:${ctx.id}:year-select`,
  getFocusedCell: (ctx, view = ctx.view) => domQuery.query(
    dom.getContentEl(ctx),
    `[data-part=table-cell-trigger][data-view=${view}][data-focus]:not([data-outside-range])`
  ),
  getTriggerEl: (ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getContentEl: (ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEls: (ctx) => domQuery.queryAll(dom.getControlEl(ctx), `[data-part=input]`),
  getYearSelectEl: (ctx) => dom.getById(ctx, dom.getYearSelectId(ctx)),
  getMonthSelectEl: (ctx) => dom.getById(ctx, dom.getMonthSelectId(ctx)),
  getClearTriggerEl: (ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx) => dom.getById(ctx, dom.getControlId(ctx))
});
function adjustStartAndEndDate(value) {
  const [startDate, endDate] = value;
  if (!startDate || !endDate) return value;
  return startDate.compare(endDate) <= 0 ? value : [endDate, startDate];
}
function isDateWithinRange(date, value) {
  const [startDate, endDate] = value;
  if (!startDate || !endDate) return false;
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0;
}
function sortDates(values) {
  return values.sort((a, b) => a.compare(b));
}
function getRoleDescription(view) {
  return utils.match(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month"
  });
}
var PLACEHOLDERS = {
  day: "dd",
  month: "mm",
  year: "yyyy"
};
function getInputPlaceholder(locale) {
  return new date.DateFormatter(locale).formatToParts(/* @__PURE__ */ new Date()).map((item) => PLACEHOLDERS[item.type] ?? item.value).join("");
}
var isValidCharacter = (char, separator) => {
  if (!char) return true;
  return /\d/.test(char) || char === separator || char.length !== 1;
};
var isValidDate = (value) => {
  return !Number.isNaN(value.day) && !Number.isNaN(value.month) && !Number.isNaN(value.year);
};
var ensureValidCharacters = (value, separator) => {
  return value.split("").filter((char) => isValidCharacter(char, separator)).join("");
};
function getLocaleSeparator(locale) {
  const dateFormatter = new Intl.DateTimeFormat(locale);
  const parts2 = dateFormatter.formatToParts(/* @__PURE__ */ new Date());
  const literalPart = parts2.find((part) => part.type === "literal");
  return literalPart ? literalPart.value : "/";
}
var defaultTranslations = {
  dayCell(state) {
    if (state.unavailable) return `Not available. ${state.formattedDate}`;
    if (state.selected) return `Selected date. ${state.formattedDate}`;
    return `Choose ${state.formattedDate}`;
  },
  trigger(open) {
    return open ? "Close calendar" : "Open calendar";
  },
  viewTrigger(view) {
    return utils.match(view, {
      year: "Switch to month view",
      month: "Switch to day view",
      day: "Switch to year view"
    });
  },
  presetTrigger(value) {
    return Array.isArray(value) ? `select ${value[0].toString()} to ${value[1].toString()}` : `select ${value}`;
  },
  prevTrigger(view) {
    return utils.match(view, {
      year: "Switch to previous decade",
      month: "Switch to previous year",
      day: "Switch to previous month"
    });
  },
  nextTrigger(view) {
    return utils.match(view, {
      year: "Switch to next decade",
      month: "Switch to next year",
      day: "Switch to next month"
    });
  },
  // TODO: Revisit this
  placeholder() {
    return { day: "dd", month: "mm", year: "yyyy" };
  },
  content: "calendar",
  monthSelect: "Select month",
  yearSelect: "Select year",
  clearTrigger: "Clear selected dates"
};
function viewToNumber(view, fallback) {
  if (!view) return fallback || 0;
  return view === "day" ? 0 : view === "month" ? 1 : 2;
}
function viewNumberToView(viewNumber) {
  return viewNumber === 0 ? "day" : viewNumber === 1 ? "month" : "year";
}
function clampView(view, minView, maxView) {
  return viewNumberToView(
    utils.clampValue(viewToNumber(view, 0), viewToNumber(minView, 0), viewToNumber(maxView, 2))
  );
}
function isAboveMinView(view, minView) {
  return viewToNumber(view, 0) > viewToNumber(minView, 0);
}
function isBelowMinView(view, minView) {
  return viewToNumber(view, 0) < viewToNumber(minView, 0);
}
function getNextView(view, minView, maxView) {
  const nextViewNumber = viewToNumber(view, 0) + 1;
  return clampView(viewNumberToView(nextViewNumber), minView, maxView);
}
function getPreviousView(view, minView, maxView) {
  const prevViewNumber = viewToNumber(view, 0) - 1;
  return clampView(viewNumberToView(prevViewNumber), minView, maxView);
}
var views = ["day", "month", "year"];
function eachView(cb) {
  views.forEach((view) => cb(view));
}

// src/date-picker.connect.ts
function connect(state, send, normalize) {
  const startValue = state.context.startValue;
  const endValue = state.context.endValue;
  const selectedValue = state.context.value;
  const focusedValue = state.context.focusedValue;
  const hoveredValue = state.context.hoveredValue;
  const hoveredRangeValue = hoveredValue ? adjustStartAndEndDate([selectedValue[0], hoveredValue]) : [];
  const disabled = state.context.disabled;
  const readOnly = state.context.readOnly;
  const interactive = state.context.isInteractive;
  const min = state.context.min;
  const max = state.context.max;
  const locale = state.context.locale;
  const timeZone = state.context.timeZone;
  const startOfWeek = state.context.startOfWeek;
  const focused = state.matches("focused");
  const open = state.matches("open");
  const isRangePicker = state.context.selectionMode === "range";
  const isDateUnavailableFn = state.context.isDateUnavailable;
  const currentPlacement = state.context.currentPlacement;
  const popperStyles = popper.getPlacementStyles({
    ...state.context.positioning,
    placement: currentPlacement
  });
  const separator = getLocaleSeparator(locale);
  function getMonthWeeks(from = startValue) {
    const numOfWeeks = state.context.fixedWeeks ? 6 : void 0;
    return dateUtils.getMonthDays(from, locale, numOfWeeks, startOfWeek);
  }
  function getMonths(props2 = {}) {
    const { format } = props2;
    return dateUtils.getMonthNames(locale, format).map((label, index) => ({ label, value: index + 1 }));
  }
  function getYears() {
    const range = dateUtils.getYearsRange({ from: min?.year ?? 1900, to: max?.year ?? 2100 });
    return range.map((year) => ({ label: year.toString(), value: year }));
  }
  function getDecadeYears(year) {
    const range = dateUtils.getDecadeRange(focusedValue.year);
    return range.map((year2) => ({ label: year2.toString(), value: year2 }));
  }
  function isUnavailable(date) {
    return dateUtils.isDateUnavailable(date, isDateUnavailableFn, locale, min, max);
  }
  function focusMonth(month) {
    const date = startValue ?? dateUtils.getTodayDate(timeZone);
    send({ type: "FOCUS.SET", value: date.set({ month }) });
  }
  function focusYear(year) {
    const date = startValue ?? dateUtils.getTodayDate(timeZone);
    send({ type: "FOCUS.SET", value: date.set({ year }) });
  }
  function getYearTableCellState(props2) {
    const { value, disabled: disabled2 } = props2;
    const cellState = {
      focused: focusedValue.year === props2.value,
      selectable: utils.isValueWithinRange(value, min?.year ?? 0, max?.year ?? 9999),
      selected: !!selectedValue.find((date) => date.year === value),
      valueText: value.toString(),
      get disabled() {
        return disabled2 || !cellState.selectable;
      }
    };
    return cellState;
  }
  function getMonthTableCellState(props2) {
    const { value, disabled: disabled2 } = props2;
    const normalized = focusedValue.set({ month: value });
    const formatter = dateUtils.getMonthFormatter(locale, timeZone);
    const cellState = {
      focused: focusedValue.month === props2.value,
      selectable: !dateUtils.isDateInvalid(normalized, min, max),
      selected: !!selectedValue.find((date) => date.month === value && date.year === focusedValue.year),
      valueText: formatter.format(normalized.toDate(timeZone)),
      get disabled() {
        return disabled2 || !cellState.selectable;
      }
    };
    return cellState;
  }
  const translations = state.context.translations || defaultTranslations;
  function getDayTableCellState(props2) {
    const { value, disabled: disabled2, visibleRange = state.context.visibleRange } = props2;
    const formatter = dateUtils.getDayFormatter(locale, timeZone);
    const unitDuration = dateUtils.getUnitDuration(state.context.visibleDuration);
    const end = visibleRange.start.add(unitDuration).subtract({ days: 1 });
    const cellState = {
      invalid: dateUtils.isDateInvalid(value, min, max),
      disabled: disabled2 || dateUtils.isDateDisabled(value, visibleRange.start, end, min, max),
      selected: selectedValue.some((date) => dateUtils.isDateEqual(value, date)),
      unavailable: dateUtils.isDateUnavailable(value, isDateUnavailableFn, locale, min, max) && !disabled2,
      outsideRange: dateUtils.isDateOutsideVisibleRange(value, visibleRange.start, end),
      inRange: isRangePicker && (isDateWithinRange(value, selectedValue) || isDateWithinRange(value, hoveredRangeValue)),
      firstInRange: isRangePicker && dateUtils.isDateEqual(value, selectedValue[0]),
      lastInRange: isRangePicker && dateUtils.isDateEqual(value, selectedValue[1]),
      today: date.isToday(value, timeZone),
      weekend: date.isWeekend(value, locale),
      formattedDate: formatter.format(value.toDate(timeZone)),
      get focused() {
        return dateUtils.isDateEqual(value, focusedValue) && !cellState.outsideRange;
      },
      get ariaLabel() {
        return translations.dayCell(cellState);
      },
      get selectable() {
        return !cellState.disabled && !cellState.unavailable;
      }
    };
    return cellState;
  }
  function getTableId(props2) {
    const { view = "day", id } = props2;
    return [view, id].filter(Boolean).join(" ");
  }
  return {
    focused,
    open,
    view: state.context.view,
    getRangePresetValue(preset) {
      return dateUtils.getDateRangePreset(preset, locale, timeZone);
    },
    getDaysInWeek(week, from = startValue) {
      return dateUtils.getDaysInWeek(week, from, locale, startOfWeek);
    },
    getOffset(duration) {
      const from = startValue.add(duration);
      return {
        visibleRange: { start: from, end: endValue.add(duration) },
        weeks: getMonthWeeks(from)
      };
    },
    getMonthWeeks,
    isUnavailable,
    weeks: getMonthWeeks(),
    weekDays: dateUtils.getWeekDays(dateUtils.getTodayDate(timeZone), startOfWeek, timeZone, locale),
    visibleRangeText: state.context.visibleRangeText,
    value: selectedValue,
    valueAsDate: selectedValue.map((date) => date.toDate(timeZone)),
    valueAsString: state.context.valueAsString,
    focusedValue,
    focusedValueAsDate: focusedValue?.toDate(timeZone),
    focusedValueAsString: state.context.format(focusedValue, { locale, timeZone }),
    visibleRange: state.context.visibleRange,
    selectToday() {
      const value = dateUtils.constrainValue(dateUtils.getTodayDate(timeZone), min, max);
      send({ type: "VALUE.SET", value });
    },
    setValue(values) {
      const computedValue = values.map((date) => dateUtils.constrainValue(date, min, max));
      send({ type: "VALUE.SET", value: computedValue });
    },
    clearValue() {
      send("VALUE.CLEAR");
    },
    setFocusedValue(value) {
      send({ type: "FOCUS.SET", value });
    },
    setOpen(nextOpen) {
      if (nextOpen === open) return;
      send(nextOpen ? "OPEN" : "CLOSE");
    },
    focusMonth,
    focusYear,
    getYears,
    getMonths,
    getYearsGrid(props2 = {}) {
      const { columns = 1 } = props2;
      return utils.chunk(getDecadeYears(), columns);
    },
    getDecade() {
      const years = dateUtils.getDecadeRange(focusedValue.year);
      return { start: years.at(0), end: years.at(-1) };
    },
    getMonthsGrid(props2 = {}) {
      const { columns = 1, format } = props2;
      return utils.chunk(getMonths({ format }), columns);
    },
    format(value, opts = { month: "long", year: "numeric" }) {
      return new date.DateFormatter(locale, opts).format(value.toDate(timeZone));
    },
    setView(view) {
      send({ type: "VIEW.SET", view });
    },
    goToNext() {
      send({ type: "GOTO.NEXT", view: state.context.view });
    },
    goToPrev() {
      send({ type: "GOTO.PREV", view: state.context.view });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        "data-state": open ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(disabled),
        "data-readonly": domQuery.dataAttr(readOnly)
      });
    },
    getLabelProps(props2 = {}) {
      const { index = 0 } = props2;
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(state.context, index),
        dir: state.context.dir,
        htmlFor: dom.getInputId(state.context, index),
        "data-state": open ? "open" : "closed",
        "data-index": index,
        "data-disabled": domQuery.dataAttr(disabled),
        "data-readonly": domQuery.dataAttr(readOnly)
      });
    },
    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
        "data-disabled": domQuery.dataAttr(disabled)
      });
    },
    getRangeTextProps() {
      return normalize.element({
        ...parts.rangeText.attrs,
        dir: state.context.dir
      });
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        hidden: !open,
        dir: state.context.dir,
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        id: dom.getContentId(state.context),
        tabIndex: -1,
        role: "application",
        "aria-roledescription": "datepicker",
        "aria-label": translations.content
      });
    },
    getTableProps(props2 = {}) {
      const { view = "day", columns = view === "day" ? 7 : 4 } = props2;
      const uid = getTableId(props2);
      return normalize.element({
        ...parts.table.attrs,
        role: "grid",
        "data-columns": columns,
        "aria-roledescription": getRoleDescription(view),
        id: dom.getTableId(state.context, uid),
        "aria-readonly": domQuery.ariaAttr(readOnly),
        "aria-disabled": domQuery.ariaAttr(disabled),
        "aria-multiselectable": domQuery.ariaAttr(state.context.selectionMode !== "single"),
        "data-view": view,
        dir: state.context.dir,
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          const keyMap = {
            Enter() {
              if (isUnavailable(focusedValue)) return;
              send({ type: "TABLE.ENTER", view, columns, focus: true });
            },
            ArrowLeft() {
              send({ type: "TABLE.ARROW_LEFT", view, columns, focus: true });
            },
            ArrowRight() {
              send({ type: "TABLE.ARROW_RIGHT", view, columns, focus: true });
            },
            ArrowUp() {
              send({ type: "TABLE.ARROW_UP", view, columns, focus: true });
            },
            ArrowDown() {
              send({ type: "TABLE.ARROW_DOWN", view, columns, focus: true });
            },
            PageUp(event2) {
              send({ type: "TABLE.PAGE_UP", larger: event2.shiftKey, view, columns, focus: true });
            },
            PageDown(event2) {
              send({ type: "TABLE.PAGE_DOWN", larger: event2.shiftKey, view, columns, focus: true });
            },
            Home() {
              send({ type: "TABLE.HOME", view, columns, focus: true });
            },
            End() {
              send({ type: "TABLE.END", view, columns, focus: true });
            }
          };
          const exec = keyMap[domQuery.getEventKey(event, state.context)];
          if (exec) {
            exec(event);
            event.preventDefault();
            event.stopPropagation();
          }
        },
        onPointerLeave() {
          send({ type: "TABLE.POINTER_LEAVE" });
        },
        onPointerDown() {
          send({ type: "TABLE.POINTER_DOWN", view });
        },
        onPointerUp() {
          send({ type: "TABLE.POINTER_UP", view });
        }
      });
    },
    getTableHeadProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.element({
        ...parts.tableHead.attrs,
        "aria-hidden": true,
        dir: state.context.dir,
        "data-view": view,
        "data-disabled": domQuery.dataAttr(disabled)
      });
    },
    getTableHeaderProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.element({
        ...parts.tableHeader.attrs,
        dir: state.context.dir,
        "data-view": view,
        "data-disabled": domQuery.dataAttr(disabled)
      });
    },
    getTableBodyProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.element({
        ...parts.tableBody.attrs,
        "data-view": view,
        "data-disabled": domQuery.dataAttr(disabled)
      });
    },
    getTableRowProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.element({
        ...parts.tableRow.attrs,
        "aria-disabled": domQuery.ariaAttr(disabled),
        "data-disabled": domQuery.dataAttr(disabled),
        "data-view": view
      });
    },
    getDayTableCellState,
    getDayTableCellProps(props2) {
      const { value } = props2;
      const cellState = getDayTableCellState(props2);
      return normalize.element({
        ...parts.tableCell.attrs,
        role: "gridcell",
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "aria-selected": cellState.selected || cellState.inRange,
        "aria-invalid": domQuery.ariaAttr(cellState.invalid),
        "aria-current": cellState.today ? "date" : void 0,
        "data-value": value.toString()
      });
    },
    getDayTableCellTriggerProps(props2) {
      const { value } = props2;
      const cellState = getDayTableCellState(props2);
      return normalize.element({
        ...parts.tableCellTrigger.attrs,
        id: dom.getCellTriggerId(state.context, value.toString()),
        role: "button",
        dir: state.context.dir,
        tabIndex: cellState.focused ? 0 : -1,
        "aria-label": cellState.ariaLabel,
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "aria-invalid": domQuery.ariaAttr(cellState.invalid),
        "data-disabled": domQuery.dataAttr(!cellState.selectable),
        "data-selected": domQuery.dataAttr(cellState.selected),
        "data-value": value.toString(),
        "data-view": "day",
        "data-today": domQuery.dataAttr(cellState.today),
        "data-focus": domQuery.dataAttr(cellState.focused),
        "data-unavailable": domQuery.dataAttr(cellState.unavailable),
        "data-range-start": domQuery.dataAttr(cellState.firstInRange),
        "data-range-end": domQuery.dataAttr(cellState.lastInRange),
        "data-in-range": domQuery.dataAttr(cellState.inRange),
        "data-outside-range": domQuery.dataAttr(cellState.outsideRange),
        "data-weekend": domQuery.dataAttr(cellState.weekend),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!cellState.selectable) return;
          send({ type: "CELL.CLICK", cell: "day", value });
        },
        onPointerMove(event) {
          if (event.pointerType === "touch" || !cellState.selectable) return;
          const focus = event.currentTarget.ownerDocument.activeElement !== event.currentTarget;
          if (hoveredValue && date.isEqualDay(value, hoveredValue)) return;
          send({ type: "CELL.POINTER_MOVE", cell: "day", value, focus });
        }
      });
    },
    getMonthTableCellState,
    getMonthTableCellProps(props2) {
      const { value, columns } = props2;
      const cellState = getMonthTableCellState(props2);
      return normalize.element({
        ...parts.tableCell.attrs,
        dir: state.context.dir,
        colSpan: columns,
        role: "gridcell",
        "aria-selected": domQuery.ariaAttr(cellState.selected),
        "data-selected": domQuery.dataAttr(cellState.selected),
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "data-value": value
      });
    },
    getMonthTableCellTriggerProps(props2) {
      const { value } = props2;
      const cellState = getMonthTableCellState(props2);
      return normalize.element({
        ...parts.tableCellTrigger.attrs,
        dir: state.context.dir,
        role: "button",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "data-selected": domQuery.dataAttr(cellState.selected),
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "data-disabled": domQuery.dataAttr(!cellState.selectable),
        "data-focus": domQuery.dataAttr(cellState.focused),
        "aria-label": cellState.valueText,
        "data-view": "month",
        "data-value": value,
        tabIndex: cellState.focused ? 0 : -1,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!cellState.selectable) return;
          send({ type: "CELL.CLICK", cell: "month", value });
        }
      });
    },
    getYearTableCellState,
    getYearTableCellProps(props2) {
      const { value, columns } = props2;
      const cellState = getYearTableCellState(props2);
      return normalize.element({
        ...parts.tableCell.attrs,
        dir: state.context.dir,
        colSpan: columns,
        role: "gridcell",
        "aria-selected": domQuery.ariaAttr(cellState.selected),
        "data-selected": domQuery.dataAttr(cellState.selected),
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "data-value": value
      });
    },
    getYearTableCellTriggerProps(props2) {
      const { value } = props2;
      const cellState = getYearTableCellState(props2);
      return normalize.element({
        ...parts.tableCellTrigger.attrs,
        dir: state.context.dir,
        role: "button",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "data-selected": domQuery.dataAttr(cellState.selected),
        "data-focus": domQuery.dataAttr(cellState.focused),
        "aria-disabled": domQuery.ariaAttr(!cellState.selectable),
        "data-disabled": domQuery.dataAttr(!cellState.selectable),
        "aria-label": cellState.valueText,
        "data-value": value,
        "data-view": "year",
        tabIndex: cellState.focused ? 0 : -1,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!cellState.selectable) return;
          send({ type: "CELL.CLICK", cell: "year", value });
        }
      });
    },
    getNextTriggerProps(props2 = {}) {
      const { view = "day" } = props2;
      const isDisabled = disabled || !state.context.isNextVisibleRangeValid;
      return normalize.button({
        ...parts.nextTrigger.attrs,
        dir: state.context.dir,
        id: dom.getNextTriggerId(state.context, view),
        type: "button",
        "aria-label": translations.nextTrigger(view),
        disabled: isDisabled,
        "data-disabled": domQuery.dataAttr(isDisabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "GOTO.NEXT", view });
        }
      });
    },
    getPrevTriggerProps(props2 = {}) {
      const { view = "day" } = props2;
      const isDisabled = disabled || !state.context.isPrevVisibleRangeValid;
      return normalize.button({
        ...parts.prevTrigger.attrs,
        dir: state.context.dir,
        id: dom.getPrevTriggerId(state.context, view),
        type: "button",
        "aria-label": translations.prevTrigger(view),
        disabled: isDisabled,
        "data-disabled": domQuery.dataAttr(isDisabled),
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "GOTO.PREV", view });
        }
      });
    },
    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(state.context),
        dir: state.context.dir,
        type: "button",
        "aria-label": translations.clearTrigger,
        hidden: !state.context.value.length,
        onClick(event) {
          if (event.defaultPrevented) return;
          send("VALUE.CLEAR");
        }
      });
    },
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(state.context),
        dir: state.context.dir,
        type: "button",
        "data-placement": currentPlacement,
        "aria-label": translations.trigger(open),
        "aria-controls": dom.getContentId(state.context),
        "data-state": open ? "open" : "closed",
        "aria-haspopup": "grid",
        disabled,
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send("TRIGGER.CLICK");
        }
      });
    },
    getViewTriggerProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.button({
        ...parts.viewTrigger.attrs,
        "data-view": view,
        dir: state.context.dir,
        id: dom.getViewTriggerId(state.context, view),
        type: "button",
        disabled,
        "aria-label": translations.viewTrigger(view),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          send({ type: "VIEW.TOGGLE", src: "viewTrigger" });
        }
      });
    },
    getViewControlProps(props2 = {}) {
      const { view = "day" } = props2;
      return normalize.element({
        ...parts.viewControl.attrs,
        "data-view": view,
        dir: state.context.dir
      });
    },
    getInputProps(props2 = {}) {
      const { index = 0, fixOnBlur = true } = props2;
      return normalize.input({
        ...parts.input.attrs,
        id: dom.getInputId(state.context, index),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        dir: state.context.dir,
        name: state.context.name,
        "data-index": index,
        "data-state": open ? "open" : "closed",
        readOnly,
        disabled,
        placeholder: state.context.placeholder || getInputPlaceholder(locale),
        defaultValue: state.context.valueAsString[index],
        onBeforeInput(event) {
          const { data } = domQuery.getNativeEvent(event);
          if (!isValidCharacter(data, separator)) {
            event.preventDefault();
          }
        },
        onFocus() {
          send({ type: "INPUT.FOCUS", index });
        },
        onBlur(event) {
          const value = event.currentTarget.value.trim();
          send({ type: "INPUT.BLUR", value, index, fixOnBlur });
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!interactive) return;
          const keyMap = {
            Enter(event2) {
              if (domQuery.isComposingEvent(event2)) return;
              if (isUnavailable(state.context.focusedValue)) return;
              if (event2.currentTarget.value.trim() === "") return;
              send({ type: "INPUT.ENTER", value: event2.currentTarget.value, index });
            }
          };
          const exec = keyMap[event.key];
          if (exec) {
            exec(event);
            event.preventDefault();
          }
        },
        onInput(event) {
          const value = event.currentTarget.value;
          send({ type: "INPUT.CHANGE", value: ensureValidCharacters(value, separator), index });
        }
      });
    },
    getMonthSelectProps() {
      return normalize.select({
        ...parts.monthSelect.attrs,
        id: dom.getMonthSelectId(state.context),
        "aria-label": translations.monthSelect,
        disabled,
        dir: state.context.dir,
        defaultValue: startValue.month,
        onChange(event) {
          focusMonth(Number(event.currentTarget.value));
        }
      });
    },
    getYearSelectProps() {
      return normalize.select({
        ...parts.yearSelect.attrs,
        id: dom.getYearSelectId(state.context),
        disabled,
        "aria-label": translations.yearSelect,
        dir: state.context.dir,
        defaultValue: startValue.year,
        onChange(event) {
          focusYear(Number(event.currentTarget.value));
        }
      });
    },
    getPositionerProps() {
      return normalize.element({
        id: dom.getPositionerId(state.context),
        ...parts.positioner.attrs,
        dir: state.context.dir,
        style: popperStyles.floating
      });
    },
    getPresetTriggerProps(props2) {
      const value = Array.isArray(props2.value) ? props2.value : dateUtils.getDateRangePreset(props2.value, locale, timeZone);
      const valueAsString = value.map((item) => item.toDate(timeZone).toDateString());
      return normalize.button({
        ...parts.presetTrigger.attrs,
        "aria-label": translations.presetTrigger(valueAsString),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return;
          send({ type: "PRESET.CLICK", value });
        }
      });
    }
  };
}
var { and } = core.guards;
var transformContext = (ctx) => {
  const locale = ctx.locale || "en-US";
  const timeZone = ctx.timeZone || "UTC";
  const selectionMode = ctx.selectionMode || "single";
  const numOfMonths = ctx.numOfMonths || 1;
  const value = sortDates(ctx.value || []).map((date) => dateUtils.constrainValue(date, ctx.min, ctx.max));
  let focusedValue = value[0] || ctx.focusedValue || dateUtils.getTodayDate(timeZone);
  focusedValue = dateUtils.constrainValue(focusedValue, ctx.min, ctx.max);
  const startValue = dateUtils.alignDate(focusedValue, "start", { months: numOfMonths }, locale);
  const minView = "day";
  const maxView = "year";
  const view = clampView(ctx.view || minView, minView, maxView);
  return {
    locale,
    numOfMonths,
    focusedValue,
    startValue,
    inputValue: "",
    timeZone,
    value,
    selectionMode,
    view,
    minView,
    maxView,
    activeIndex: 0,
    hoveredValue: null,
    closeOnSelect: true,
    disabled: false,
    readOnly: false,
    min: void 0,
    max: void 0,
    format(date$1, { locale: locale2, timeZone: timeZone2 }) {
      const formatter = new date.DateFormatter(locale2, { timeZone: timeZone2, day: "2-digit", month: "2-digit", year: "numeric" });
      return formatter.format(date$1.toDate(timeZone2));
    },
    parse(value2, { locale: locale2, timeZone: timeZone2 }) {
      return dateUtils.parseDateString(value2, locale2, timeZone2);
    },
    ...ctx,
    positioning: {
      placement: "bottom",
      ...ctx.positioning
    }
  };
};
function machine(userContext) {
  const ctx = utils.compact(userContext);
  return core.createMachine(
    {
      id: "datepicker",
      initial: ctx.open ? "open" : "idle",
      context: transformContext(ctx),
      computed: {
        isInteractive: (ctx2) => !ctx2.disabled && !ctx2.readOnly,
        visibleDuration: (ctx2) => ({ months: ctx2.numOfMonths }),
        endValue: (ctx2) => dateUtils.getEndDate(ctx2.startValue, ctx2.visibleDuration),
        visibleRange: (ctx2) => ({ start: ctx2.startValue, end: ctx2.endValue }),
        visibleRangeText(ctx2) {
          const formatter = new date.DateFormatter(ctx2.locale, { month: "long", year: "numeric", timeZone: ctx2.timeZone });
          const start = formatter.format(ctx2.startValue.toDate(ctx2.timeZone));
          const end = formatter.format(ctx2.endValue.toDate(ctx2.timeZone));
          const formatted = ctx2.selectionMode === "range" ? `${start} - ${end}` : start;
          return { start, end, formatted };
        },
        isPrevVisibleRangeValid: (ctx2) => !dateUtils.isPreviousVisibleRangeInvalid(ctx2.startValue, ctx2.min, ctx2.max),
        isNextVisibleRangeValid: (ctx2) => !dateUtils.isNextVisibleRangeInvalid(ctx2.endValue, ctx2.min, ctx2.max),
        valueAsString(ctx2) {
          return ctx2.value.map((date) => ctx2.format(date, { locale: ctx2.locale, timeZone: ctx2.timeZone }));
        }
      },
      activities: ["setupLiveRegion"],
      created: ["setStartValue"],
      watch: {
        locale: ["setStartValue"],
        focusedValue: [
          "setStartValue",
          "syncMonthSelectElement",
          "syncYearSelectElement",
          "focusActiveCellIfNeeded",
          "setHoveredValueIfKeyboard"
        ],
        inputValue: ["syncInputValue"],
        value: ["syncInputElement"],
        valueAsString: ["announceValueText"],
        view: ["focusActiveCell"],
        open: ["toggleVisibility"]
      },
      on: {
        "VALUE.SET": {
          actions: ["setDateValue", "setFocusedDate"]
        },
        "VIEW.SET": {
          actions: ["setView"]
        },
        "FOCUS.SET": {
          actions: ["setFocusedDate"]
        },
        "VALUE.CLEAR": {
          actions: ["clearDateValue", "clearFocusedDate", "focusFirstInputElement"]
        },
        "INPUT.CHANGE": [
          {
            guard: "isInputValueEmpty",
            actions: ["setInputValue", "clearDateValue", "clearFocusedDate"]
          },
          {
            actions: ["setInputValue", "focusParsedDate"]
          }
        ],
        "INPUT.ENTER": {
          actions: ["focusParsedDate", "selectFocusedDate"]
        },
        "INPUT.FOCUS": {
          actions: ["setActiveIndex"]
        },
        "INPUT.BLUR": [
          {
            guard: "shouldFixOnBlur",
            actions: ["setActiveIndexToStart", "selectParsedDate"]
          },
          {
            actions: ["setActiveIndexToStart"]
          }
        ],
        "PRESET.CLICK": [
          {
            guard: "isOpenControlled",
            actions: ["setDateValue", "setFocusedDate", "invokeOnClose"]
          },
          {
            target: "focused",
            actions: ["setDateValue", "setFocusedDate", "focusInputElement"]
          }
        ],
        "GOTO.NEXT": [
          {
            guard: "isYearView",
            actions: ["focusNextDecade", "announceVisibleRange"]
          },
          {
            guard: "isMonthView",
            actions: ["focusNextYear", "announceVisibleRange"]
          },
          {
            actions: ["focusNextPage"]
          }
        ],
        "GOTO.PREV": [
          {
            guard: "isYearView",
            actions: ["focusPreviousDecade", "announceVisibleRange"]
          },
          {
            guard: "isMonthView",
            actions: ["focusPreviousYear", "announceVisibleRange"]
          },
          {
            actions: ["focusPreviousPage"]
          }
        ]
      },
      states: {
        idle: {
          tags: "closed",
          on: {
            "CONTROLLED.OPEN": {
              target: "open",
              actions: ["focusFirstSelectedDate", "focusActiveCell"]
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"]
              },
              {
                target: "open",
                actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
              }
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"]
              },
              {
                target: "open",
                actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
              }
            ]
          }
        },
        focused: {
          tags: "closed",
          on: {
            "CONTROLLED.OPEN": {
              target: "open",
              actions: ["focusFirstSelectedDate", "focusActiveCell"]
            },
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"]
              },
              {
                target: "open",
                actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
              }
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"]
              },
              {
                target: "open",
                actions: ["focusFirstSelectedDate", "focusActiveCell", "invokeOnOpen"]
              }
            ]
          }
        },
        open: {
          tags: "open",
          activities: ["trackDismissableElement", "trackPositioning"],
          exit: ["clearHoveredDate", "resetView"],
          on: {
            "CONTROLLED.CLOSE": [
              {
                guard: and("shouldRestoreFocus", "isInteractOutsideEvent"),
                target: "focused",
                actions: ["focusTriggerElement"]
              },
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["focusInputElement"]
              },
              {
                target: "idle"
              }
            ],
            "CELL.CLICK": [
              {
                guard: "isAboveMinView",
                actions: ["setFocusedValueForView", "setPreviousView"]
              },
              {
                guard: and("isRangePicker", "hasSelectedRange"),
                actions: [
                  "setActiveIndexToStart",
                  "clearDateValue",
                  "setFocusedDate",
                  "setSelectedDate",
                  "setActiveIndexToEnd"
                ]
              },
              // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
                actions: [
                  "setFocusedDate",
                  "setSelectedDate",
                  "setActiveIndexToStart",
                  "invokeOnClose",
                  "setRestoreFocus"
                ]
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
                target: "focused",
                actions: [
                  "setFocusedDate",
                  "setSelectedDate",
                  "setActiveIndexToStart",
                  "invokeOnClose",
                  "focusInputElement"
                ]
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToStart", "clearHoveredDate"]
              },
              // ===
              {
                guard: "isRangePicker",
                actions: ["setFocusedDate", "setSelectedDate", "setActiveIndexToEnd"]
              },
              {
                guard: "isMultiPicker",
                actions: ["setFocusedDate", "toggleSelectedDate"]
              },
              // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
              {
                guard: and("closeOnSelect", "isOpenControlled"),
                actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose"]
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["setFocusedDate", "setSelectedDate", "invokeOnClose", "focusInputElement"]
              },
              {
                actions: ["setFocusedDate", "setSelectedDate"]
              }
              // ===
            ],
            "CELL.POINTER_MOVE": {
              guard: and("isRangePicker", "isSelectingEndDate"),
              actions: ["setHoveredDate", "setFocusedDate"]
            },
            "TABLE.POINTER_LEAVE": {
              guard: "isRangePicker",
              actions: ["clearHoveredDate"]
            },
            "TABLE.POINTER_DOWN": {
              actions: ["disableTextSelection"]
            },
            "TABLE.POINTER_UP": {
              actions: ["enableTextSelection"]
            },
            "TABLE.ESCAPE": [
              {
                guard: "isOpenControlled",
                actions: ["focusFirstSelectedDate", "invokeOnClose"]
              },
              {
                target: "focused",
                actions: ["focusFirstSelectedDate", "invokeOnClose", "focusTriggerElement"]
              }
            ],
            "TABLE.ENTER": [
              {
                guard: "isAboveMinView",
                actions: ["setPreviousView"]
              },
              {
                guard: and("isRangePicker", "hasSelectedRange"),
                actions: ["setActiveIndexToStart", "clearDateValue", "setSelectedDate", "setActiveIndexToEnd"]
              },
              // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
                actions: ["setSelectedDate", "setActiveIndexToStart", "invokeOnClose"]
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
                target: "focused",
                actions: ["setSelectedDate", "setActiveIndexToStart", "invokeOnClose", "focusInputElement"]
              },
              {
                guard: and("isRangePicker", "isSelectingEndDate"),
                actions: ["setSelectedDate", "setActiveIndexToStart"]
              },
              // ===
              {
                guard: "isRangePicker",
                actions: ["setSelectedDate", "setActiveIndexToEnd", "focusNextDay"]
              },
              {
                guard: "isMultiPicker",
                actions: ["toggleSelectedDate"]
              },
              // === Grouped transitions (based on `closeOnSelect` and `isOpenControlled`) ===
              {
                guard: and("closeOnSelect", "isOpenControlled"),
                actions: ["selectFocusedDate", "invokeOnClose"]
              },
              {
                guard: "closeOnSelect",
                target: "focused",
                actions: ["selectFocusedDate", "invokeOnClose", "focusInputElement"]
              },
              {
                actions: ["selectFocusedDate"]
              }
              // ===
            ],
            "TABLE.ARROW_RIGHT": [
              {
                guard: "isMonthView",
                actions: "focusNextMonth"
              },
              {
                guard: "isYearView",
                actions: "focusNextYear"
              },
              {
                actions: ["focusNextDay", "setHoveredDate"]
              }
            ],
            "TABLE.ARROW_LEFT": [
              {
                guard: "isMonthView",
                actions: "focusPreviousMonth"
              },
              {
                guard: "isYearView",
                actions: "focusPreviousYear"
              },
              {
                actions: ["focusPreviousDay"]
              }
            ],
            "TABLE.ARROW_UP": [
              {
                guard: "isMonthView",
                actions: "focusPreviousMonthColumn"
              },
              {
                guard: "isYearView",
                actions: "focusPreviousYearColumn"
              },
              {
                actions: ["focusPreviousWeek"]
              }
            ],
            "TABLE.ARROW_DOWN": [
              {
                guard: "isMonthView",
                actions: "focusNextMonthColumn"
              },
              {
                guard: "isYearView",
                actions: "focusNextYearColumn"
              },
              {
                actions: ["focusNextWeek"]
              }
            ],
            "TABLE.PAGE_UP": {
              actions: ["focusPreviousSection"]
            },
            "TABLE.PAGE_DOWN": {
              actions: ["focusNextSection"]
            },
            "TABLE.HOME": [
              {
                guard: "isMonthView",
                actions: ["focusFirstMonth"]
              },
              {
                guard: "isYearView",
                actions: ["focusFirstYear"]
              },
              {
                actions: ["focusSectionStart"]
              }
            ],
            "TABLE.END": [
              {
                guard: "isMonthView",
                actions: ["focusLastMonth"]
              },
              {
                guard: "isYearView",
                actions: ["focusLastYear"]
              },
              {
                actions: ["focusSectionEnd"]
              }
            ],
            "TRIGGER.CLICK": [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"]
              },
              {
                target: "focused",
                actions: ["invokeOnClose"]
              }
            ],
            "VIEW.TOGGLE": {
              actions: ["setNextView"]
            },
            INTERACT_OUTSIDE: [
              {
                guard: "isOpenControlled",
                actions: ["setActiveIndexToStart", "invokeOnClose"]
              },
              {
                guard: "shouldRestoreFocus",
                target: "focused",
                actions: ["setActiveIndexToStart", "invokeOnClose", "focusTriggerElement"]
              },
              {
                target: "idle",
                actions: ["setActiveIndexToStart", "invokeOnClose"]
              }
            ],
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["setActiveIndexToStart", "invokeOnClose"]
              },
              {
                target: "idle",
                actions: ["setActiveIndexToStart", "invokeOnClose"]
              }
            ]
          }
        }
      }
    },
    {
      guards: {
        isAboveMinView: (ctx2) => isAboveMinView(ctx2.view, ctx2.minView),
        isDayView: (ctx2, evt) => (evt.view || ctx2.view) === "day",
        isMonthView: (ctx2, evt) => (evt.view || ctx2.view) === "month",
        isYearView: (ctx2, evt) => (evt.view || ctx2.view) === "year",
        isRangePicker: (ctx2) => ctx2.selectionMode === "range",
        hasSelectedRange: (ctx2) => ctx2.value.length === 2,
        isMultiPicker: (ctx2) => ctx2.selectionMode === "multiple",
        shouldRestoreFocus: (ctx2) => !!ctx2.restoreFocus,
        isSelectingEndDate: (ctx2) => ctx2.activeIndex === 1,
        closeOnSelect: (ctx2) => !!ctx2.closeOnSelect,
        isOpenControlled: (ctx2) => !!ctx2["open.controlled"],
        isInteractOutsideEvent: (_ctx, evt) => evt.previousEvent?.type === "INTERACT_OUTSIDE",
        isInputValueEmpty: (_ctx, evt) => evt.value.trim() === "",
        shouldFixOnBlur: (_ctx, evt) => !!evt.fixOnBlur
      },
      activities: {
        trackPositioning(ctx2) {
          ctx2.currentPlacement || (ctx2.currentPlacement = ctx2.positioning.placement);
          const anchorEl = dom.getControlEl(ctx2);
          const getPositionerEl = () => dom.getPositionerEl(ctx2);
          return popper.getPlacement(anchorEl, getPositionerEl, {
            ...ctx2.positioning,
            defer: true,
            onComplete(data) {
              ctx2.currentPlacement = data.placement;
            }
          });
        },
        setupLiveRegion(ctx2) {
          const doc = dom.getDoc(ctx2);
          ctx2.announcer = liveRegion.createLiveRegion({ level: "assertive", document: doc });
          return () => ctx2.announcer?.destroy?.();
        },
        trackDismissableElement(ctx2, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx2);
          return dismissable.trackDismissableElement(getContentEl, {
            defer: true,
            exclude: [...dom.getInputEls(ctx2), dom.getTriggerEl(ctx2), dom.getClearTriggerEl(ctx2)],
            onInteractOutside(event) {
              ctx2.restoreFocus = !event.detail.focusable;
            },
            onDismiss() {
              send({ type: "INTERACT_OUTSIDE" });
            },
            onEscapeKeyDown(event) {
              event.preventDefault();
              send({ type: "TABLE.ESCAPE", src: "dismissable" });
            }
          });
        }
      },
      actions: {
        setNextView(ctx2) {
          const nextView = getNextView(ctx2.view, ctx2.minView, ctx2.maxView);
          set.view(ctx2, nextView);
        },
        setPreviousView(ctx2) {
          const prevView = getPreviousView(ctx2.view, ctx2.minView, ctx2.maxView);
          set.view(ctx2, prevView);
        },
        setView(ctx2, evt) {
          set.view(ctx2, evt.view);
        },
        setRestoreFocus(ctx2) {
          ctx2.restoreFocus = true;
        },
        announceValueText(ctx2) {
          const announceText = ctx2.value.map((date) => dateUtils.formatSelectedDate(date, null, ctx2.locale, ctx2.timeZone));
          ctx2.announcer?.announce(announceText.join(","), 3e3);
        },
        announceVisibleRange(ctx2) {
          const { formatted } = ctx2.visibleRangeText;
          ctx2.announcer?.announce(formatted);
        },
        disableTextSelection(ctx2) {
          domQuery.disableTextSelection({ target: dom.getContentEl(ctx2), doc: dom.getDoc(ctx2) });
        },
        enableTextSelection(ctx2) {
          domQuery.restoreTextSelection({ doc: dom.getDoc(ctx2), target: dom.getContentEl(ctx2) });
        },
        focusFirstSelectedDate(ctx2) {
          if (!ctx2.value.length) return;
          set.focusedValue(ctx2, ctx2.value[0]);
        },
        syncInputElement(ctx2) {
          domQuery.raf(() => {
            const inputEls = dom.getInputEls(ctx2);
            inputEls.forEach((inputEl, index) => {
              dom.setValue(inputEl, ctx2.valueAsString[index] || "");
            });
          });
        },
        setFocusedDate(ctx2, evt) {
          const value = Array.isArray(evt.value) ? evt.value[0] : evt.value;
          set.focusedValue(ctx2, value);
        },
        setFocusedValueForView(ctx2, evt) {
          set.focusedValue(ctx2, ctx2.focusedValue.set({ [ctx2.view]: evt.value }));
        },
        focusNextMonth(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ months: 1 }));
        },
        focusPreviousMonth(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ months: 1 }));
        },
        setDateValue(ctx2, evt) {
          if (!Array.isArray(evt.value)) return;
          const value = evt.value.map((date) => dateUtils.constrainValue(date, ctx2.min, ctx2.max));
          set.value(ctx2, value);
        },
        clearDateValue(ctx2) {
          set.value(ctx2, []);
        },
        setSelectedDate(ctx2, evt) {
          const values = Array.from(ctx2.value);
          values[ctx2.activeIndex] = normalizeValue(ctx2, evt.value ?? ctx2.focusedValue);
          set.value(ctx2, adjustStartAndEndDate(values));
        },
        toggleSelectedDate(ctx2, evt) {
          const currentValue = normalizeValue(ctx2, evt.value ?? ctx2.focusedValue);
          const index = ctx2.value.findIndex((date) => dateUtils.isDateEqual(date, currentValue));
          if (index === -1) {
            const values = [...ctx2.value, currentValue];
            set.value(ctx2, sortDates(values));
          } else {
            const values = Array.from(ctx2.value);
            values.splice(index, 1);
            set.value(ctx2, sortDates(values));
          }
        },
        setHoveredDate(ctx2, evt) {
          ctx2.hoveredValue = evt.value;
        },
        clearHoveredDate(ctx2) {
          ctx2.hoveredValue = null;
        },
        selectFocusedDate(ctx2) {
          const values = Array.from(ctx2.value);
          values[ctx2.activeIndex] = ctx2.focusedValue.copy();
          set.value(ctx2, adjustStartAndEndDate(values));
          set.inputValue(ctx2, ctx2.activeIndex);
        },
        focusPreviousDay(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ days: 1 }));
        },
        focusNextDay(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ days: 1 }));
        },
        focusPreviousWeek(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ weeks: 1 }));
        },
        focusNextWeek(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ weeks: 1 }));
        },
        focusNextPage(ctx2) {
          const nextPage = dateUtils.getNextPage(
            ctx2.focusedValue,
            ctx2.startValue,
            ctx2.visibleDuration,
            ctx2.locale,
            ctx2.min,
            ctx2.max
          );
          set.adjustedValue(ctx2, nextPage);
        },
        focusPreviousPage(ctx2) {
          const previousPage = dateUtils.getPreviousPage(
            ctx2.focusedValue,
            ctx2.startValue,
            ctx2.visibleDuration,
            ctx2.locale,
            ctx2.min,
            ctx2.max
          );
          set.adjustedValue(ctx2, previousPage);
        },
        focusSectionStart(ctx2) {
          set.focusedValue(ctx2, ctx2.startValue.copy());
        },
        focusSectionEnd(ctx2) {
          set.focusedValue(ctx2, ctx2.endValue.copy());
        },
        focusNextSection(ctx2, evt) {
          const nextSection = dateUtils.getNextSection(
            ctx2.focusedValue,
            ctx2.startValue,
            evt.larger,
            ctx2.visibleDuration,
            ctx2.locale,
            ctx2.min,
            ctx2.max
          );
          if (!nextSection) return;
          set.adjustedValue(ctx2, nextSection);
        },
        focusPreviousSection(ctx2, evt) {
          const previousSection = dateUtils.getPreviousSection(
            ctx2.focusedValue,
            ctx2.startValue,
            evt.larger,
            ctx2.visibleDuration,
            ctx2.locale,
            ctx2.min,
            ctx2.max
          );
          if (!previousSection) return;
          set.adjustedValue(ctx2, previousSection);
        },
        focusNextYear(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ years: 1 }));
        },
        focusPreviousYear(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ years: 1 }));
        },
        focusNextDecade(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ years: 10 }));
        },
        focusPreviousDecade(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ years: 10 }));
        },
        clearFocusedDate(ctx2) {
          set.focusedValue(ctx2, dateUtils.getTodayDate(ctx2.timeZone));
        },
        focusPreviousMonthColumn(ctx2, evt) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ months: evt.columns }));
        },
        focusNextMonthColumn(ctx2, evt) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ months: evt.columns }));
        },
        focusPreviousYearColumn(ctx2, evt) {
          set.focusedValue(ctx2, ctx2.focusedValue.subtract({ years: evt.columns }));
        },
        focusNextYearColumn(ctx2, evt) {
          set.focusedValue(ctx2, ctx2.focusedValue.add({ years: evt.columns }));
        },
        focusFirstMonth(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.set({ month: 0 }));
        },
        focusLastMonth(ctx2) {
          set.focusedValue(ctx2, ctx2.focusedValue.set({ month: 12 }));
        },
        focusFirstYear(ctx2) {
          const range = dateUtils.getDecadeRange(ctx2.focusedValue.year);
          set.focusedValue(ctx2, ctx2.focusedValue.set({ year: range[0] }));
        },
        focusLastYear(ctx2) {
          const range = dateUtils.getDecadeRange(ctx2.focusedValue.year);
          set.focusedValue(ctx2, ctx2.focusedValue.set({ year: range[range.length - 1] }));
        },
        setActiveIndex(ctx2, evt) {
          ctx2.activeIndex = evt.index;
        },
        setActiveIndexToEnd(ctx2) {
          ctx2.activeIndex = 1;
        },
        setActiveIndexToStart(ctx2) {
          ctx2.activeIndex = 0;
        },
        focusActiveCell(ctx2) {
          domQuery.raf(() => {
            dom.getFocusedCell(ctx2)?.focus({ preventScroll: true });
          });
        },
        focusActiveCellIfNeeded(ctx2, evt) {
          if (!evt.focus) return;
          domQuery.raf(() => {
            dom.getFocusedCell(ctx2)?.focus({ preventScroll: true });
          });
        },
        setHoveredValueIfKeyboard(ctx2, evt) {
          if (!evt.type.startsWith("TABLE.ARROW") || ctx2.selectionMode !== "range" || ctx2.activeIndex === 0) return;
          ctx2.hoveredValue = ctx2.focusedValue.copy();
        },
        focusTriggerElement(ctx2) {
          domQuery.raf(() => {
            dom.getTriggerEl(ctx2)?.focus({ preventScroll: true });
          });
        },
        focusFirstInputElement(ctx2) {
          domQuery.raf(() => {
            const [inputEl] = dom.getInputEls(ctx2);
            inputEl?.focus({ preventScroll: true });
          });
        },
        focusInputElement(ctx2) {
          domQuery.raf(() => {
            const inputEls = dom.getInputEls(ctx2);
            const lastIndexWithValue = inputEls.findLastIndex((inputEl2) => inputEl2.value !== "");
            const indexToFocus = Math.max(lastIndexWithValue, 0);
            const inputEl = inputEls[indexToFocus];
            inputEl?.focus({ preventScroll: true });
            inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length);
          });
        },
        syncMonthSelectElement(ctx2) {
          const monthSelectEl = dom.getMonthSelectEl(ctx2);
          dom.setValue(monthSelectEl, ctx2.startValue.month.toString());
        },
        syncYearSelectElement(ctx2) {
          const yearSelectEl = dom.getYearSelectEl(ctx2);
          dom.setValue(yearSelectEl, ctx2.startValue.year.toString());
        },
        setInputValue(ctx2, evt) {
          if (ctx2.activeIndex !== evt.index) return;
          ctx2.inputValue = evt.value;
        },
        syncInputValue(ctx2, evt) {
          queueMicrotask(() => {
            const inputEls = dom.getInputEls(ctx2);
            const idx = evt.index ?? ctx2.activeIndex;
            dom.setValue(inputEls[idx], ctx2.inputValue);
          });
        },
        focusParsedDate(ctx2, evt) {
          if (evt.index == null) return;
          const date = ctx2.parse(evt.value, { locale: ctx2.locale, timeZone: ctx2.timeZone });
          if (!date || !isValidDate(date)) return;
          set.focusedValue(ctx2, date);
        },
        selectParsedDate(ctx2, evt) {
          if (evt.index == null) return;
          let date = ctx2.parse(evt.value, { locale: ctx2.locale, timeZone: ctx2.timeZone });
          if (!date || !isValidDate(date)) {
            if (evt.value) {
              date = ctx2.focusedValue.copy();
            }
          }
          if (!date) return;
          const values = Array.from(ctx2.value);
          values[evt.index] = date;
          set.value(ctx2, values);
          set.inputValue(ctx2, evt.index);
        },
        resetView(ctx2, _evt, { initialContext }) {
          set.view(ctx2, initialContext.view);
        },
        setStartValue(ctx2) {
          const outside = dateUtils.isDateOutsideVisibleRange(ctx2.focusedValue, ctx2.startValue, ctx2.endValue);
          if (!outside) return;
          const startValue = dateUtils.alignDate(ctx2.focusedValue, "start", { months: ctx2.numOfMonths }, ctx2.locale);
          ctx2.startValue = startValue;
        },
        invokeOnOpen(ctx2) {
          ctx2.onOpenChange?.({ open: true });
        },
        invokeOnClose(ctx2) {
          ctx2.onOpenChange?.({ open: false });
        },
        toggleVisibility(ctx2, evt, { send }) {
          send({ type: ctx2.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt });
        }
      },
      compareFns: {
        startValue: dateUtils.isDateEqual,
        endValue: dateUtils.isDateEqual,
        focusedValue: dateUtils.isDateEqual,
        value: isDateEqualFn
      }
    }
  );
}
var invoke = {
  change(ctx) {
    ctx.onValueChange?.({
      value: Array.from(ctx.value),
      valueAsString: Array.from(ctx.valueAsString),
      view: ctx.view
    });
  },
  focusChange(ctx) {
    ctx.onFocusChange?.({
      focusedValue: ctx.focusedValue,
      value: Array.from(ctx.value),
      valueAsString: Array.from(ctx.valueAsString),
      view: ctx.view
    });
  },
  viewChange(ctx) {
    ctx.onViewChange?.({ view: ctx.view });
  }
};
var isDateEqualFn = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((date, index) => dateUtils.isDateEqual(date, b[index]));
};
var normalizeValue = (ctx, value) => {
  let dateValue = typeof value === "number" ? ctx.focusedValue.set({ [ctx.view]: value }) : value;
  eachView((view) => {
    if (isBelowMinView(view, ctx.minView)) {
      dateValue = dateValue.set({ [view]: view === "day" ? 1 : 0 });
    }
  });
  return dateValue;
};
var set = {
  value(ctx, value) {
    if (isDateEqualFn(ctx.value, value)) return;
    ctx.value = value;
    invoke.change(ctx);
  },
  focusedValue(ctx, mixedValue) {
    if (!mixedValue) return;
    const value = normalizeValue(ctx, mixedValue);
    if (dateUtils.isDateEqual(ctx.focusedValue, value)) return;
    const adjustFn = dateUtils.getAdjustedDateFn(ctx.visibleDuration, ctx.locale, ctx.min, ctx.max);
    const adjustedValue = adjustFn({
      focusedDate: value,
      startDate: ctx.startValue
    });
    ctx.startValue = adjustedValue.startDate;
    ctx.focusedValue = adjustedValue.focusedDate;
    invoke.focusChange(ctx);
  },
  adjustedValue(ctx, value) {
    ctx.startValue = value.startDate;
    if (dateUtils.isDateEqual(ctx.focusedValue, value.focusedDate)) return;
    ctx.focusedValue = value.focusedDate;
    invoke.focusChange(ctx);
  },
  view(ctx, value) {
    if (utils.isEqual(ctx.view, value)) return;
    ctx.view = value;
    invoke.viewChange(ctx);
  },
  inputValue(ctx, index) {
    const value = ctx.valueAsString[index];
    if (ctx.inputValue === value) return;
    ctx.inputValue = value;
  }
};
function parse(value) {
  if (Array.isArray(value)) {
    return value.map((v) => parse(v));
  }
  if (value instanceof Date) {
    return new date.CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  return date.parseDate(value);
}
var props = types.createProps()([
  "closeOnSelect",
  "dir",
  "disabled",
  "fixedWeeks",
  "focusedValue",
  "format",
  "parse",
  "placeholder",
  "getRootNode",
  "id",
  "ids",
  "isDateUnavailable",
  "isDateUnavailable",
  "locale",
  "max",
  "min",
  "name",
  "numOfMonths",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "onViewChange",
  "open",
  "open.controlled",
  "positioning",
  "readOnly",
  "selectionMode",
  "startOfWeek",
  "timeZone",
  "translations",
  "value",
  "view",
  "minView",
  "maxView"
]);
var splitProps = utils.createSplitProps(props);
var inputProps = types.createProps()(["index", "fixOnBlur"]);
var splitInputProps = utils.createSplitProps(inputProps);
var presetTriggerProps = types.createProps()(["value"]);
var splitPresetTriggerProps = utils.createSplitProps(presetTriggerProps);
var tableProps = types.createProps()(["columns", "id", "view"]);
var splitTableProps = utils.createSplitProps(tableProps);
var tableCellProps = types.createProps()(["disabled", "value", "columns"]);
var splitTableCellProps = utils.createSplitProps(tableCellProps);
var viewProps = types.createProps()(["view"]);
var splitViewProps = utils.createSplitProps(viewProps);

exports.anatomy = anatomy;
exports.connect = connect;
exports.inputProps = inputProps;
exports.machine = machine;
exports.parse = parse;
exports.presetTriggerProps = presetTriggerProps;
exports.props = props;
exports.splitInputProps = splitInputProps;
exports.splitPresetTriggerProps = splitPresetTriggerProps;
exports.splitProps = splitProps;
exports.splitTableCellProps = splitTableCellProps;
exports.splitTableProps = splitTableProps;
exports.splitViewProps = splitViewProps;
exports.tableCellProps = tableCellProps;
exports.tableProps = tableProps;
exports.viewProps = viewProps;
