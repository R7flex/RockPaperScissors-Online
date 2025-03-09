import * as _zag_js_anatomy from '@zag-js/anatomy';
import { TreeCollectionOptions, TreeCollection, FilePathTreeNode, TreeNode } from '@zag-js/collection';
export { TreeNode } from '@zag-js/collection';
import { RequiredBy, PropTypes, DirectionProperty, CommonProperties, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Machine, StateMachine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "label" | "tree" | "item" | "itemIndicator" | "itemText" | "branch" | "branchControl" | "branchTrigger" | "branchContent" | "branchText" | "branchIndicator" | "branchIndentGuide">;

declare const collection: {
    <T>(options: TreeCollectionOptions<T>): TreeCollection<T>;
    empty(): TreeCollection;
};
declare function filePathCollection(paths: string[]): TreeCollection<FilePathTreeNode>;

interface FocusChangeDetails {
    focusedValue: string | null;
}
interface ExpandedChangeDetails extends FocusChangeDetails {
    expandedValue: string[];
}
interface SelectionChangeDetails extends FocusChangeDetails {
    selectedValue: string[];
}
type ElementIds = Partial<{
    root: string;
    tree: string;
    label: string;
    node(value: string): string;
}>;
interface PublicContext<T = any> extends DirectionProperty, CommonProperties {
    /**
     * The tree collection data
     */
    collection: TreeCollection<T>;
    /**
     * The ids of the tree elements. Useful for composition.
     */
    ids?: ElementIds | undefined;
    /**
     * The id of the expanded nodes
     */
    expandedValue: string[];
    /**
     * The id of the selected nodes
     */
    selectedValue: string[];
    /**
     * The id of the focused node
     */
    focusedValue: string | null;
    /**
     * Whether the tree supports multiple selection
     * - "single": only one node can be selected
     * - "multiple": multiple nodes can be selected
     *
     * @default "single"
     */
    selectionMode: "single" | "multiple";
    /**
     * Called when the tree is opened or closed
     */
    onExpandedChange?: ((details: ExpandedChangeDetails) => void) | undefined;
    /**
     * Called when the selection changes
     */
    onSelectionChange?: ((details: SelectionChangeDetails) => void) | undefined;
    /**
     * Called when the focused node changes
     */
    onFocusChange?: ((details: FocusChangeDetails) => void) | undefined;
    /**
     * Whether clicking on a branch should open it or not
     * @default true
     */
    expandOnClick?: boolean | undefined;
    /**
     * Whether the tree supports typeahead search
     * @default true
     */
    typeahead?: boolean | undefined;
}
interface PrivateContext {
}
type ComputedContext = Readonly<{
    /**
     * @computed
     * Whether a typeahead search is ongoing
     */
    isTypingAhead: boolean;
    /**
     * @computed
     * Whether the tree supports multiple selection
     */
    isMultipleSelection: boolean;
}>;
type UserDefinedContext = RequiredBy<PublicContext, "id" | "collection">;
interface MachineContext<T = any> extends PublicContext<T>, PrivateContext, ComputedContext {
}
interface MachineState {
    value: "idle";
}
type State = StateMachine.State<MachineContext, MachineState>;
type Send = StateMachine.Send<StateMachine.AnyEventObject>;
type Service = Machine<MachineContext, MachineState, StateMachine.AnyEventObject>;
interface NodeProps {
    /**
     * The tree node
     */
    node: TreeNode;
    /**
     * The index path of the tree node
     */
    indexPath: number[];
}
interface NodeState {
    /**
     * The value of the tree item
     */
    value: string;
    /**
     * The value path of the tree item
     */
    valuePath: string[];
    /**
     * Whether the tree item is disabled
     */
    disabled: boolean;
    /**
     * Whether the tree item is selected
     */
    selected: boolean;
    /**
     * Whether the tree item is focused
     */
    focused: boolean;
    /**
     * The depth of the tree item
     */
    depth: number;
    /**
     * Whether the tree branch is expanded
     */
    expanded: boolean;
    /**
     * Whether the tree item is a branch
     */
    isBranch: boolean;
}
interface MachineApi<T extends PropTypes = PropTypes, V = TreeNode> {
    /**
     * The tree collection data
     */
    collection: TreeCollection<V>;
    /**
     * The id of the expanded nodes
     */
    expandedValue: string[];
    /**
     * Function to set the expanded value
     */
    setExpandedValue(value: string[]): void;
    /**
     * The id of the selected nodes
     */
    selectedValue: string[];
    /**
     * Function to set the selected value
     */
    setSelectedValue(value: string[]): void;
    /**
     * Function to get the visible nodes
     */
    getVisibleNodes(): V[];
    /**
     * Function to expand nodes.
     * If no value is provided, all nodes will be expanded
     */
    expand(value?: string[]): void;
    /**
     * Function to collapse nodes
     * If no value is provided, all nodes will be collapsed
     */
    collapse(value?: string[]): void;
    /**
     * Function to select nodes
     * If no value is provided, all nodes will be selected
     */
    select(value?: string[]): void;
    /**
     * Function to deselect nodes
     * If no value is provided, all nodes will be deselected
     */
    deselect(value?: string[]): void;
    /**
     * Function to focus an item node
     */
    focus(value: string): void;
    /**
     * Function to select the parent node of the focused node
     */
    selectParent(value: string): void;
    /**
     * Function to expand the parent node of the focused node
     */
    expandParent(value: string): void;
    getRootProps(): T["element"];
    getLabelProps(): T["element"];
    getTreeProps(): T["element"];
    getNodeState(props: NodeProps): NodeState;
    getItemProps(props: NodeProps): T["element"];
    getItemIndicatorProps(props: NodeProps): T["element"];
    getItemTextProps(props: NodeProps): T["element"];
    getBranchProps(props: NodeProps): T["element"];
    getBranchIndicatorProps(props: NodeProps): T["element"];
    getBranchTriggerProps(props: NodeProps): T["element"];
    getBranchControlProps(props: NodeProps): T["element"];
    getBranchContentProps(props: NodeProps): T["element"];
    getBranchTextProps(props: NodeProps): T["element"];
    getBranchIndentGuideProps(props: NodeProps): T["element"];
}

declare function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T>;

declare function machine(userContext: UserDefinedContext): _zag_js_core.Machine<MachineContext<any>, MachineState, _zag_js_core.StateMachine.AnyEventObject>;

declare const props: ("dir" | "id" | "getRootNode" | "collection" | "ids" | "expandedValue" | "selectedValue" | "focusedValue" | "selectionMode" | "onExpandedChange" | "onSelectionChange" | "onFocusChange" | "expandOnClick" | "typeahead")[];
declare const splitProps: <Props extends Partial<UserDefinedContext>>(props: Props) => [Partial<UserDefinedContext>, Omit<Props, "dir" | "id" | "getRootNode" | "collection" | "ids" | "expandedValue" | "selectedValue" | "focusedValue" | "selectionMode" | "onExpandedChange" | "onSelectionChange" | "onFocusChange" | "expandOnClick" | "typeahead">];
declare const itemProps: (keyof NodeProps)[];
declare const splitItemProps: <Props extends NodeProps>(props: Props) => [NodeProps, Omit<Props, keyof NodeProps>];

export { type MachineApi as Api, type UserDefinedContext as Context, type ElementIds, type ExpandedChangeDetails, type FocusChangeDetails, type NodeProps, type NodeState, type SelectionChangeDetails, type Service, anatomy, collection, connect, filePathCollection, itemProps, machine, props, splitItemProps, splitProps };
