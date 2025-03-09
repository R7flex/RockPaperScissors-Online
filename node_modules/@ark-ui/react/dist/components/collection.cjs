'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const collection = require('@zag-js/collection');
const core = require('@zag-js/core');

const createListCollection = (options) => core.ref(new collection.ListCollection(options));
const createTreeCollection = (options) => core.ref(new collection.TreeCollection(options));
const createFileTreeCollection = (paths) => core.ref(collection.filePathToTree(paths));

exports.createFileTreeCollection = createFileTreeCollection;
exports.createListCollection = createListCollection;
exports.createTreeCollection = createTreeCollection;
