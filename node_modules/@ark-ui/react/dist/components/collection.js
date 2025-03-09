import { ListCollection, TreeCollection, filePathToTree } from '@zag-js/collection';
import { ref } from '@zag-js/core';

const createListCollection = (options) => ref(new ListCollection(options));
const createTreeCollection = (options) => ref(new TreeCollection(options));
const createFileTreeCollection = (paths) => ref(filePathToTree(paths));

export { createFileTreeCollection, createListCollection, createTreeCollection };
