"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach(function (childN) { return deepDelete(addsSet, childN); });
}
exports.deepDelete = deepDelete;
function isParentRemoved(removes, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    var parentId = utils_1.mirror.getId(parentNode);
    if (removes.some(function (r) { return r.id === parentId; })) {
        return true;
    }
    return isParentRemoved(removes, parentNode);
}
exports.isParentRemoved = isParentRemoved;
function isParentDropped(droppedSet, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    if (droppedSet.has(parentNode)) {
        return true;
    }
    return isParentDropped(droppedSet, parentNode);
}
exports.isParentDropped = isParentDropped;
//# sourceMappingURL=collection.js.map