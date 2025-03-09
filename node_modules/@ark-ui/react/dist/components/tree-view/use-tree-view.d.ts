import { PropTypes } from '@zag-js/react';
import { Optional } from '../../types';
import { TreeCollection, TreeNode } from '../collection';
import * as treeView from '@zag-js/tree-view';
export interface UseTreeViewProps<T extends TreeNode> extends Optional<Omit<treeView.Context, 'dir' | 'getRootNode' | 'collection'>, 'id'> {
    /**
     * The initial selected items of the tree view.
     * Use this when you do not need to control the state of the tree view.
     */
    defaultSelectedValue?: treeView.Context['selectedValue'];
    /**
     * The initial expanded items of the tree view.
     * Use this when you do not need to control the state of the tree view.
     */
    defaultExpandedValue?: treeView.Context['expandedValue'];
    /**
     * The collection of tree nodes
     */
    collection: TreeCollection<T>;
}
export interface UseTreeViewReturn<T extends TreeNode> extends treeView.Api<PropTypes, T> {
}
export declare const useTreeView: <T extends unknown>(props: UseTreeViewProps<T>) => UseTreeViewReturn<T>;
