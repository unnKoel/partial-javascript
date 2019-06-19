import { NodeType, } from './types';
var tagMap = {
    script: 'noscript',
    altglyph: 'altGlyph',
    altglyphdef: 'altGlyphDef',
    altglyphitem: 'altGlyphItem',
    animatecolor: 'animateColor',
    animatemotion: 'animateMotion',
    animatetransform: 'animateTransform',
    clippath: 'clipPath',
    feblend: 'feBlend',
    fecolormatrix: 'feColorMatrix',
    fecomponenttransfer: 'feComponentTransfer',
    fecomposite: 'feComposite',
    feconvolvematrix: 'feConvolveMatrix',
    fediffuselighting: 'feDiffuseLighting',
    fedisplacementmap: 'feDisplacementMap',
    fedistantlight: 'feDistantLight',
    fedropshadow: 'feDropShadow',
    feflood: 'feFlood',
    fefunca: 'feFuncA',
    fefuncb: 'feFuncB',
    fefuncg: 'feFuncG',
    fefuncr: 'feFuncR',
    fegaussianblur: 'feGaussianBlur',
    feimage: 'feImage',
    femerge: 'feMerge',
    femergenode: 'feMergeNode',
    femorphology: 'feMorphology',
    feoffset: 'feOffset',
    fepointlight: 'fePointLight',
    fespecularlighting: 'feSpecularLighting',
    fespotlight: 'feSpotLight',
    fetile: 'feTile',
    feturbulence: 'feTurbulence',
    foreignobject: 'foreignObject',
    glyphref: 'glyphRef',
    lineargradient: 'linearGradient',
    radialgradient: 'radialGradient',
};
function getTagName(n) {
    var tagName = tagMap[n.tagName] ? tagMap[n.tagName] : n.tagName;
    if (tagName === 'link' && n.attributes._cssText) {
        tagName = 'style';
    }
    return tagName;
}
var CSS_SELECTOR = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g;
var HOVER_SELECTOR = /([^\\]):hover/g;
export function addHoverClass(cssText) {
    return cssText.replace(CSS_SELECTOR, function (match, p1, p2) {
        if (HOVER_SELECTOR.test(p1)) {
            var newSelector = p1.replace(HOVER_SELECTOR, '$1.\\:hover');
            return p1.replace(/\s*$/, '') + ", " + newSelector.replace(/^\s*/, '') + p2;
        }
        else {
            return match;
        }
    });
}
function buildNode(n, doc) {
    switch (n.type) {
        case NodeType.Document:
            return doc.implementation.createDocument(null, '', null);
        case NodeType.DocumentType:
            return doc.implementation.createDocumentType(n.name, n.publicId, n.systemId);
        case NodeType.Element:
            var tagName = getTagName(n);
            var node = void 0;
            if (n.isSVG) {
                node = doc.createElementNS('http://www.w3.org/2000/svg', tagName);
            }
            else {
                node = doc.createElement(tagName);
            }
            for (var name_1 in n.attributes) {
                if (n.attributes.hasOwnProperty(name_1) && !name_1.startsWith('rr_')) {
                    var value = n.attributes[name_1];
                    value = typeof value === 'boolean' ? '' : value;
                    var isTextarea = tagName === 'textarea' && name_1 === 'value';
                    var isRemoteOrDynamicCss = tagName === 'style' && name_1 === '_cssText';
                    if (isRemoteOrDynamicCss) {
                        value = addHoverClass(value);
                    }
                    if (isTextarea || isRemoteOrDynamicCss) {
                        var child = doc.createTextNode(value);
                        node.appendChild(child);
                        continue;
                    }
                    if (tagName === 'iframe' && name_1 === 'src') {
                        continue;
                    }
                    try {
                        if (n.isSVG && name_1 === 'xlink:href') {
                            node.setAttributeNS('http://www.w3.org/1999/xlink', name_1, value);
                        }
                        else {
                            node.setAttribute(name_1, value);
                        }
                    }
                    catch (error) {
                    }
                }
                else {
                    if (n.attributes.rr_width) {
                        node.style.width = n.attributes.rr_width;
                    }
                    if (n.attributes.rr_height) {
                        node.style.height = n.attributes
                            .rr_height;
                    }
                }
            }
            return node;
        case NodeType.Text:
            return doc.createTextNode(n.isStyle ? addHoverClass(n.textContent) : n.textContent);
        case NodeType.CDATA:
            return doc.createCDATASection(n.textContent);
        case NodeType.Comment:
            return doc.createComment(n.textContent);
        default:
            return null;
    }
}
export function buildNodeWithSN(n, doc, map, skipChild) {
    if (skipChild === void 0) { skipChild = false; }
    var node = buildNode(n, doc);
    if (!node) {
        return null;
    }
    if (n.type === NodeType.Document) {
        doc.close();
        doc.open();
        node = doc;
    }
    node.__sn = n;
    map[n.id] = node;
    if ((n.type === NodeType.Document || n.type === NodeType.Element) &&
        !skipChild) {
        for (var _i = 0, _a = n.childNodes; _i < _a.length; _i++) {
            var childN = _a[_i];
            var childNode = buildNodeWithSN(childN, doc, map);
            if (!childNode) {
                console.warn('Failed to rebuild', childN);
            }
            else {
                node.appendChild(childNode);
            }
        }
    }
    return node;
}
function rebuild(n, doc) {
    var idNodeMap = {};
    return [buildNodeWithSN(n, doc, idNodeMap), idNodeMap];
}
export default rebuild;
//# sourceMappingURL=rebuild.js.map