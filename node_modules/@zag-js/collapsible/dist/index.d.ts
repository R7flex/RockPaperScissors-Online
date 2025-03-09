import * as _zag_js_anatomy from '@zag-js/anatomy';
import { RequiredBy, PropTypes, DirectionProperty, CommonProperties, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Machine, StateMachine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "trigger" | "content">;

interface OpenChangeDetails {
    open: boolean;
}
type ElementIds = Partial<{
    root: string;
    content: string;
    trigger: string;
}>;
interface PublicContext extends DirectionProperty, CommonProperties {
    /**
     * The ids of the elements in the collapsible. Useful for composition.
     */
    ids?: ElementIds | undefined;
    /**
     * Function called when the animation ends in the closed state.
     */
    onExitComplete?: (() => void) | undefined;
    /**
     * Function called when the popup is opened
     */
    onOpenChange?: ((details: OpenChangeDetails) => void) | undefined;
    /**
     * Whether the collapsible is open
     */
    open?: boolean | undefined;
    /**
     * Whether the collapsible is disabled
     */
    disabled?: boolean | undefined;
    /**
     *  Whether the collapsible open state is controlled by the user
     */
    "open.controlled"?: boolean | undefined;
}
type ComputedContext = Readonly<{}>;
interface PrivateContext {
}
type UserDefinedContext = RequiredBy<PublicContext, "id">;
interface MachineContext extends PublicContext, PrivateContext, ComputedContext {
}
type MachineState = {
    value: "open" | "closed" | "closing";
};
type State = StateMachine.State<MachineContext, MachineState>;
type Send = StateMachine.Send<StateMachine.AnyEventObject>;
type Service = Machine<MachineContext, MachineState, StateMachine.AnyEventObject>;
interface MachineApi<T extends PropTypes = PropTypes> {
    /**
     * Whether the collapsible is open.
     */
    open: boolean;
    /**
     * Whether the collapsible is visible (open or closing)
     */
    visible: boolean;
    /**
     * Whether the collapsible is disabled
     */
    disabled: boolean;
    /**
     * Function to open or close the collapsible.
     */
    setOpen(open: boolean): void;
    /**
     * Function to measure the size of the content.
     */
    measureSize(): void;
    getRootProps(): T["element"];
    getTriggerProps(): T["button"];
    getContentProps(): T["element"];
}

declare function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T>;

declare function machine(userContext: UserDefinedContext): _zag_js_core.Machine<MachineContext, MachineState, _zag_js_core.StateMachine.AnyEventObject>;

declare const props: ("open" | "disabled" | "dir" | "id" | "getRootNode" | "ids" | "onExitComplete" | "onOpenChange" | "open.controlled")[];
declare const splitProps: <Props extends Partial<UserDefinedContext>>(props: Props) => [Partial<UserDefinedContext>, Omit<Props, "open" | "disabled" | "dir" | "id" | "getRootNode" | "ids" | "onExitComplete" | "onOpenChange" | "open.controlled">];

export { type MachineApi as Api, type UserDefinedContext as Context, type ElementIds, type OpenChangeDetails, type Service, anatomy, connect, machine, props, splitProps };
