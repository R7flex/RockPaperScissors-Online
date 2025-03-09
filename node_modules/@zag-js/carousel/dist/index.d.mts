import * as _zag_js_anatomy from '@zag-js/anatomy';
import { RequiredBy, PropTypes, DirectionProperty, CommonProperties, OrientationProperty, NormalizeProps } from '@zag-js/types';
export { Orientation } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Machine, StateMachine, ContextRef } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "itemGroup" | "item" | "control" | "nextTrigger" | "prevTrigger" | "indicatorGroup" | "indicator" | "autoplayTrigger">;

interface PageChangeDetails {
    page: number;
    pageSnapPoint: number;
}
interface DragStatusDetails {
    type: "dragging.start" | "dragging" | "dragging.end";
    page: number;
    isDragging: boolean;
}
interface AutoplayStatusDetails {
    type: "autoplay.start" | "autoplay" | "autoplay.stop";
    page: number;
    isPlaying: boolean;
}
interface IntlTranslations {
    nextTrigger: string;
    prevTrigger: string;
    indicator: (index: number) => string;
    item: (index: number, count: number) => string;
    autoplayStart: string;
    autoplayStop: string;
}
type ElementIds = Partial<{
    root: string;
    item(index: number): string;
    itemGroup: string;
    nextTrigger: string;
    prevTrigger: string;
    indicatorGroup: string;
    indicator(index: number): string;
}>;
interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
    /**
     * The ids of the elements in the carousel. Useful for composition.
     */
    ids?: ElementIds | undefined;
    /**
     * The localized messages to use.
     */
    translations: IntlTranslations;
    /**
     * The number of slides to show at a time.
     * @default 1
     */
    slidesPerPage: number;
    /**
     * The number of slides to scroll at a time.
     *
     * When set to `auto`, the number of slides to scroll is determined by the
     * `slidesPerPage` property.
     *
     * @default "auto"
     */
    slidesPerMove: number | "auto";
    /**
     * Whether to scroll automatically. The default delay is 4000ms.
     * @default false
     */
    autoplay?: boolean | {
        delay: number;
    } | undefined;
    /**
     * Whether to allow scrolling via dragging with mouse
     * @default false
     */
    allowMouseDrag: boolean;
    /**
     * Whether the carousel should loop around.
     * @default false
     */
    loop: boolean;
    /**
     * The index of the active page.
     */
    page: number;
    /**
     * The amount of space between items.
     * @default "0px"
     */
    spacing: string;
    /**
     * Defines the extra space added around the scrollable area,
     * enabling nearby items to remain partially in view.
     */
    padding?: string;
    /**
     * Function called when the page changes.
     */
    onPageChange?: ((details: PageChangeDetails) => void) | undefined;
    /**
     * The threshold for determining if an item is in view.
     * @default 0.6
     */
    inViewThreshold: number | number[];
    /**
     * The snap type of the item.
     * @default "mandatory"
     */
    snapType: "proximity" | "mandatory";
    /**
     * The total number of slides.
     * Useful for SSR to render the initial ating the snap points.
     */
    slideCount?: number | undefined;
    /**
     * Function called when the drag status changes.
     */
    onDragStatusChange?: ((details: DragStatusDetails) => void) | undefined;
    /**
     * Function called when the autoplay status changes.
     */
    onAutoplayStatusChange?: ((details: AutoplayStatusDetails) => void) | undefined;
}
interface PrivateContext {
    pageSnapPoints: number[];
    slidesInView: number[];
    timeoutRef: ContextRef<ReturnType<typeof setTimeout>>;
}
type ComputedContext = Readonly<{
    isRtl: boolean;
    isHorizontal: boolean;
    canScrollNext: boolean;
    canScrollPrev: boolean;
    autoplayInterval: number;
}>;
type UserDefinedContext = RequiredBy<PublicContext, "id">;
interface MachineContext extends PublicContext, PrivateContext, ComputedContext {
}
interface MachineState {
    value: "idle" | "dragging" | "autoplay";
}
type State = StateMachine.State<MachineContext, MachineState>;
type Send = StateMachine.Send<StateMachine.AnyEventObject>;
type Service = Machine<MachineContext, MachineState, StateMachine.AnyEventObject>;
interface ItemProps {
    /**
     * The index of the item.
     */
    index: number;
    /**
     * The snap alignment of the item.
     * @default "start"
     */
    snapAlign?: "start" | "end" | "center" | undefined;
}
interface IndicatorProps {
    /**
     * The index of the indicator.
     */
    index: number;
    /**
     * Whether the indicator is read only.
     * @default false
     */
    readOnly?: boolean | undefined;
}
interface MachineApi<T extends PropTypes = PropTypes> {
    /**
     * The current index of the carousel
     */
    page: number;
    /**
     * The current snap points of the carousel
     */
    pageSnapPoints: number[];
    /**
     * Whether the carousel is auto playing
     */
    isPlaying: boolean;
    /**
     * Whether the carousel is being dragged. This only works when `draggable` is true.
     */
    isDragging: boolean;
    /**
     * Whether the carousel is can scroll to the next view
     */
    canScrollNext: boolean;
    /**
     * Whether the carousel is can scroll to the previous view
     */
    canScrollPrev: boolean;
    /**
     * Function to scroll to a specific item index
     */
    scrollToIndex(index: number, instant?: boolean): void;
    /**
     * Function to scroll to a specific page
     */
    scrollTo(page: number, instant?: boolean): void;
    /**
     * Function to scroll to the next page
     */
    scrollNext(instant?: boolean): void;
    /**
     * Function to scroll to the previous page
     */
    scrollPrev(instant?: boolean): void;
    /**
     * Returns the current scroll progress as a percentage
     */
    getProgress(): number;
    /**
     * Function to start/resume autoplay
     */
    play(): void;
    /**
     * Function to pause autoplay
     */
    pause(): void;
    /**
     * Whether the item is in view
     */
    isInView(index: number): boolean;
    /**
     * Function to re-compute the snap points
     * and clamp the page
     */
    refresh(): void;
    getRootProps(): T["element"];
    getControlProps(): T["element"];
    getItemGroupProps(): T["element"];
    getItemProps(props: ItemProps): T["element"];
    getPrevTriggerProps(): T["button"];
    getNextTriggerProps(): T["button"];
    getAutoplayTriggerProps(): T["button"];
    getIndicatorGroupProps(): T["element"];
    getIndicatorProps(props: IndicatorProps): T["button"];
}

