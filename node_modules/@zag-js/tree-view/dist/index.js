'use strict';

var anatomy$1 = require('@zag-js/anatomy');
var collection$1 = require('@zag-js/collection');
var core = require('@zag-js/core');
var domQuery = require('@zag-js/dom-query');
var utils = require('@zag-js/utils');
var types = require('@zag-js/types');

// src/tree-view.anatomy.ts
var anatomy = anatomy$1.createAnatomy("tree-view").parts(
  "root",
  "label",
  "tree",
  "item",
  "itemIndicator",
  "itemText",
  "branch",
  "branchControl",
  "branchTrigger",
  "branchContent",
  "branchText",
  "branchIndicator",
  "branchIndentGuide"
);
var parts = anatomy.build();
var collection = (options) => {
  return core.ref(new collection$1.TreeCollection(options));
};
collection.empty = () => {
  return core.ref(new collection$1.TreeCollection({ rootNode: { children: [] } }));
};
function filePathCollection(paths) {
  return core.ref(collection$1.filePathToTree(paths));
}

// src/tree-view.utils.ts
function skipFn(ctx) {
  return function skip({ indexPath }) {
    const paths = ctx.collection.getValuePath(indexPath).slice(0, -1);
    return paths.some((value) => !ctx.expandedValue.includes(value));
  };
}
function getVisibleNodes(ctx) {
  const nodes = [];
  ctx.collection.visit({
    skip: skipFn(ctx),
    onEnter: (node, indexPath) => {
      nodes.push({ node, indexPath });
    }
  });
  return nodes;
}

