import { PropTypes } from '@zag-js/react';
import { Optional } from '../../types';
import * as qrcode from '@zag-js/qr-code';
export interface UseQrCodeProps extends Optional<Omit<qrcode.Context, 'dir' | 'getRootNode'>, 'id'> {
    /**
     * The initial value of the qr code when it is first rendered.
     * Use when you do not need to control the state of the qr code.
     */
    defaultValue?: qrcode.Context['value'];
}
export interface UseQrCodeReturn extends qrcode.Api<PropTypes> {
}
export declare const useQrCode: (props?: UseQrCodeProps) => UseQrCodeReturn;
