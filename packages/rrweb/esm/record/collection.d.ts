/**
 * Some utils to handle the mutation observer DOM records.
 * It should be more clear to extend the native data structure
 * like Set and Map, but currently Typescript does not support
 * that.
 */
import { removedNodeMutation } from '../types';
export declare function deepDelete(addsSet: Set<Node>, n: Node): void;
export declare function isParentRemoved(removes: removedNodeMutation[], n: Node): boolean;
export declare function isParentDropped(droppedSet: Set<Node>, n: Node): boolean;
//# sourceMappingURL=collection.d.ts.map