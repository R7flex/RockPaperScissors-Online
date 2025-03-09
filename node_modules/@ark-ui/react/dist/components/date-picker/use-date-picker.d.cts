import { PropTypes } from '@zag-js/react';
import { Optional } from '../../types';
import * as datePicker from '@zag-js/date-picker';
export interface UseDatePickerProps extends Optional<Omit<datePicker.Context, 'dir' | 'getRootNode' | 'open.controlled'>, 'id'> {
    /**
     * The initial open state of the date picker when it is first rendered.
     */
    defaultOpen?: datePicker.Context['open'];
    /**
     * The initial value of the date picker when it is first rendered.
     */
    defaultValue?: datePicker.Context['value'];
    /**
     * The initial view of the date picker when it is first rendered.
     */
    defaultView?: datePicker.Context['view'];
}
export interface UseDatePickerReturn extends datePicker.Api<PropTypes> {
}
export declare const useDatePicker: (props?: UseDatePickerProps) => UseDatePickerReturn;
