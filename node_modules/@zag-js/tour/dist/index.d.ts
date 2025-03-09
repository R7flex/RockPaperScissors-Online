import { InteractOutsideHandlers } from '@zag-js/dismissable';
export { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from '@zag-js/dismissable';
import * as _zag_js_anatomy from '@zag-js/anatomy';
import { RequiredBy, PropTypes, DirectionProperty, CommonProperties, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Machine, StateMachine } from '@zag-js/core';
import { Placement } from '@zag-js/popper';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"content" | "title" | "actionTrigger" | "closeTrigger" | "progressText" | "description" | "positioner" | "arrow" | "arrowTip" | "backdrop" | "spotlight">;

interface Point {
    x: number;
    y: number;
}

interface StepEffectArgs {
    next(): void;
    goto(id: string): void;
    dismiss(): void;
    show(): void;
    update(data: Partial<StepBaseDetails>): void;
    target?: (() => HTMLElement | null) | undefined;
}
type StepType = "tooltip" | "dialog" | "wait" | "floating";
type StepActionType = "next" | "prev" | "dismiss";
type StepActionFn = (actionMap: StepActionMap) => void;
type StepPlacement = Placement | "center";
interface StepAction {
    /**
     * The label of the action
     */
    label: string;
    /**
     * The action to perform
     */
    action?: StepActionType | StepActionFn | undefined;
    /**
     * The attributes to apply to the action trigger
     */
    attrs?: Record<string, any> | undefined;
}
interface StepBaseDetails {
    /**
     * The type of the step. If no target is provided,
     * the step will be treated as a modal step.
     */
    type?: StepType | undefined;
    /**
     * Function to return the target element to highlight
     */
    target?(): HTMLElement | null;
    /**
     * The title of the step
     */
    title: any;
    /**
     * The description of the step
     */
    description: any;
    /**
     * The placement of the step
     */
    placement?: StepPlacement | undefined;
    /**
     * The offset between the content and the target
     */
    offset?: {
        mainAxis?: number;
        crossAxis?: number;
    } | undefined;
    /**
     * Additional metadata of the step
     */
    meta?: Record<string, any> | undefined;
    /**
     * Whether to show a backdrop behind the step
     */
    backdrop?: boolean | undefined;
    /**
     * Whether to show an arrow tip on the step
     */
    arrow?: boolean | undefined;
    /**
     * The actions to perform when the step is completed
     */
    actions?: StepAction[] | undefined;
}
interface StepDetails extends StepBaseDetails {
    /**
     * The unique identifier of the step
     */
    id: string;
    /**
     * The effect to run before the step is shown
     */
    effect?(args: StepEffectArgs): VoidFunction;
}
interface StepChangeDetails {
    stepId: string | null;
    stepIndex: number;
    totalSteps: number;
    complete: boolean;
    progress: number;
}
type StepStatus = "idle" | "started" | "skipped" | "completed" | "dismissed" | "not-found";
interface StepActionMap {
    next(): void;
    prev(): void;
    dismiss(): void;
    goto(id: string): void;
}
interface StatusChangeDetails {
    status: StepStatus;
    stepId: string | null;
    stepIndex: number;
}
interface ProgressTextDetails {
    current: number;
    total: number;
}
interface IntlTranslations {
    progressText?(details: ProgressTextDetails): string;
    nextStep?: string | undefined;
    prevStep?: string | undefined;
    close?: string | undefined;
    skip?: string | undefined;
}
type ElementIds = Partial<{
    content: string;
    title: string;
    description: string;
    positioner: string;
    backdrop: string;
    arrow: string;
}>;
interface PublicContext extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
    /**
     * The ids of the elements in the tour. Useful for composition.
     */
    ids?: ElementIds | undefined;
    /**
     * The steps of the tour
     */
    steps: StepDetails[];
    /**
     * The id of the currently highlighted step
     */
    stepId: string | null;
    /**
     * Callback when the highlighted step changes
     */
    onStepChange?(details: StepChangeDetails): void;
    /**
     * Callback when the tour is opened or closed
     */
    onStatusChange?(details: StatusChangeDetails): void;
    /**
     * Whether to close the tour when the user clicks outside the tour
     * @default true
     */
    closeOnInteractOutside: boolean;
    /**
     * Whether to close the tour when the user presses the escape key
     * @default true
     */
    closeOnEscape: boolean;
    /**
     * Whether to allow keyboard navigation (right/left arrow keys to navigate between steps)
     * @default true
     */
    keyboardNavigation: boolean;
    /**
     * Prevents interaction with the rest of the page while the tour is open
     * @default false
     */
    preventInteraction: boolean;
    /**
     * The offsets to apply to the spotlight
     * @default "{ x: 10, y: 10 }"
     */
    spotlightOffset: Point;
    /**
     * The radius of the spotlight clip path
     * @default 4
     */
    spotlightRadius: number;
    /**
     * The translations for the tour
     */
    translations: IntlTranslations;
}
interface PrivateContext {
}
type ComputedContext = Readonly<{
    /**
     * The current step details
     */
    step: StepDetails | null;
    /**
     * The index of the current step
     */
    stepIndex: number;
    /**
     * Whether there is a next step
     */
    hasNextStep: boolean;
    /**
     * Whether there is a previous step
     */
    hasPrevStep: boolean;
    /**
     * Whether the current step is the first step
     */
    isFirstStep: boolean;
    /**
     * Whether the current step is the last step
     */
    isLastStep: boolean;
}>;
type UserDefinedContext = RequiredBy<PublicContext, "id">;
interface MachineContext extends PublicContext, PrivateContext, ComputedContext {
}
interface MachineState {
    tags: "closed" | "open";
    value: "tour.inactive" | "tour.active" | "step.waiting" | "target.resolving" | "target.scrolling";
}
type State = StateMachine.State<MachineContext, MachineState>;
type Send = StateMachine.Send<StateMachine.AnyEventObject>;
type Service = Machine<MachineContext, MachineState, StateMachine.AnyEventObject>;
interface StepActionTriggerProps {
    action: StepAction;
}
interface MachineApi<T extends PropTypes = PropTypes> {
    /**
     * Whether the tour is open
     */
    open: boolean;
    /**
     * The total number of steps
     */
    totalSteps: number;
    /**
     * The index of the current step
     */
    stepIndex: number;
    /**
     * The current step details
     */
    step: StepDetails | null;
    /**
     * Whether there is a next step
     */
    hasNextStep: boolean;
    /**
     * Whether there is a previous step
     */
    hasPrevStep: boolean;
    /**
     * Whether the current step is the first step
     */
    firstStep: boolean;
    /**
     * Whether the current step is the last step
     */
    lastStep: boolean;
    /**
     * Add a new step to the tour
     */
    addStep(step: StepDetails): void;
    /**
     * Remove a step from the tour
     */
    removeStep(id: string): void;
    /**
     * Update a step in the tour with partial details
     */
    updateStep(id: string, stepOverrides: Partial<StepDetails>): void;
    /**
     * Set the steps of the tour
     */
    setSteps(steps: StepDetails[]): void;
    /**
     * Set the current step of the tour
     */
    setStep(id: string): void;
    /**
     * Start the tour at a specific step (or the first step if not provided)
     */
    start(id?: string): void;
    /**
     * Check if a step is valid
     */
    isValidStep(id: string): boolean;
    /**
     * Check if a step is visible
     */
    isCurrentStep(id: string): boolean;
    /**
     * Move to the next step
     */
    next(): void;
    /**
     * Move to the previous step
     */
    prev(): void;
    /**
     * Returns the progress text
     */
    getProgressText(): string;
    /**
     * Returns the progress percent
     */
    getProgressPercent(): number;
    getBackdropProps(): T["element"];
    getSpotlightProps(): T["element"];
    getProgressTextProps(): T["element"];
    getPositionerProps(): T["element"];
    getArrowProps(): T["element"];
    getArrowTipProps(): T["element"];
    getContentProps(): T["element"];
    getTitleProps(): T["element"];
    getDescriptionProps(): T["element"];
    getCloseTriggerProps(): T["button"];
    getActionTriggerProps(props: StepActionTriggerProps): T["button"];
}

