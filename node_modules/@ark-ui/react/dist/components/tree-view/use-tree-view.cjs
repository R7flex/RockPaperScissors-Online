'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const react$1 = require('@zag-js/react');
const treeView = require('@zag-js/tree-view');
const react = require('react');
const useEnvironmentContext = require('../../providers/environment/use-environment-context.cjs');
const useLocaleContext = require('../../providers/locale/use-locale-context.cjs');
const useEvent = require('../../utils/use-event.cjs');

function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const k in e) {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}

const treeView__namespace = /*#__PURE__*/_interopNamespaceDefault(treeView);

const useTreeView = (props) => {
  const { collection, ...treeViewProps } = props;
  const locale = useLocaleContext.useLocaleContext();
  const environment = useEnvironmentContext.useEnvironmentContext();
  const initialContext = {
    id: react.useId(),
    dir: locale.dir,
    getRootNode: environment.getRootNode,
    selectedValue: props.defaultSelectedValue,
    expandedValue: props.defaultExpandedValue,
    collection,
    ...treeViewProps
  };
  const context = (() => {
    const { collection: _, ...restProps } = initialContext;
    return {
      ...restProps,
      selectedValue: props.selectedValue,
      expandedValue: props.expandedValue,
      onFocusChange: useEvent.useEvent(props.onFocusChange),
      onExpandedChange: useEvent.useEvent(props.onExpandedChange, { sync: true }),
      onSelectionChange: useEvent.useEvent(props.onSelectionChange, { sync: true })
    };
  })();
  const [state, send, service] = react$1.useMachine(treeView__namespace.machine(initialContext), {
    context
  });
  react.useEffect(() => {
    service.setContext({ collection });
  }, [collection]);
  return treeView__namespace.connect(state, send, react$1.normalizeProps);
};

exports.useTreeView = useTreeView;
