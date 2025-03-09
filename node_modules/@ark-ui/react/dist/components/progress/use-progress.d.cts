import { PropTypes } from '@zag-js/react';
import { Optional } from '../../types';
import * as progress from '@zag-js/progress';
export interface UseProgressProps extends Optional<Omit<progress.Context, 'dir' | 'getRootNode'>, 'id'> {
    /**
     * The initial value of the progress when it is first rendered.
     * Use when you do not need to control the state of the progress.
     */
    defaultValue?: progress.Context['value'];
}
export interface UseProgressReturn extends progress.Api<PropTypes> {
}
export declare const useProgress: (props?: UseProgressProps) => UseProgressReturn;
