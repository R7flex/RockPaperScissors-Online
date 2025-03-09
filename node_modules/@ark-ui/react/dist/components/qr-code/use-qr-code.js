'use client';
import * as qrcode from '@zag-js/qr-code';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';
import { useEvent } from '../../utils/use-event.js';

const useQrCode = (props = {}) => {
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const initialContext = {
    id: useId(),
    dir,
    value: props.defaultValue,
    getRootNode,
    onValueChange: useEvent(props.onValueChange, { sync: true }),
    ...props
  };
  const context = {
    ...initialContext,
    value: props.value,
    onValueChange: useEvent(props.onValueChange, { sync: true })
  };
  const [state, send] = useMachine(qrcode.machine(initialContext), { context });
  return qrcode.connect(state, send, normalizeProps);
};

export { useQrCode };
