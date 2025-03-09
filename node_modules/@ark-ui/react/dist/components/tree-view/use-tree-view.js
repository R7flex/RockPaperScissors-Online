'use client';
import { useMachine, normalizeProps } from '@zag-js/react';
import * as treeView from '@zag-js/tree-view';
import { useId, useEffect } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';
import { useEvent } from '../../utils/use-event.js';

const useTreeView = (props) => {
  const { collection, ...treeViewProps } = props;
  const locale = useLocaleContext();
  const environment = useEnvironmentContext();
  const initialContext = {
    id: useId(),
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
      onFocusChange: useEvent(props.onFocusChange),
      onExpandedChange: useEvent(props.onExpandedChange, { sync: true }),
      onSelectionChange: useEvent(props.onSelectionChange, { sync: true })
    };
  })();
  const [state, send, service] = useMachine(treeView.machine(initialContext), {
    context
  });
  useEffect(() => {
    service.setContext({ collection });
  }, [collection]);
  return treeView.connect(state, send, normalizeProps);
};

export { useTreeView };
