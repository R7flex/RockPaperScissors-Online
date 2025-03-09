'use client';
import { useMachine, normalizeProps } from '@zag-js/react';
import * as tour from '@zag-js/tour';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';
import { useEvent } from '../../utils/use-event.js';

const useTour = (props = {}) => {
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const initialContext = {
    id: useId(),
    dir,
    getRootNode,
    ...props
  };
  const context = {
    ...initialContext,
    onStatusChange: useEvent(props.onStatusChange)
  };
  const [state, send] = useMachine(tour.machine(initialContext), { context });
  return tour.connect(state, send, normalizeProps);
};

export { useTour };