declare function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T>;

declare function machine(userContext: UserDefinedContext): _zag_js_core.Machine<MachineContext, MachineState, _zag_js_core.StateMachine.AnyEventObject>;

declare const props: ("page" | "padding" | "dir" | "id" | "loop" | "orientation" | "spacing" | "getRootNode" | "autoplay" | "ids" | "translations" | "slidesPerPage" | "slidesPerMove" | "allowMouseDrag" | "onPageChange" | "inViewThreshold" | "snapType" | "slideCount" | "onDragStatusChange" | "onAutoplayStatusChange")[];
declare const splitProps: <Props extends Partial<UserDefinedContext>>(props: Props) => [Partial<UserDefinedContext>, Omit<Props, "page" | "padding" | "dir" | "id" | "loop" | "orientation" | "spacing" | "getRootNode" | "autoplay" | "ids" | "translations" | "slidesPerPage" | "slidesPerMove" | "allowMouseDrag" | "onPageChange" | "inViewThreshold" | "snapType" | "slideCount" | "onDragStatusChange" | "onAutoplayStatusChange">];
declare const indicatorProps: (keyof IndicatorProps)[];
declare const splitIndicatorProps: <Props extends IndicatorProps>(props: Props) => [IndicatorProps, Omit<Props, keyof IndicatorProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { type MachineApi as Api, type AutoplayStatusDetails, type UserDefinedContext as Context, type DragStatusDetails, type ElementIds, type IndicatorProps, type IntlTranslations, type ItemProps, type PageChangeDetails, type Service, anatomy, connect, indicatorProps, itemProps, machine, props, splitIndicatorProps, splitItemProps, splitProps };