declare function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T>;

declare function machine(userContext: UserDefinedContext): _zag_js_core.Machine<MachineContext, MachineState, _zag_js_core.StateMachine.AnyEventObject>;

declare const props: ("dir" | "id" | "getRootNode" | "onFocusOutside" | "onPointerDownOutside" | "onInteractOutside" | "ids" | "steps" | "stepId" | "onStepChange" | "onStatusChange" | "closeOnInteractOutside" | "closeOnEscape" | "keyboardNavigation" | "preventInteraction" | "spotlightOffset" | "spotlightRadius" | "translations")[];
declare const splitProps: <Props extends Partial<UserDefinedContext>>(props: Props) => [Partial<UserDefinedContext>, Omit<Props, "dir" | "id" | "getRootNode" | "onFocusOutside" | "onPointerDownOutside" | "onInteractOutside" | "ids" | "steps" | "stepId" | "onStepChange" | "onStatusChange" | "closeOnInteractOutside" | "closeOnEscape" | "keyboardNavigation" | "preventInteraction" | "spotlightOffset" | "spotlightRadius" | "translations">];

interface WaitOptions {
    timeout: number;
    rootNode?: Document | ShadowRoot | undefined;
}
type WaitForPromiseReturn<T> = [Promise<T>, () => void];
declare function waitForElement(target: () => HTMLElement, options: WaitOptions): WaitForPromiseReturn<HTMLElement>;
type EditableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
declare function waitForElementValue(target: () => EditableElement | null, value: string, options: WaitOptions): WaitForPromiseReturn<void>;

export { type MachineApi as Api, type UserDefinedContext as Context, type ElementIds, type IntlTranslations, type Point, type ProgressTextDetails, type Service, type StatusChangeDetails, type StepAction, type StepActionMap, type StepActionTriggerProps, type StepBaseDetails, type StepChangeDetails, type StepDetails, type StepEffectArgs, type StepPlacement, type StepStatus, type StepType, type WaitOptions, anatomy, connect, machine, props, splitProps, waitForElement, waitForElementValue };
