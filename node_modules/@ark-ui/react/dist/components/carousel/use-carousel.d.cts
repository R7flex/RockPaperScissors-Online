import { PropTypes } from '@zag-js/react';
import { Optional } from '../../types';
import * as carousel from '@zag-js/carousel';
export interface UseCarouselProps extends Optional<Omit<carousel.Context, 'dir' | 'getRootNode'>, 'id'> {
    /**
     * The initial page of the carousel when it is first rendered.
     * Use this when you do not need to control the state of the carousel.
     */
    defaultPage?: carousel.Context['page'];
}
export interface UseCarouselReturn extends carousel.Api<PropTypes> {
}
export declare const useCarousel: (props?: UseCarouselProps) => UseCarouselReturn;
