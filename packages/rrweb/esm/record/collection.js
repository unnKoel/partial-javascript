/**
 * Some utils to handle the mutation observer DOM records.
 * It should be more clear to extend the native data structure
 * like Set and Map, but currently Typescript does not support
 * that.
 */
import { mirror } from '../utils';
export function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach(function (childN) { return deepDelete(addsSet, childN); });
}
export function isParentRemoved(removes, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    var parentId = mirror.getId(parentNode);
    if (removes.some(function (r) { return r.id === parentId; })) {
        return true;
    }
    return isParentRemoved(removes, parentNode);
}
export function isParentDropped(droppedSet, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    if (droppedSet.has(parentNode)) {
        return true;
    }
    return isParentDropped(droppedSet, parentNode);
}
//# sourceMappingURL=collection.js.map