import { serializedNodeWithId, INode, idNodeMap } from './types';
export declare function absoluteToStylesheet(cssText: string, href: string): string;
/**
 * 序列化节点并带有唯一Id
 * @param n
 * @param doc
 * @param map
 * @param blockClass
 * @param skipChild 是否跳过子元素
 * @param inlineStylesheet 是否内联样式
 */
export declare function serializeNodeWithId(n: Node | INode, doc: Document, map: idNodeMap, blockClass: string | RegExp, skipChild?: boolean, inlineStylesheet?: boolean): serializedNodeWithId | null;
declare function snapshot(n: Document, blockClass?: string | RegExp, inlineStylesheet?: boolean): [serializedNodeWithId | null, idNodeMap];
export default snapshot;
//# sourceMappingURL=snapshot.d.ts.map