// src/tree-view.dom.ts
var dom = domQuery.createScope({
  getRootId: (ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`,
  getLabelId: (ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`,
  getNodeId: (ctx, value) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`,
  getTreeId: (ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`,
  getTreeEl: (ctx) => dom.getById(ctx, dom.getTreeId(ctx)),
  focusNode: (ctx, value) => {
    if (value == null) return;
    const nodeId = dom.getNodeId(ctx, value);
    dom.getById(ctx, nodeId)?.focus({ preventScroll: true });
  },
  getMatchingNode(ctx, key) {
    const nodes = getVisibleNodes(ctx);
    const elements = nodes.map(({ node }) => ({
      textContent: ctx.collection.stringifyNode(node),
      id: ctx.collection.getNodeValue(node)
    }));
    return domQuery.getByTypeahead(elements, {
      state: ctx.typeaheadState,
      key,
      activeId: ctx.focusedValue
    });
  }
});

// src/tree-view.connect.ts
function connect(state, send, normalize) {
  const collection2 = state.context.collection;
  const expandedValue = Array.from(state.context.expandedValue);
  const selectedValue = Array.from(state.context.selectedValue);
  const isTypingAhead = state.context.isTypingAhead;
  const focusedValue = state.context.focusedValue;
  function getNodeState(props2) {
    const { node, indexPath } = props2;
    const value = collection2.getNodeValue(node);
    return {
      value,
      valuePath: collection2.getValuePath(indexPath),
      disabled: Boolean(node.disabled),
      focused: focusedValue == null ? utils.isEqual(indexPath, [0]) : focusedValue === value,
      selected: selectedValue.includes(value),
      expanded: expandedValue.includes(value),
      depth: indexPath.length,
      isBranch: collection2.isBranchNode(node)
    };
  }
  return {
    collection: collection2,
    expandedValue,
    selectedValue,
    expand(value) {
      if (!value) return send({ type: "EXPANDED.ALL" });
      const _expandedValue = utils.uniq(expandedValue.concat(...value));
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "expand" });
    },
    collapse(value) {
      if (!value) return send({ type: "EXPANDED.SET", value: [], src: "collapseAll" });
      const _expandedValue = utils.uniq(utils.remove(expandedValue, ...value));
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "collapse" });
    },
    deselect(value) {
      if (!value) return send({ type: "SELECTED.SET", value: [], src: "deselectAll" });
      const _selectedValue = utils.uniq(utils.remove(selectedValue, ...value));
      send({ type: "SELECTED.SET", value: _selectedValue, src: "deselect" });
    },
    select(value) {
      if (!value) return send({ type: "SELECTED.ALL" });
      const nextValue = [];
      if (state.context.selectionMode === "single") {
        if (value.length > 0) nextValue.push(value[value.length - 1]);
      } else {
        nextValue.push(...selectedValue, ...value);
      }
      send({ type: "SELECTED.SET", value: nextValue, src: "select" });
    },
    getVisibleNodes() {
      return getVisibleNodes(state.context);
    },
    focus(value) {
      dom.focusNode(state.context, value);
    },
    selectParent(value) {
      const parentNode = collection2.getParentNode(value);
      if (!parentNode) return;
      const _selectedValue = utils.add(selectedValue, collection2.getNodeValue(parentNode));
      send({ type: "SELECTED.SET", value: _selectedValue, src: "select.parent" });
    },
    expandParent(value) {
      const parentNode = collection2.getParentNode(value);
      if (!parentNode) return;
      const _expandedValue = utils.add(expandedValue, collection2.getNodeValue(parentNode));
      send({ type: "EXPANDED.SET", value: _expandedValue, src: "expand.parent" });
    },
    setExpandedValue(value) {
      const _expandedValue = utils.uniq(value);
      send({ type: "EXPANDED.SET", value: _expandedValue });
    },
    setSelectedValue(value) {
      const _selectedValue = utils.uniq(value);
      send({ type: "SELECTED.SET", value: _selectedValue });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        dir: state.context.dir
      });
    },
    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        id: dom.getLabelId(state.context),
        dir: state.context.dir
      });
    },
    getTreeProps() {
      return normalize.element({
        ...parts.tree.attrs,
        id: dom.getTreeId(state.context),
        dir: state.context.dir,
        role: "tree",
        "aria-label": "Tree View",
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-multiselectable": state.context.selectionMode === "multiple" || void 0,
        tabIndex: -1,
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (domQuery.isComposingEvent(event)) return;
          const target = domQuery.getEventTarget(event);
          if (domQuery.isEditableElement(target)) return;
          const node = target?.closest("[data-part=branch-control], [data-part=item]");
          if (!node) return;
          const nodeId = node.dataset.value;
          if (nodeId == null) {
            console.warn(`[zag-js/tree-view] Node id not found for node`, node);
            return;
          }
          const isBranchNode = node.matches("[data-part=branch-control]");
          const keyMap = {
            ArrowDown(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.ARROW_DOWN", id: nodeId, shiftKey: event2.shiftKey });
            },
            ArrowUp(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.ARROW_UP", id: nodeId, shiftKey: event2.shiftKey });
            },
            ArrowLeft(event2) {
              if (domQuery.isModifierKey(event2) || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: isBranchNode ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT", id: nodeId });
            },
            ArrowRight(event2) {
              if (!isBranchNode || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "BRANCH_NODE.ARROW_RIGHT", id: nodeId });
            },
            Home(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.HOME", id: nodeId, shiftKey: event2.shiftKey });
            },
            End(event2) {
              if (domQuery.isModifierKey(event2)) return;
              event2.preventDefault();
              send({ type: "NODE.END", id: nodeId, shiftKey: event2.shiftKey });
            },
            Space(event2) {
              if (node.dataset.disabled) return;
              if (isTypingAhead) {
                send({ type: "TREE.TYPEAHEAD", key: event2.key });
              } else {
                keyMap.Enter?.(event2);
              }
            },
            Enter(event2) {
              if (node.dataset.disabled) return;
              const isLink = target?.closest("a[href]");
              if (!isLink) event2.preventDefault();
              send({ type: isBranchNode ? "BRANCH_NODE.CLICK" : "NODE.CLICK", id: nodeId, src: "keyboard" });
            },
            "*"(event2) {
              if (node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "SIBLINGS.EXPAND", id: nodeId });
            },
            a(event2) {
              if (!event2.metaKey || node.dataset.disabled) return;
              event2.preventDefault();
              send({ type: "SELECTED.ALL", moveFocus: true });
            }
          };
          const key = domQuery.getEventKey(event, state.context);
          const exec = keyMap[key];
          if (exec) {
            exec(event);
            return;
          }
          if (!state.context.typeahead) return;
          const isValidTypeahead = event.key.length === 1 && !domQuery.isModifierKey(event);
          if (!isValidTypeahead) return;
          send({ type: "TREE.TYPEAHEAD", key: event.key, id: nodeId });
          event.preventDefault();
        }
      });
    },
    getNodeState,
    getItemProps(props2) {
      const itemState = getNodeState(props2);
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getNodeId(state.context, itemState.value),
        dir: state.context.dir,
        "data-ownedby": dom.getTreeId(state.context),
        "data-path": props2.indexPath.join("/"),
        "data-value": itemState.value,
        tabIndex: itemState.focused ? 0 : -1,
        "data-focus": domQuery.dataAttr(itemState.focused),
        role: "treeitem",
        "aria-current": itemState.selected ? "true" : void 0,
        "aria-selected": itemState.disabled ? void 0 : itemState.selected,
        "data-selected": domQuery.dataAttr(itemState.selected),
        "aria-disabled": itemState.disabled,
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "aria-level": itemState.depth,
        "data-depth": itemState.depth,
        style: {
          "--depth": itemState.depth
        },
        onFocus(event) {
          event.stopPropagation();
          send({ type: "NODE.FOCUS", id: itemState.value });
        },
        onClick(event) {
          if (itemState.disabled) return;
          const isMetaKey = event.metaKey || event.ctrlKey;
          send({ type: "NODE.CLICK", id: itemState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey });
          event.stopPropagation();
          const isLink = event.currentTarget.matches("a[href]");
          if (!isLink) event.preventDefault();
        }
      });
    },
    getItemTextProps(props2) {
      const itemState = getNodeState(props2);
      return normalize.element({
        ...parts.itemText.attrs,
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-selected": domQuery.dataAttr(itemState.selected),
        "data-focus": domQuery.dataAttr(itemState.focused)
      });
    },
    getItemIndicatorProps(props2) {
      const itemState = getNodeState(props2);
      return normalize.element({
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
        "data-disabled": domQuery.dataAttr(itemState.disabled),
        "data-selected": domQuery.dataAttr(itemState.selected),
        "data-focus": domQuery.dataAttr(itemState.focused),
        hidden: !itemState.selected
      });
    },
    getBranchProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branch.attrs,
        "data-depth": nodeState.depth,
        dir: state.context.dir,
        "data-branch": nodeState.value,
        role: "treeitem",
        "data-ownedby": dom.getTreeId(state.context),
        "data-value": nodeState.value,
        "aria-level": nodeState.depth,
        "aria-selected": nodeState.disabled ? void 0 : nodeState.selected,
        "data-path": props2.indexPath.join("/"),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "aria-expanded": nodeState.expanded,
        "data-state": nodeState.expanded ? "open" : "closed",
        "aria-disabled": nodeState.disabled,
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        style: {
          "--depth": nodeState.depth
        }
      });
    },
    getBranchIndicatorProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchIndicator.attrs,
        "aria-hidden": true,
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "data-focus": domQuery.dataAttr(nodeState.focused)
      });
    },
    getBranchTriggerProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchTrigger.attrs,
        role: "button",
        dir: state.context.dir,
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-value": nodeState.value,
        onClick(event) {
          if (nodeState.disabled) return;
          send({ type: "BRANCH_TOGGLE.CLICK", id: nodeState.value });
          event.stopPropagation();
        }
      });
    },
    getBranchControlProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchControl.attrs,
        role: "button",
        id: dom.getNodeId(state.context, nodeState.value),
        dir: state.context.dir,
        tabIndex: nodeState.focused ? 0 : -1,
        "data-path": props2.indexPath.join("/"),
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-selected": domQuery.dataAttr(nodeState.selected),
        "data-focus": domQuery.dataAttr(nodeState.focused),
        "data-value": nodeState.value,
        "data-depth": nodeState.depth,
        onFocus(event) {
          send({ type: "NODE.FOCUS", id: nodeState.value });
          event.stopPropagation();
        },
        onClick(event) {
          if (nodeState.disabled) return;
          const isMetaKey = event.metaKey || event.ctrlKey;
          send({ type: "BRANCH_NODE.CLICK", id: nodeState.value, shiftKey: event.shiftKey, ctrlKey: isMetaKey });
          event.stopPropagation();
        }
      });
    },
    getBranchTextProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchText.attrs,
        dir: state.context.dir,
        "data-disabled": domQuery.dataAttr(nodeState.disabled),
        "data-state": nodeState.expanded ? "open" : "closed"
      });
    },
    getBranchContentProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchContent.attrs,
        role: "group",
        dir: state.context.dir,
        "data-state": nodeState.expanded ? "open" : "closed",
        "data-depth": nodeState.depth,
        "data-path": props2.indexPath.join("/"),
        "data-value": nodeState.value,
        hidden: !nodeState.expanded
      });
    },
    getBranchIndentGuideProps(props2) {
      const nodeState = getNodeState(props2);
      return normalize.element({
        ...parts.branchIndentGuide.attrs,
        "data-depth": nodeState.depth
      });
    }
  };
}
var { and } = core.guards;
function machine(userContext) {
  const ctx = utils.compact(userContext);
  return core.createMachine(
    {
      id: "tree-view",
      initial: "idle",
      context: {
        expandedValue: [],
        selectedValue: [],
        focusedValue: null,
        expandOnClick: true,
        selectionMode: "single",
        typeahead: true,
        ...ctx,
        collection: ctx.collection ?? collection.empty(),
        typeaheadState: domQuery.getByTypeahead.defaultOptions
      },
      computed: {
        isMultipleSelection: (ctx2) => ctx2.selectionMode === "multiple"
      },
      on: {
        "EXPANDED.SET": {
          actions: ["setExpanded"]
        },
        "SELECTED.SET": {
          actions: ["setSelected"]
        },
        "SELECTED.ALL": [
          {
            guard: and("isMultipleSelection", "moveFocus"),
            actions: ["selectAllNodes", "focusTreeLastNode"]
          },
          {
            guard: "isMultipleSelection",
            actions: ["selectAllNodes"]
          }
        ],
        "EXPANDED.ALL": {
          actions: ["expandAllBranches"]
        }
      },
      states: {
        idle: {
          on: {
            "NODE.FOCUS": {
              actions: ["setFocusedNode"]
            },
            "NODE.ARROW_DOWN": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
              },
              {
                actions: ["focusTreeNextNode"]
              }
            ],
            "NODE.ARROW_UP": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
              },
              {
                actions: ["focusTreePrevNode"]
              }
            ],
            "NODE.ARROW_LEFT": {
              actions: ["focusBranchNode"]
            },
            "BRANCH_NODE.ARROW_LEFT": [
              {
                guard: "isBranchExpanded",
                actions: ["collapseBranch"]
              },
              {
                actions: ["focusBranchNode"]
              }
            ],
            "BRANCH_NODE.ARROW_RIGHT": [
              {
                guard: and("isBranchFocused", "isBranchExpanded"),
                actions: ["focusBranchFirstNode"]
              },
              {
                actions: ["expandBranch"]
              }
            ],
            "SIBLINGS.EXPAND": {
              actions: ["expandSiblingBranches"]
            },
            "NODE.HOME": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
              },
              {
                actions: ["focusTreeFirstNode"]
              }
            ],
            "NODE.END": [
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
              },
              {
                actions: ["focusTreeLastNode"]
              }
            ],
            "NODE.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["toggleNodeSelection"]
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToNode"]
              },
              {
                actions: ["selectNode"]
              }
            ],
            "BRANCH_NODE.CLICK": [
              {
                guard: and("isCtrlKey", "isMultipleSelection"),
                actions: ["toggleNodeSelection"]
              },
              {
                guard: and("isShiftKey", "isMultipleSelection"),
                actions: ["extendSelectionToNode"]
              },
              {
                guard: "openOnClick",
                actions: ["selectNode", "toggleBranchNode"]
              },
              {
                actions: ["selectNode"]
              }
            ],
            "BRANCH_TOGGLE.CLICK": {
              actions: ["toggleBranchNode"]
            },
            "TREE.TYPEAHEAD": {
              actions: ["focusMatchedNode"]
            }
          }
        }
      }
    },
    {
      guards: {
        isBranchFocused: (ctx2, evt) => ctx2.focusedValue === evt.id,
        isBranchExpanded: (ctx2, evt) => ctx2.expandedValue.includes(evt.id),
        isShiftKey: (_ctx, evt) => evt.shiftKey,
        isCtrlKey: (_ctx, evt) => evt.ctrlKey,
        hasSelectedItems: (ctx2) => ctx2.selectedValue.length > 0,
        isMultipleSelection: (ctx2) => ctx2.isMultipleSelection,
        moveFocus: (_ctx, evt) => !!evt.moveFocus,
        openOnClick: (ctx2) => !!ctx2.expandOnClick
      },
      actions: {
        selectNode(ctx2, evt) {
          set.selected(ctx2, [evt.id]);
        },
        setFocusedNode(ctx2, evt) {
          set.focused(ctx2, evt.id);
        },
        clearFocusedNode(ctx2) {
          set.focused(ctx2, null);
        },
        clearSelectedItem(ctx2) {
          set.selected(ctx2, []);
        },
        toggleBranchNode(ctx2, evt) {
          set.expanded(ctx2, utils.addOrRemove(ctx2.expandedValue, evt.id));
        },
        expandBranch(ctx2, evt) {
          set.expanded(ctx2, utils.add(ctx2.expandedValue, evt.id));
        },
        collapseBranch(ctx2, evt) {
          set.expanded(ctx2, utils.remove(ctx2.expandedValue, evt.id));
        },
        setExpanded(ctx2, evt) {
          set.expanded(ctx2, evt.value);
        },
        setSelected(ctx2, evt) {
          set.selected(ctx2, evt.value);
        },
        focusTreeFirstNode(ctx2) {
          const firstNode = ctx2.collection.getFirstNode();
          const firstValue = ctx2.collection.getNodeValue(firstNode);
          dom.focusNode(ctx2, firstValue);
        },
        focusTreeLastNode(ctx2) {
          const lastNode = ctx2.collection.getLastNode();
          const lastValue = ctx2.collection.getNodeValue(lastNode);
          dom.focusNode(ctx2, lastValue);
        },
        focusBranchFirstNode(ctx2, evt) {
          const branchNode = ctx2.collection.findNode(evt.id);
          const firstNode = ctx2.collection.getFirstNode(branchNode);
          const firstValue = ctx2.collection.getNodeValue(firstNode);
          dom.focusNode(ctx2, firstValue);
        },
        focusTreeNextNode(ctx2, evt) {
          let nextNode = ctx2.collection.getNextNode(evt.id, { skip: skipFn(ctx2) });
          nextNode = nextNode ?? ctx2.collection.getFirstNode();
          const nextValue = ctx2.collection.getNodeValue(nextNode);
          dom.focusNode(ctx2, nextValue);
        },
        focusTreePrevNode(ctx2, evt) {
          let prevNode = ctx2.collection.getPreviousNode(evt.id, { skip: skipFn(ctx2) });
          prevNode = prevNode ?? ctx2.collection.getLastNode();
          const prevValue = ctx2.collection.getNodeValue(prevNode);
          dom.focusNode(ctx2, prevValue);
        },
        focusBranchNode(ctx2, evt) {
          const parentNode = ctx2.collection.getParentNode(evt.id);
          const parentValue = parentNode ? ctx2.collection.getNodeValue(parentNode) : void 0;
          dom.focusNode(ctx2, parentValue);
        },
        selectAllNodes(ctx2) {
          set.selected(ctx2, ctx2.collection.getValues());
        },
        focusMatchedNode(ctx2, evt) {
          const node = dom.getMatchingNode(ctx2, evt.key);
          dom.focusNode(ctx2, node?.id);
        },
        toggleNodeSelection(ctx2, evt) {
          const selectedValue = utils.addOrRemove(ctx2.selectedValue, evt.id);
          set.selected(ctx2, selectedValue);
        },
        expandAllBranches(ctx2) {
          const nextValue = ctx2.collection.getBranchValues();
          set.expanded(ctx2, nextValue);
        },
        expandSiblingBranches(ctx2, evt) {
          const indexPath = ctx2.collection.getIndexPath(evt.id);
          if (!indexPath) return;
          const nodes = ctx2.collection.getSiblingNodes(indexPath);
          const values = nodes.map((node) => ctx2.collection.getNodeValue(node));
          set.expanded(ctx2, utils.uniq(values));
        },
        extendSelectionToNode(ctx2, evt) {
          const anchorValue = utils.first(ctx2.selectedValue) || ctx2.collection.getNodeValue(ctx2.collection.getFirstNode());
          const targetValue = evt.id;
          let values = [anchorValue, targetValue];
          let hits = 0;
          const visibleNodes = getVisibleNodes(ctx2);
          visibleNodes.forEach(({ node }) => {
            const nodeValue = ctx2.collection.getNodeValue(node);
            if (hits === 1) values.push(nodeValue);
            if (nodeValue === anchorValue || nodeValue === targetValue) hits++;
          });
          set.selected(ctx2, utils.uniq(values));
        },
        extendSelectionToNextNode(ctx2, evt) {
          const nextNode = ctx2.collection.getNextNode(evt.id, { skip: skipFn(ctx2) });
          if (!nextNode) return;
          const values = new Set(ctx2.selectedValue);
          const nextValue = ctx2.collection.getNodeValue(nextNode);
          if (nextValue == null) return;
          if (values.has(evt.id) && values.has(nextValue)) {
            values.delete(evt.id);
          } else if (!values.has(nextValue)) {
            values.add(nextValue);
          }
          set.selected(ctx2, Array.from(values));
        },
        extendSelectionToPrevNode(ctx2, evt) {
          const prevNode = ctx2.collection.getPreviousNode(evt.id, { skip: skipFn(ctx2) });
          if (!prevNode) return;
          const values = new Set(ctx2.selectedValue);
          const prevValue = ctx2.collection.getNodeValue(prevNode);
          if (prevValue == null) return;
          if (values.has(evt.id) && values.has(prevValue)) {
            values.delete(evt.id);
          } else if (!values.has(prevValue)) {
            values.add(prevValue);
          }
          set.selected(ctx2, Array.from(values));
        },
        extendSelectionToFirstNode(ctx2) {
          const currentSelection = utils.first(ctx2.selectedValue);
          const values = [];
          ctx2.collection.visit({
            skip: skipFn(ctx2),
            onEnter: (node) => {
              const nodeValue = ctx2.collection.getNodeValue(node);
              values.push(nodeValue);
              if (nodeValue === currentSelection) {
                return "stop";
              }
            }
          });
          set.selected(ctx2, values);
        },
        extendSelectionToLastNode(ctx2) {
          const currentSelection = utils.first(ctx2.selectedValue);
          const values = [];
          let current = false;
          ctx2.collection.visit({
            skip: skipFn(ctx2),
            onEnter: (node) => {
              const nodeValue = ctx2.collection.getNodeValue(node);
              if (nodeValue === currentSelection) current = true;
              if (current) values.push(nodeValue);
            }
          });
          set.selected(ctx2, values);
        }
      }
    }
  );
}
var invoke = {
  focusChange(ctx) {
    ctx.onFocusChange?.({ focusedValue: ctx.focusedValue });
  },
  expandedChange(ctx) {
    ctx.onExpandedChange?.({
      expandedValue: Array.from(ctx.expandedValue),
      focusedValue: ctx.focusedValue
    });
  },
  selectionChange(ctx) {
    ctx.onSelectionChange?.({
      selectedValue: Array.from(ctx.selectedValue),
      focusedValue: ctx.focusedValue
    });
  }
};
var set = {
  selected(ctx, value) {
    if (utils.isEqual(ctx.selectedValue, value)) return;
    ctx.selectedValue = value;
    invoke.selectionChange(ctx);
  },
  focused(ctx, value) {
    if (utils.isEqual(ctx.focusedValue, value)) return;
    ctx.focusedValue = value;
    invoke.focusChange(ctx);
  },
  expanded(ctx, value) {
    if (utils.isEqual(ctx.expandedValue, value)) return;
    ctx.expandedValue = value;
    invoke.expandedChange(ctx);
  }
};
var props = types.createProps()([
  "ids",
  "collection",
  "dir",
  "expandedValue",
  "expandOnClick",
  "focusedValue",
  "getRootNode",
  "id",
  "onExpandedChange",
  "onFocusChange",
  "onSelectionChange",
  "selectedValue",
  "selectionMode",
  "typeahead"
]);
var splitProps = utils.createSplitProps(props);
var itemProps = types.createProps()(["node", "indexPath"]);
var splitItemProps = utils.createSplitProps(itemProps);

exports.anatomy = anatomy;
exports.collection = collection;
exports.connect = connect;
exports.filePathCollection = filePathCollection;
exports.itemProps = itemProps;
exports.machine = machine;
exports.props = props;
exports.splitItemProps = splitItemProps;
exports.splitProps = splitProps;
