import * as tslib_1 from "tslib";
import { NodeType, } from './types';
var _id = 1;
function genId() {
    return _id++;
}
function getCssRulesString(s) {
    try {
        var rules = s.rules || s.cssRules;
        return rules
            ? Array.from(rules).reduce(function (prev, cur) { return prev + getCssRuleString(cur); }, '')
            : null;
    }
    catch (error) {
        return null;
    }
}
function getCssRuleString(rule) {
    return isCSSImportRule(rule)
        ? getCssRulesString(rule.styleSheet) || ''
        : rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function extractOrigin(url) {
    var origin;
    if (url.indexOf('//') > -1) {
        origin = url
            .split('/')
            .slice(0, 3)
            .join('/');
    }
    else {
        origin = url.split('/')[0];
    }
    origin = origin.split('?')[0];
    return origin;
}
var URL_IN_CSS_REF = /url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/gm;
var RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/;
var DATA_URI = /^(data:)([\w\/\+]+);(charset=[\w-]+|base64).*,(.*)/gi;
export function absoluteToStylesheet(cssText, href) {
    return cssText.replace(URL_IN_CSS_REF, function (origin, path1, path2, path3) {
        var e_1, _a;
        var filePath = path1 || path2 || path3;
        if (!filePath) {
            return origin;
        }
        if (!RELATIVE_PATH.test(filePath)) {
            return "url('" + filePath + "')";
        }
        if (DATA_URI.test(filePath)) {
            return "url(" + filePath + ")";
        }
        if (filePath[0] === '/') {
            return "url('" + (extractOrigin(href) + filePath) + "')";
        }
        var stack = href.split('/');
        var parts = filePath.split('/');
        stack.pop();
        try {
            for (var parts_1 = tslib_1.__values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                var part = parts_1_1.value;
                if (part === '.') {
                    continue;
                }
                else if (part === '..') {
                    stack.pop();
                }
                else {
                    stack.push(part);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return "url('" + stack.join('/') + "')";
    });
}
function absoluteToDoc(doc, attributeValue) {
    var a = doc.createElement('a');
    a.href = attributeValue;
    return a.href;
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
function serializeNode(n, doc, blockClass, inlineStylesheet) {
    var e_2, _a;
    switch (n.nodeType) {
        case n.DOCUMENT_NODE:
            return {
                type: NodeType.Document,
                childNodes: [],
            };
        case n.DOCUMENT_TYPE_NODE:
            return {
                type: NodeType.DocumentType,
                name: n.name,
                publicId: n.publicId,
                systemId: n.systemId,
            };
        case n.ELEMENT_NODE:
            var needBlock_1 = false;
            if (typeof blockClass === 'string') {
                needBlock_1 = n.classList.contains(blockClass);
            }
            else {
                n.classList.forEach(function (className) {
                    if (blockClass.test(className)) {
                        needBlock_1 = true;
                    }
                });
            }
            var tagName = n.tagName.toLowerCase();
            var attributes = {};
            try {
                for (var _b = tslib_1.__values(Array.from(n.attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = _c.value, name_1 = _d.name, value = _d.value;
                    // relative path in attribute
                    if (name_1 === 'src' || name_1 === 'href') {
                        attributes[name_1] = absoluteToDoc(doc, value);
                    }
                    else if (name_1 === 'style') {
                        attributes[name_1] = absoluteToStylesheet(value, location.href);
                    }
                    else {
                        attributes[name_1] = value;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // remote css
            if (tagName === 'link' && inlineStylesheet) {
                var stylesheet = Array.from(doc.styleSheets).find(function (s) {
                    return s.href === n.href;
                });
                var cssText = getCssRulesString(stylesheet);
                if (cssText) {
                    delete attributes.rel;
                    delete attributes.href;
                    attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
                }
            }
            // dynamic stylesheet
            if (tagName === 'style' &&
                n.sheet &&
                // TODO: Currently we only try to get dynamic stylesheet when it is an empty style element
                !n.innerText.trim().length) {
                var cssText = getCssRulesString(n
                    .sheet);
                if (cssText) {
                    attributes._cssText = absoluteToStylesheet(cssText, location.href);
                }
            }
            // form fields
            if (tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select') {
                var value = n.value;
                if (attributes.type !== 'radio' &&
                    attributes.type !== 'checkbox' &&
                    value) {
                    attributes.value = value;
                }
                else if (n.checked) {
                    attributes.checked = n.checked;
                }
            }
            if (tagName === 'option') {
                var selectValue = n.parentElement;
                if (attributes.value === selectValue.value) {
                    attributes.selected = n.selected;
                }
            }
            if (needBlock_1) {
                var _e = n.getBoundingClientRect(), width = _e.width, height = _e.height;
                attributes.rr_width = width + "px";
                attributes.rr_height = height + "px";
            }
            return {
                type: NodeType.Element,
                tagName: tagName,
                attributes: attributes,
                childNodes: [],
                isSVG: isSVGElement(n) || undefined,
                needBlock: needBlock_1,
            };
        case n.TEXT_NODE:
            // The parent node may not be a html element which has a tagName attribute.
            // So just let it be undefined which is ok in this use case.
            var parentTagName = n.parentNode && n.parentNode.tagName;
            var textContent = n.textContent;
            var isStyle = parentTagName === 'STYLE' ? true : undefined;
            if (isStyle && textContent) {
                textContent = absoluteToStylesheet(textContent, location.href);
            }
            if (parentTagName === 'SCRIPT') {
                textContent = 'SCRIPT_PLACEHOLDER';
            }
            return {
                type: NodeType.Text,
                textContent: textContent || '',
                isStyle: isStyle,
            };
        case n.CDATA_SECTION_NODE:
            return {
                type: NodeType.CDATA,
                textContent: '',
            };
        case n.COMMENT_NODE:
            return {
                type: NodeType.Comment,
                textContent: n.textContent || '',
            };
        default:
            return false;
    }
}
/**
 * 序列化节点并带有唯一Id
 * @param n
 * @param doc
 * @param map
 * @param blockClass
 * @param skipChild 是否跳过子元素
 * @param inlineStylesheet 是否内联样式
 */
export function serializeNodeWithId(n, doc, map, blockClass, skipChild, inlineStylesheet) {
    var e_3, _a;
    if (skipChild === void 0) { skipChild = false; }
    if (inlineStylesheet === void 0) { inlineStylesheet = true; }
    // serialize node.
    var _serializedNode = serializeNode(n, doc, blockClass, inlineStylesheet);
    if (!_serializedNode) {
        // TODO: dev only
        console.warn(n, 'not serialized');
        return null;
    }
    var id;
    // Try to reuse the previous id
    if ('__sn' in n) {
        id = n.__sn.id;
    }
    else {
        id = genId();
    }
    var serializedNode = Object.assign(_serializedNode, { id: id });
    n.__sn = serializedNode;
    map[id] = n;
    // recordChild 是否需要record 子元素
    var recordChild = !skipChild;
    if (serializedNode.type === NodeType.Element) {
        recordChild = recordChild && !serializedNode.needBlock;
        // this property was not needed in replay side
        delete serializedNode.needBlock;
    }
    if ((serializedNode.type === NodeType.Document ||
        serializedNode.type === NodeType.Element) &&
        recordChild) {
        try {
            for (var _b = tslib_1.__values(Array.from(n.childNodes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var childN = _c.value;
                var serializedChildNode = serializeNodeWithId(childN, doc, map, blockClass, skipChild, inlineStylesheet);
                if (serializedChildNode) {
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    return serializedNode;
}
function snapshot(n, blockClass, inlineStylesheet) {
    if (blockClass === void 0) { blockClass = 'rr-block'; }
    if (inlineStylesheet === void 0) { inlineStylesheet = true; }
    var idNodeMap = {};
    return [
        serializeNodeWithId(n, n, idNodeMap, blockClass, false, inlineStylesheet),
        idNodeMap,
    ];
}
export default snapshot;
//# sourceMappingURL=snapshot.js.map