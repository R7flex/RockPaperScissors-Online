import { CollectionItem, CollectionOptions, FilePathTreeNode, ListCollection, TreeCollection, TreeCollectionOptions, TreeNode } from '@zag-js/collection';
export type { CollectionItem, ListCollection } from '@zag-js/collection';
export declare const createListCollection: <T extends unknown>(options: CollectionOptions<T>) => ListCollection<T>;
export type { TreeCollection, TreeNode } from '@zag-js/collection';
export declare const createTreeCollection: <T extends unknown>(options: TreeCollectionOptions<T>) => TreeCollection<T>;
export declare const createFileTreeCollection: (paths: string[]) => TreeCollection<FilePathTreeNode>;
