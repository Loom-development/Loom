#!/usr/bin/env node
import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid2 = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid2);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (data?.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v = value;
      for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start2 = i + 1;
      let ch = text[start2];
      while (ch === " " || ch === "	") {
        if (i < start2 + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start2 = i + 1;
          ch = text[start2];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start2 = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start2 > limit)
            return true;
          start2 = i + 1;
          if (strLen - start2 <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start2 = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start2, i) + "\\ ";
          i += 1;
          start2 = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start2, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start2 = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start2, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start2 = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start2 ? str + json.slice(start2) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start2 = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start2) {
        value = value.substring(start2.length);
        start2 = start2.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start2}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start2}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      value = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (identity.isSeq(value))
        for (const it of value.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(value))
        for (const it of value)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, value);
    }
    function mergeValue(ctx, map, value) {
      const source = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        if (i < items.length - 1)
          str += ",";
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
          reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start: start2, end } = flowChars;
      if (lines.length === 0) {
        return start2 + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start2;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start2}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start2 = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start2 ?? (start2 = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start2 ?? (start2 = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start2 ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start: start2, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start2, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start2[start2.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start2, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start: start2, value } of bs.items) {
        const props = resolveProps.resolveProps(start2, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start2, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start: start2, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start2, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start2) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start2, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start2 = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start2, start2, start2] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start2 + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start2, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start2 + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start2, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = { x: 2, u: 4, U: 8 }[next];
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
      return String.fromCodePoint(code);
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
          isSrcToken = false;
        }
      }
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start: start2, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start2, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start2, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          Array.prototype.push.apply(doc.errors, this.errors);
          Array.prototype.push.apply(doc.warnings, this.warnings);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start: start2, key, sep, value }) {
      let res = "";
      for (const st of start2)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return yield* this.parseBlockStart();
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        switch (this.charAt(0)) {
          case "!":
            return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "&":
            return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "-":
          // this is an error
          case "?":
          // this is an error outside flow collections
          case ":": {
            const inFlow = this.flowLevel > 0;
            const ch1 = this.charAt(1);
            if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
              if (!inFlow)
                this.indentNext = this.indentValue + 1;
              else if (this.flowKey)
                this.flowKey = false;
              return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
            }
          }
        }
        return 0;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start2 = this.lineStarts[low - 1];
          return { line: low, col: offset - start2 + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                Array.prototype.push.apply(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              Array.prototype.push.apply(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start2 = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start: start2, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start2 = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start2 = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start2.push(this.sourceToken);
                map.items.push({ start: start2 });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start2.push(this.sourceToken);
                map.items.push({ start: start2, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start3 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start3, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start3 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start3, key, sep }]
                  });
                } else if (start2.length > 0) {
                  it.sep = it.sep.concat(start2, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start: start2, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start: start2, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start: start2 });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start: start2, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            start2.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: start2, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: start2, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start2, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start2.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse2(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse2;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/.pnpm/yaml@2.8.2/node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// ../../node_modules/.pnpm/cac@6.7.14/node_modules/cac/dist/index.mjs
import { EventEmitter } from "events";
function toArr(any) {
  return any == null ? [] : Array.isArray(any) ? any : [any];
}
function toVal(out, key, val, opts) {
  var x, old = out[key], nxt = !!~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : !!~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
  out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
function mri2(args, opts) {
  args = args || [];
  opts = opts || {};
  var k, arr, arg, name, val, out = { _: [] };
  var i = 0, j = 0, idx = 0, len = args.length;
  const alibi = opts.alias !== void 0;
  const strict = opts.unknown !== void 0;
  const defaults = opts.default !== void 0;
  opts.alias = opts.alias || {};
  opts.string = toArr(opts.string);
  opts.boolean = toArr(opts.boolean);
  if (alibi) {
    for (k in opts.alias) {
      arr = opts.alias[k] = toArr(opts.alias[k]);
      for (i = 0; i < arr.length; i++) {
        (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
      }
    }
  }
  for (i = opts.boolean.length; i-- > 0; ) {
    arr = opts.alias[opts.boolean[i]] || [];
    for (j = arr.length; j-- > 0; ) opts.boolean.push(arr[j]);
  }
  for (i = opts.string.length; i-- > 0; ) {
    arr = opts.alias[opts.string[i]] || [];
    for (j = arr.length; j-- > 0; ) opts.string.push(arr[j]);
  }
  if (defaults) {
    for (k in opts.default) {
      name = typeof opts.default[k];
      arr = opts.alias[k] = opts.alias[k] || [];
      if (opts[name] !== void 0) {
        opts[name].push(k);
        for (i = 0; i < arr.length; i++) {
          opts[name].push(arr[i]);
        }
      }
    }
  }
  const keys = strict ? Object.keys(opts.alias) : [];
  for (i = 0; i < len; i++) {
    arg = args[i];
    if (arg === "--") {
      out._ = out._.concat(args.slice(++i));
      break;
    }
    for (j = 0; j < arg.length; j++) {
      if (arg.charCodeAt(j) !== 45) break;
    }
    if (j === 0) {
      out._.push(arg);
    } else if (arg.substring(j, j + 3) === "no-") {
      name = arg.substring(j + 3);
      if (strict && !~keys.indexOf(name)) {
        return opts.unknown(arg);
      }
      out[name] = false;
    } else {
      for (idx = j + 1; idx < arg.length; idx++) {
        if (arg.charCodeAt(idx) === 61) break;
      }
      name = arg.substring(j, idx);
      val = arg.substring(++idx) || (i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i]);
      arr = j === 2 ? [name] : name;
      for (idx = 0; idx < arr.length; idx++) {
        name = arr[idx];
        if (strict && !~keys.indexOf(name)) return opts.unknown("-".repeat(j) + name);
        toVal(out, name, idx + 1 < arr.length || val, opts);
      }
    }
  }
  if (defaults) {
    for (k in opts.default) {
      if (out[k] === void 0) {
        out[k] = opts.default[k];
      }
    }
  }
  if (alibi) {
    for (k in out) {
      arr = opts.alias[k] || [];
      while (arr.length > 0) {
        out[arr.shift()] = out[k];
      }
    }
  }
  return out;
}
var removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
var findAllBrackets = (v) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];
  const parse2 = (match) => {
    let variadic = false;
    let value = match[1];
    if (value.startsWith("...")) {
      value = value.slice(3);
      variadic = true;
    }
    return {
      required: match[0].startsWith("<"),
      value,
      variadic
    };
  };
  let angledMatch;
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse2(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse2(squareMatch));
  }
  return res;
};
var getMriOptions = (options) => {
  const result2 = { alias: {}, boolean: [] };
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result2.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result2.boolean.push(option.names[0]);
        }
      } else {
        result2.boolean.push(option.names[0]);
      }
    }
  }
  return result2;
};
var findLongest = (arr) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
var padRight = (str, length) => {
  return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
var camelcase = (input) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
var setDotProp = (obj, keys, val) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;
  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
};
var setByType = (obj, transforms) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];
    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
var getFileName = (input) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : "";
};
var camelcaseOptionName = (name) => {
  return name.split(".").map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join(".");
};
var CACError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
};
var Option = class {
  constructor(rawName, description, config) {
    this.rawName = rawName;
    this.description = description;
    this.config = Object.assign({}, config);
    rawName = rawName.replace(/\.\*/g, "");
    this.negated = false;
    this.names = removeBrackets(rawName).split(",").map((v) => {
      let name = v.trim().replace(/^-{1,2}/, "");
      if (name.startsWith("no-")) {
        this.negated = true;
        name = name.replace(/^no-/, "");
      }
      return camelcaseOptionName(name);
    }).sort((a, b) => a.length > b.length ? 1 : -1);
    this.name = this.names[this.names.length - 1];
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
};
var processArgs = process.argv;
var platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
var Command = class {
  constructor(rawName, description, config = {}, cli2) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli2;
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
  }
  usage(text) {
    this.usageText = text;
    return this;
  }
  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }
  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }
  example(example) {
    this.examples.push(example);
    return this;
  }
  option(rawName, description, config) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }
  alias(name) {
    this.aliasNames.push(name);
    return this;
  }
  action(callback) {
    this.commandAction = callback;
    return this;
  }
  isMatched(name) {
    return this.name === name || this.aliasNames.includes(name);
  }
  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }
  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }
  hasOption(name) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }
  outputHelp() {
    const { name, commands } = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
    sections.push({
      title: "Usage",
      body: `  $ ${name} ${this.usageText || this.rawName}`
    });
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    if (showCommands) {
      const longestCommandName = findLongest(commands.map((command) => command.rawName));
      sections.push({
        title: "Commands",
        body: commands.map((command) => {
          return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
        }).join("\n")
      });
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
      });
    }
    let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const { name } = this.cli;
    const { versionNumber } = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
};
var GlobalCommand = class extends Command {
  constructor(cli2) {
    super("@@global@@", "", {}, cli2);
  }
};
var __assign = Object.assign;
var CAC = class extends EventEmitter {
  constructor(name = "") {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage("<command> [options]");
  }
  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }
  command(rawName, description, config) {
    const command = new Command(rawName, description || "", config, this);
    command.globalCommand = this.globalCommand;
    this.commands.push(command);
    return command;
  }
  option(rawName, description, config) {
    this.globalCommand.option(rawName, description, config);
    return this;
  }
  help(callback) {
    this.globalCommand.option("-h, --help", "Display this message");
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }
  example(example) {
    this.globalCommand.example(example);
    return this;
  }
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run: run2 = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
      }
    }
    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }
    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp();
      run2 = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion();
      run2 = false;
      this.unsetMatchedCommand();
    }
    const parsedArgv = { args: this.args, options: this.options };
    if (run2) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, { _: [] });
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = /* @__PURE__ */ Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = /* @__PURE__ */ Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
};
var cac = (name = "") => new CAC(name);

// src/index.ts
import { existsSync as existsSync2 } from "node:fs";
import { access as access8, copyFile as copyFile2, cp, mkdir as mkdir7, readFile as readFile7, writeFile as writeFile5 } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { basename as basename2, dirname as dirname5, isAbsolute as isAbsolute6, relative as relative3, resolve as resolve13 } from "node:path";
import { fileURLToPath } from "node:url";

// package.json
var package_default = {
  name: "@loomdev/cli",
  version: "0.3.5",
  description: "Command-line interface for Loom local development workflows.",
  keywords: [
    "loom",
    "cli",
    "podman"
  ],
  repository: {
    type: "git",
    url: "https://github.com/Loom-development/Loom.git",
    directory: "apps/cli"
  },
  bugs: {
    url: "https://github.com/Loom-development/Loom/issues"
  },
  homepage: "https://github.com/Loom-development/Loom#readme",
  license: "Elastic-2.0",
  type: "module",
  preferGlobal: true,
  publishConfig: {
    access: "public"
  },
  bin: {
    loom: "dist/index.js"
  },
  main: "dist/index.js",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
      default: "./dist/index.js"
    }
  },
  files: [
    "dist/index.js",
    "dist/index.js.map",
    "dist/index.d.ts",
    "dist/stacks",
    "package.json",
    "README.md"
  ],
  scripts: {
    build: "pnpm exec tsc -b tsconfig.json && node ../../scripts/build-cli-package-assets.mjs",
    typecheck: "pnpm exec tsc -b tsconfig.json",
    test: "node ../../scripts/build-cli-package-assets.mjs && node --test dist/**/*.test.js",
    dev: "tsx src/index.ts",
    lint: "echo 'No lint rules configured'"
  },
  devDependencies: {
    "@loom/stacks": "workspace:*",
    cac: "^6.7.14",
    "@loom/config": "workspace:*",
    "@loom/core": "workspace:*",
    "@loom/https": "workspace:*",
    "@loom/network": "workspace:*",
    "@loom/runtime-podman": "workspace:*",
    "@loom/tasks": "workspace:*"
  }
};

// ../../packages/config/src/index.ts
var import_yaml = __toESM(require_dist(), 1);
import { access, readFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { constants } from "node:fs";

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage2 = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage2 = map(fullIssue, { data, defaultError: errorMessage2 }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage2
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result2) => {
  if (isValid(result2)) {
    return { success: true, data: result2.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result2 = this._parse(input);
    if (isAsync(result2)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result2;
  }
  _parseAsync(input) {
    const result2 = this._parse(input);
    return Promise.resolve(result2);
  }
  parse(data, params) {
    const result2 = this.safeParse(data, params);
    if (result2.success)
      return result2.data;
    throw result2.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result2 = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result2);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result2 = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result2) ? {
          value: result2.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result2) => isValid(result2) ? {
      value: result2.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result2 = await this.safeParseAsync(data, params);
    if (result2.success)
      return result2.data;
    throw result2.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result2 = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result2);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result2 = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result2 instanceof Promise) {
        return result2.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result2) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result3) => {
        return ParseStatus.mergeArray(status, result3);
      });
    }
    const result2 = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result2);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result2 of results) {
        if (result2.result.status === "valid") {
          return result2.result;
        }
      }
      for (const result2 of results) {
        if (result2.result.status === "dirty") {
          ctx.common.issues.push(...result2.ctx.common.issues);
          return result2.result;
        }
      }
      const unionErrors = results.map((result2) => new ZodError(result2.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result2 = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result2.status === "valid") {
          return result2;
        } else if (result2.status === "dirty" && !dirty) {
          dirty = { result: result2, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result2 = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result2, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result2, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result2 = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result2, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result2, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result2 = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result2.status === "aborted")
            return INVALID;
          if (result2.status === "dirty")
            return DIRTY(result2.value);
          if (status.value === "dirty")
            return DIRTY(result2.value);
          return result2;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result2 = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result2.status === "aborted")
          return INVALID;
        if (result2.status === "dirty")
          return DIRTY(result2.value);
        if (status.value === "dirty")
          return DIRTY(result2.value);
        return result2;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result2 = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result2);
        }
        if (result2 instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result2 = effect.transform(base.value, checkCtx);
        if (result2 instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result2 };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result2) => ({
            status: status.value,
            value: result2
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result2 = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result2)) {
      return result2.then((result3) => {
        return {
          status: "valid",
          value: result3.status === "valid" ? result3.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result2.status === "valid" ? result2.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result2 = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result2) ? result2.then((data) => freeze(data)) : freeze(result2);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// ../../packages/config/src/index.ts
var SAFE_IDENTIFIER_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
var SAFE_HOST_PATTERN = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
var serviceSchema = external_exports.object({
  type: external_exports.string().min(1),
  image: external_exports.string().min(1),
  composer: external_exports.boolean().optional(),
  user: external_exports.string().min(1).optional(),
  userns: external_exports.enum(["keep-id"]).optional(),
  execUser: external_exports.string().min(1).optional(),
  entrypoint: external_exports.string().optional(),
  command: external_exports.string().optional(),
  workdir: external_exports.string().optional(),
  ports: external_exports.array(external_exports.string()).optional(),
  volumes: external_exports.array(external_exports.string()).optional(),
  env: external_exports.record(external_exports.string()).optional(),
  dependsOn: external_exports.array(external_exports.string()).optional(),
  healthcheck: external_exports.object({
    command: external_exports.string(),
    intervalSeconds: external_exports.number().int().positive().optional(),
    timeoutSeconds: external_exports.number().int().positive().optional(),
    retries: external_exports.number().int().positive().optional(),
    startPeriodSeconds: external_exports.number().int().nonnegative().optional()
  }).optional()
});
var configSchema = external_exports.object({
  version: external_exports.number().int().positive(),
  name: external_exports.string().regex(SAFE_IDENTIFIER_PATTERN, {
    message: "Project name must start with an alphanumeric character and contain only letters, digits, dot, underscore, or dash."
  }),
  runtime: external_exports.object({
    engine: external_exports.literal("podman"),
    rootless: external_exports.boolean().default(true),
    machine: external_exports.object({
      managed: external_exports.boolean().default(true)
    }).optional()
  }),
  services: external_exports.record(
    external_exports.string().regex(SAFE_IDENTIFIER_PATTERN, {
      message: "Service names must start with an alphanumeric character and contain only letters, digits, dot, underscore, or dash."
    }),
    serviceSchema
  ),
  routes: external_exports.array(
    external_exports.object({
      host: external_exports.string().regex(SAFE_HOST_PATTERN, {
        message: "Route host must be a valid hostname and may start with '*.'."
      }),
      service: external_exports.string(),
      port: external_exports.number().int().positive(),
      https: external_exports.boolean().optional()
    })
  ).optional(),
  tasks: external_exports.record(
    external_exports.object({
      service: external_exports.string(),
      command: external_exports.string()
    })
  ).optional()
});
async function findConfigPath(configPath) {
  if (isAbsolute(configPath)) {
    return configPath;
  }
  let currentDir = process.cwd();
  while (true) {
    const candidate = resolve(currentDir, configPath);
    try {
      await access(candidate, constants.F_OK);
      return candidate;
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error(`Unable to find '${configPath}' from ${process.cwd()} or any parent directory.`);
      }
      currentDir = parentDir;
    }
  }
}
function parseDotEnv(raw) {
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}
async function loadProjectEnv(projectRoot) {
  const envPath = resolve(projectRoot, ".env");
  try {
    const raw = await readFile(envPath, "utf-8");
    return {
      ...parseDotEnv(raw),
      ...Object.fromEntries(
        Object.entries(process.env).filter((entry) => typeof entry[1] === "string")
      )
    };
  } catch {
    return Object.fromEntries(
      Object.entries(process.env).filter((entry) => typeof entry[1] === "string")
    );
  }
}
function interpolateString(value, env) {
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}/g, (_match, key, defaultValue) => {
    const resolved = env[key];
    if (resolved !== void 0) {
      return resolved;
    }
    if (defaultValue !== void 0) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable '${key}' while loading Loom config.`);
  });
}
function interpolateConfigValue(value, env) {
  if (typeof value === "string") {
    return interpolateString(value, env);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => interpolateConfigValue(entry, env));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, interpolateConfigValue(entry, env)])
    );
  }
  return value;
}
async function loadLoomProject(configPath = "loom.yaml") {
  const absolutePath = await findConfigPath(configPath);
  const raw = await readFile(absolutePath, "utf-8");
  const projectRoot = dirname(absolutePath);
  const env = await loadProjectEnv(projectRoot);
  const parsed = interpolateConfigValue((0, import_yaml.parse)(raw), env);
  return {
    config: configSchema.parse(parsed),
    configPath: absolutePath,
    projectRoot
  };
}

// ../../packages/runtime-podman/src/backup.ts
import { spawn as spawn2 } from "node:child_process";
import { constants as constants2 } from "node:fs";
import { createReadStream, createWriteStream } from "node:fs";
import { access as access2, mkdir as mkdir2, mkdtemp, open, rm as rm2 } from "node:fs/promises";
import { tmpdir as tmpdir2 } from "node:os";
import { basename, dirname as dirname2, join as join2 } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";

// ../../packages/runtime-podman/src/containers.ts
import { createHash } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { resolve as resolve2, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir, userInfo } from "node:os";

// ../../packages/runtime-podman/src/podman.ts
import { spawn } from "node:child_process";
function runCommand(command, args) {
  return new Promise((resolve14) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      resolve14({ ok: false, stdout: "", stderr: `Failed to run ${command}: ${err.message}`, code: 1 });
    });
    child.on("close", (code) => {
      resolve14({ ok: code === 0, stdout: stdout.trim(), stderr: stderr.trim(), code: code ?? 1 });
    });
  });
}
async function runPodman(args) {
  return runCommand("podman", args);
}
function runCommandInherit(command, args) {
  return new Promise((resolve14) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", () => {
      resolve14(1);
    });
    child.on("close", (code) => {
      resolve14(code ?? 1);
    });
  });
}
async function runPodmanInherit(args) {
  return runCommandInherit("podman", args);
}

// ../../packages/runtime-podman/src/containers.ts
var execFileAsync = promisify(execFile);
function normalizeImage(image) {
  if (image.includes("/")) {
    if (image.startsWith("docker.io/") && !image.startsWith("docker.io/library/")) {
      const rest = image.slice("docker.io/".length);
      return rest.includes("/") ? image : `docker.io/library/${rest}`;
    }
    return image;
  }
  return `docker.io/library/${image}`;
}
function containerName(projectName, serviceName) {
  return `${projectName}-${serviceName}`;
}
async function isDnsWorking(networkName) {
  try {
    const { stdout } = await execFileAsync("podman", [
      "run",
      "--rm",
      "--network",
      networkName,
      "docker.io/library/alpine:latest",
      "nslookup",
      "google.com"
    ], { timeout: 15e3 });
    return /Non-authoritative answer/.test(stdout);
  } catch {
    return false;
  }
}
async function restartAardvarkDns() {
  process.stderr.write("Loom: aardvark-dns is not responding, restarting it...\n");
  if (process.platform === "linux") {
    try {
      await execFileAsync("pkill", ["-9", "aardvark-dns"], { timeout: 5e3 });
    } catch {
    }
    const uid = userInfo().uid;
    const configDir = join(tmpdir(), `containers-user-${uid}`, "containers", "networks", "aardvark-dns");
    try {
      await rm(configDir, { recursive: true, force: true });
    } catch {
    }
    await new Promise((r) => setTimeout(r, 3e3));
  } else {
    try {
      await execFileAsync("podman", ["machine", "stop"], { timeout: 3e4 });
      await execFileAsync("podman", ["machine", "start"], { timeout: 6e4 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Loom: could not restart Podman Machine: ${msg}
`);
    }
  }
}
async function ensurePodmanNetwork(networkName) {
  const exists = await runPodman(["network", "exists", networkName]);
  if (!exists.ok) {
    const create = await runPodman(["network", "create", networkName]);
    if (!create.ok) {
      throw new Error(`Failed to create network '${networkName}': ${create.stderr || "unknown error"}`);
    }
  }
  if (!await isDnsWorking(networkName)) {
    await restartAardvarkDns();
    if (!await isDnsWorking(networkName)) {
      process.stderr.write(`Loom: DNS is still not working on network '${networkName}'. Try: podman system reset --force
`);
    }
  }
}
async function isContainerRunning(name) {
  const inspect = await runPodman(["inspect", "--format", "{{.State.Running}}", name]);
  return inspect.ok && inspect.stdout.toLowerCase() === "true";
}
async function inspectContainer(name) {
  const inspect = await runPodman([
    "inspect",
    "--format",
    "{{.Name}}|{{.State.Status}}|{{.State.Running}}|{{if .State.Healthcheck}}{{.State.Healthcheck.Status}}{{end}}|{{.ImageName}}",
    name
  ]);
  if (!inspect.ok) {
    return null;
  }
  const [containerNameRaw, state, runningRaw, healthRaw, image] = inspect.stdout.split("|");
  return {
    name: containerNameRaw.replace(/^\//, ""),
    state,
    running: runningRaw.toLowerCase() === "true",
    health: healthRaw || void 0,
    image
  };
}
async function listProjectContainers(projectName) {
  const list = await runPodman([
    "ps",
    "-a",
    "--filter",
    `name=^${projectName}-`,
    "--format",
    "{{.Names}}"
  ]);
  if (!list.ok || !list.stdout) {
    return [];
  }
  const names = list.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const inspected = await Promise.all(names.map((name) => inspectContainer(name)));
  return inspected.filter((entry) => entry !== null);
}
function parseHostPorts(portMappings = []) {
  return portMappings.map((mapping) => {
    const parts = mapping.split(":").map((part) => part.trim());
    if (parts.length < 2) {
      return Number.NaN;
    }
    const hostPart = parts[parts.length - 2];
    return Number(hostPart);
  }).filter((value) => Number.isFinite(value) && value > 0);
}
function parseVolumeSource(volume) {
  const source = volume.split(":")[0]?.trim();
  if (!source) {
    return null;
  }
  return source;
}
function isBindMountSource(source) {
  return source.startsWith(".") || source.startsWith("/") || source.includes("/");
}
async function ensureBindMountParentDirs(volumes = []) {
  for (const volume of volumes) {
    const source = parseVolumeSource(volume);
    if (!source || !isBindMountSource(source)) {
      continue;
    }
    const absoluteSource = source.startsWith("/") ? source : resolve2(process.cwd(), source);
    await mkdir(absoluteSource, { recursive: true });
  }
}
async function containerExists(name) {
  const exists = await runPodman(["container", "exists", name]);
  return exists.ok;
}
async function inspectContainerImage(name) {
  const imageInspect = await runPodman(["inspect", "--format", "{{.ImageName}}", name]);
  return imageInspect.ok ? imageInspect.stdout.trim() : "";
}
async function inspectContainerLabel(name, label) {
  const labelInspect = await runPodman([
    "inspect",
    "--format",
    `{{ index .Config.Labels "${label}" }}`,
    name
  ]);
  return labelInspect.ok ? labelInspect.stdout.trim() : "";
}
function serviceConfigHash(service) {
  const signature = {
    type: service.type,
    image: normalizeImage(service.image),
    user: service.user ?? null,
    userns: service.userns ?? null,
    entrypoint: service.entrypoint ?? null,
    command: service.command ?? null,
    workdir: service.workdir ?? null,
    ports: [...service.ports ?? []],
    volumes: [...service.volumes ?? []],
    env: Object.entries(service.env ?? {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
    dependsOn: [...service.dependsOn ?? []],
    healthcheck: service.healthcheck ? {
      command: service.healthcheck.command,
      intervalSeconds: service.healthcheck.intervalSeconds ?? null,
      timeoutSeconds: service.healthcheck.timeoutSeconds ?? null,
      retries: service.healthcheck.retries ?? null,
      startPeriodSeconds: service.healthcheck.startPeriodSeconds ?? null
    } : null
  };
  return createHash("sha256").update(JSON.stringify(signature)).digest("hex");
}
async function removeContainer(name) {
  const remove = await runPodman(["rm", "-f", name]);
  if (!remove.ok) {
    throw new Error(`Failed to recreate container '${name}': ${remove.stderr || "unknown error"}`);
  }
}
async function startContainer(name) {
  const start2 = await runPodman(["start", name]);
  if (!start2.ok) {
    throw new Error(`Failed to start existing container '${name}': ${start2.stderr || "unknown error"}`);
  }
}
function appendHealthcheckArgs(args, service) {
  if (!service.healthcheck?.command) {
    return;
  }
  args.push("--health-cmd", service.healthcheck.command);
  args.push("--health-interval", `${service.healthcheck.intervalSeconds ?? 10}s`);
  args.push("--health-timeout", `${service.healthcheck.timeoutSeconds ?? 3}s`);
  args.push("--health-retries", String(service.healthcheck.retries ?? 5));
  args.push("--health-start-period", `${service.healthcheck.startPeriodSeconds ?? 0}s`);
}
async function buildPodmanRunArgs(serviceName, containerNameValue, service, networkName, expectedImage, expectedServiceHash) {
  const args = [
    "run",
    "-d",
    "--name",
    containerNameValue,
    "--network",
    networkName,
    "--network-alias",
    serviceName
  ];
  if (service.workdir) {
    args.push("-w", service.workdir);
  }
  if (service.userns) {
    args.push(`--userns=${service.userns}`);
  }
  if (service.user) {
    args.push("--user", service.user);
  }
  if (service.entrypoint !== void 0) {
    args.push("--entrypoint", service.entrypoint);
  }
  for (const port of service.ports ?? []) {
    args.push("-p", port);
  }
  await ensureBindMountParentDirs(service.volumes ?? []);
  for (const volume of service.volumes ?? []) {
    args.push("-v", volume);
  }
  for (const [key, value] of Object.entries(service.env ?? {})) {
    args.push("-e", `${key}=${value}`);
  }
  appendHealthcheckArgs(args, service);
  args.push("--label", `loom.service-hash=${expectedServiceHash}`);
  args.push(expectedImage);
  if (service.command) {
    args.push("sh", "-c", service.command);
  }
  return args;
}

// ../../packages/runtime-podman/src/backup.ts
var SUPPORTED_BACKUP_SERVICE_TYPES = [
  "mysql",
  "mariadb",
  "postgres",
  "mongodb",
  "redis",
  "sqlite",
  "sqlserver"
];
var SUPPORTED_RESTORE_SERVICE_TYPES = [
  "mysql",
  "mariadb",
  "postgres",
  "mongodb",
  "redis",
  "sqlite"
];
function databaseBackupStrategy(serviceType) {
  const normalized = serviceType.toLowerCase();
  if (normalized === "mysql") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-c",
        'mysqldump -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" "${MYSQL_DATABASE:-loom}"'
      ]
    };
  }
  if (normalized === "mariadb") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-c",
        'mariadb-dump -h 127.0.0.1 -uroot -p"$MARIADB_ROOT_PASSWORD" "${MARIADB_DATABASE:-loom}"'
      ]
    };
  }
  if (normalized === "postgres") {
    return {
      extension: "sql",
      command: ["sh", "-c", 'pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-postgres}"']
    };
  }
  if (normalized === "mongodb") {
    return {
      extension: "archive.gz",
      command: [
        "sh",
        "-c",
        'mongodump --archive --gzip --authenticationDatabase admin --username "${MONGO_INITDB_ROOT_USERNAME:-root}" --password "${MONGO_INITDB_ROOT_PASSWORD:-example}" --db "${MONGO_INITDB_DATABASE:-admin}"'
      ]
    };
  }
  if (normalized === "redis") {
    return {
      extension: "rdb",
      command: ["sh", "-c", "redis-cli SAVE >/dev/null && cat /data/dump.rdb"]
    };
  }
  if (normalized === "sqlite") {
    return {
      extension: "db",
      command: ["sh", "-c", "cat /data/loom.db"]
    };
  }
  if (normalized === "sqlserver" || normalized === "mssql") {
    return {
      extension: "bak",
      command: [
        "sh",
        "-c",
        `mkdir -p /var/opt/mssql/backup && /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "BACKUP DATABASE [master] TO DISK='/var/opt/mssql/backup/loom.bak' WITH INIT" >/dev/null && cat /var/opt/mssql/backup/loom.bak`
      ]
    };
  }
  return null;
}
function backupExtensionForServiceType(serviceType) {
  return databaseBackupStrategy(serviceType)?.extension ?? null;
}
function requiresTextSqlRestore(serviceType) {
  return ["mysql", "mariadb", "postgres"].includes(serviceType.toLowerCase());
}
async function readInputPrefix(inputPath, bytes = 64) {
  const handle = await open(inputPath, "r");
  try {
    const buffer = Buffer.alloc(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
function detectRestoreInputFormat(prefix) {
  if (prefix.length >= 2 && prefix[0] === 31 && prefix[1] === 139) {
    return "gzip";
  }
  if (prefix.length >= 6 && prefix[0] === 253 && prefix[1] === 55 && prefix[2] === 122 && prefix[3] === 88 && prefix[4] === 90 && prefix[5] === 0) {
    return "xz";
  }
  if (prefix.length >= 4 && prefix[0] === 80 && prefix[1] === 75 && [3, 5, 7].includes(prefix[2] ?? -1) && [4, 6, 8].includes(prefix[3] ?? -1)) {
    return "zip";
  }
  if (prefix.includes(0)) {
    return "binary";
  }
  return "text";
}
async function gunzipRestoreInput(inputPath) {
  const tempDir = await mkdtemp(join2(tmpdir2(), "loom-restore-"));
  const outputName = basename(inputPath).replace(/\.gz$/i, "") || "loom-restore.sql";
  const outputPath = join2(tempDir, outputName);
  await pipeline(createReadStream(inputPath), createGunzip(), createWriteStream(outputPath));
  return {
    path: outputPath,
    cleanup: async () => {
      await rm2(tempDir, { recursive: true, force: true });
    }
  };
}
async function prepareRestoreInputForService(serviceType, inputPath) {
  if (!requiresTextSqlRestore(serviceType)) {
    return { path: inputPath };
  }
  const prefix = await readInputPrefix(inputPath);
  const format = detectRestoreInputFormat(prefix);
  if (format === "gzip") {
    return gunzipRestoreInput(inputPath);
  }
  if (format === "xz") {
    throw new Error(
      `Restore input '${inputPath}' appears to be xz-compressed. Loom restore currently supports plain SQL dumps and gzip-compressed SQL dumps for ${serviceType}. Decompress the file first.`
    );
  }
  if (format === "zip") {
    throw new Error(
      `Restore input '${inputPath}' appears to be a zip archive. Loom restore currently supports plain SQL dumps and gzip-compressed SQL dumps for ${serviceType}. Extract the SQL file first.`
    );
  }
  if (format === "binary") {
    throw new Error(
      `Restore input '${inputPath}' does not look like a plain SQL dump. Loom restore currently supports plain SQL dumps and gzip-compressed SQL dumps for ${serviceType}.`
    );
  }
  return { path: inputPath };
}
function databaseRestoreStrategy(serviceType) {
  const normalized = serviceType.toLowerCase();
  if (normalized === "mysql") {
    return {
      destinationPath: "/tmp/loom-restore.sql",
      command: [
        "sh",
        "-c",
        'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --binary-mode=1 -h 127.0.0.1 -uroot "${MYSQL_DATABASE:-loom}" < /tmp/loom-restore.sql'
      ]
    };
  }
  if (normalized === "mariadb") {
    return {
      destinationPath: "/tmp/loom-restore.sql",
      command: [
        "sh",
        "-c",
        'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb --binary-mode=1 -h 127.0.0.1 -uroot "${MARIADB_DATABASE:-loom}" < /tmp/loom-restore.sql'
      ]
    };
  }
  if (normalized === "postgres") {
    return {
      destinationPath: "/tmp/loom-restore.sql",
      command: [
        "sh",
        "-c",
        'psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" -f /tmp/loom-restore.sql'
      ]
    };
  }
  if (normalized === "mongodb") {
    return {
      destinationPath: "/tmp/loom-restore.archive.gz",
      command: [
        "sh",
        "-c",
        'mongorestore --drop --archive=/tmp/loom-restore.archive.gz --gzip --authenticationDatabase admin --username "${MONGO_INITDB_ROOT_USERNAME:-root}" --password "${MONGO_INITDB_ROOT_PASSWORD:-example}" --db "${MONGO_INITDB_DATABASE:-admin}"'
      ]
    };
  }
  if (normalized === "redis") {
    return {
      destinationPath: "/data/dump.rdb"
    };
  }
  if (normalized === "sqlite") {
    return {
      destinationPath: "/data/loom.db"
    };
  }
  return null;
}
async function backupServiceToFile(projectName, serviceName, service, outputPath) {
  return backupServiceToFileWithDependencies(projectName, serviceName, service, outputPath);
}
async function backupServiceToFileWithDependencies(projectName, serviceName, service, outputPath, dependencies2 = {}) {
  const strategy = databaseBackupStrategy(service.type);
  if (!strategy) {
    throw new Error(
      `Service type '${service.type}' does not currently support 'loom backup'. Supported types: mysql, mariadb, postgres, mongodb, redis, sqlite, sqlserver.`
    );
  }
  const name = containerName(projectName, serviceName);
  const isContainerRunningByName = dependencies2.isContainerRunningByName ?? isContainerRunning;
  const makeDirectory = dependencies2.makeDirectory ?? mkdir2;
  const createOutputStream = dependencies2.createOutputStream ?? createWriteStream;
  const spawnBackupProcess = dependencies2.spawnBackupProcess ?? ((containerNameValue, command) => spawn2("podman", ["exec", "-i", containerNameValue, ...command], {
    stdio: ["ignore", "pipe", "pipe"]
  }));
  const running = await isContainerRunningByName(name);
  if (!running) {
    throw new Error(`Service '${serviceName}' is not running. Start it before creating a backup.`);
  }
  await makeDirectory(dirname2(outputPath), { recursive: true });
  await new Promise((resolve14, reject) => {
    const child = spawnBackupProcess(name, strategy.command);
    const target = createOutputStream(outputPath);
    let stderr = "";
    let childExited = false;
    let streamFinished = false;
    let completed = false;
    const finish = (error) => {
      if (completed) {
        return;
      }
      completed = true;
      if (error) {
        reject(error);
        return;
      }
      resolve14();
    };
    const maybeResolve = () => {
      if (childExited && streamFinished) {
        finish();
      }
    };
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", () => {
      target.destroy();
      finish(new Error(`Failed to run backup command for '${serviceName}'.`));
    });
    target.on("error", () => {
      child.kill();
      finish(new Error(`Failed to write backup file '${outputPath}'.`));
    });
    target.on("finish", () => {
      streamFinished = true;
      maybeResolve();
    });
    child.stdout.pipe(target);
    child.on("close", (code) => {
      if (code === 0) {
        childExited = true;
        maybeResolve();
        return;
      }
      finish(
        new Error(
          `Backup failed for service '${serviceName}': ${stderr.trim() || "unknown error"}`
        )
      );
    });
  });
}
async function restoreServiceFromFile(projectName, serviceName, service, inputPath) {
  return restoreServiceFromFileWithDependencies(projectName, serviceName, service, inputPath);
}
async function restoreServiceFromFileWithDependencies(projectName, serviceName, service, inputPath, dependencies2 = {}) {
  const strategy = databaseRestoreStrategy(service.type);
  if (!strategy) {
    throw new Error(
      `Service type '${service.type}' does not currently support 'loom restore'. Supported types: ${SUPPORTED_RESTORE_SERVICE_TYPES.join(", ")}.`
    );
  }
  const name = containerName(projectName, serviceName);
  const isContainerRunningByName = dependencies2.isContainerRunningByName ?? isContainerRunning;
  const ensureInputReadable = dependencies2.ensureInputReadable ?? ((path) => access2(path, constants2.R_OK));
  const prepareRestoreInput = dependencies2.prepareRestoreInput ?? prepareRestoreInputForService;
  const runPodmanCommand = dependencies2.runPodmanCommand ?? runPodman;
  const running = await isContainerRunningByName(name);
  if (strategy.command && !running) {
    throw new Error(`Service '${serviceName}' is not running. Start it before restoring a backup.`);
  }
  await ensureInputReadable(inputPath);
  const preparedInput = await prepareRestoreInput(service.type, inputPath);
  try {
    const copyResult = await runPodmanCommand(["cp", preparedInput.path, `${name}:${strategy.destinationPath}`]);
    if (!copyResult.ok) {
      throw new Error(
        `Restore failed for service '${serviceName}' while copying '${inputPath}' into the container: ${copyResult.stderr || copyResult.stdout || "unknown error"}`
      );
    }
    if (!strategy.command) {
      return;
    }
    const restoreResult = await runPodmanCommand(["exec", name, ...strategy.command]);
    if (!restoreResult.ok) {
      throw new Error(
        `Restore failed for service '${serviceName}': ${restoreResult.stderr || restoreResult.stdout || "unknown error"}`
      );
    }
  } finally {
    await preparedInput.cleanup?.();
  }
}

// ../../packages/runtime-podman/src/lifecycle.ts
function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
function resolveRegistryHost(image) {
  const normalizedImage = normalizeImage(image);
  const [registryHost] = normalizedImage.split("/");
  return registryHost || "docker.io";
}
function buildRegistryLoginHint(image) {
  const registryHost = resolveRegistryHost(image);
  return ` Try 'podman login ${registryHost}' and verify that the image tag exists and your account can access it.`;
}
function isRegistryAuthError(detail) {
  return /(pull access denied|requested access to the resource is denied|authentication required|unauthorized|denied: requested access|insufficient_scope)/i.test(
    detail
  );
}
function isImageUnavailableError(detail) {
  return /(manifest unknown|image not known|unable to pull|error locating image|repository does not exist)/i.test(
    detail
  );
}
function isMissingBindMountSourceError(detail) {
  return /(cannot stat .* no such file or directory|no such file or directory: oci runtime attempted to invoke a command that was not found)/i.test(
    detail
  );
}
function formatContainerRunError(name, image, detail) {
  const normalizedDetail = detail.trim() || "unknown error";
  if (isRegistryAuthError(normalizedDetail)) {
    return `Failed to run container '${name}' because image '${image}' requires registry access or authentication: ${normalizedDetail}${buildRegistryLoginHint(image)}`;
  }
  if (isImageUnavailableError(normalizedDetail)) {
    return `Failed to run container '${name}' because image '${image}' is not available or could not be pulled: ${normalizedDetail}`;
  }
  return `Failed to run container '${name}': ${normalizedDetail}`;
}
function buildExecArgs(containerNameValue, command, interactiveTerminal, execUser, workdir) {
  if (command.length === 0) {
    throw new Error("Command required for loom exec.");
  }
  const ttyArgs = interactiveTerminal ? ["-it"] : [];
  const workdirArgs = workdir ? ["-w", workdir] : [];
  const userArgs = execUser ? ["--user", execUser] : [];
  return ["exec", ...ttyArgs, ...workdirArgs, ...userArgs, containerNameValue, ...command];
}
async function ensureServiceStarted(projectName, serviceName, service, networkName) {
  return ensureServiceStartedWithDependencies(projectName, serviceName, service, networkName);
}
async function ensureServiceStartedWithDependencies(projectName, serviceName, service, networkName, dependencies2 = {}) {
  const isContainerRunningByName = dependencies2.isContainerRunningByName ?? isContainerRunning;
  const containerExistsByName = dependencies2.containerExistsByName ?? containerExists;
  const inspectContainerImageByName = dependencies2.inspectContainerImageByName ?? inspectContainerImage;
  const inspectContainerLabelByName = dependencies2.inspectContainerLabelByName ?? inspectContainerLabel;
  const removeContainerByName = dependencies2.removeContainerByName ?? removeContainer;
  const startContainerByName = dependencies2.startContainerByName ?? startContainer;
  const buildRunArgs = dependencies2.buildRunArgs ?? buildPodmanRunArgs;
  const runPodmanCommand = dependencies2.runPodmanCommand ?? runPodman;
  const name = containerName(projectName, serviceName);
  const expectedImage = normalizeImage(service.image);
  const expectedServiceHash = serviceConfigHash(service);
  const running = await isContainerRunningByName(name);
  if (running) {
    return;
  }
  if (await containerExistsByName(name)) {
    const currentImage = await inspectContainerImageByName(name);
    const currentServiceHash = await inspectContainerLabelByName(name, "loom.service-hash");
    if (currentImage && currentImage !== expectedImage || !currentServiceHash || currentServiceHash !== expectedServiceHash) {
      await removeContainerByName(name);
    } else {
      try {
        await startContainerByName(name);
        return;
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        if (!isMissingBindMountSourceError(detail)) {
          throw error;
        }
        await removeContainerByName(name);
      }
    }
  }
  const args = await buildRunArgs(
    serviceName,
    name,
    service,
    networkName,
    expectedImage,
    expectedServiceHash
  );
  const runResult = await runPodmanCommand(args);
  if (!runResult.ok) {
    throw new Error(formatContainerRunError(name, service.image, runResult.stderr));
  }
}
async function stopService(projectName, serviceName) {
  const name = containerName(projectName, serviceName);
  const exists = await runPodman(["container", "exists", name]);
  if (!exists.ok) {
    return;
  }
  const stop = await runPodman(["stop", name]);
  if (!stop.ok) {
    throw new Error(`Failed to stop container '${name}': ${stop.stderr || "unknown error"}`);
  }
}
async function tailServiceLogs(projectName, serviceName, follow) {
  const name = containerName(projectName, serviceName);
  const args = ["logs", ...follow ? ["-f"] : [], name];
  const code = await runPodmanInherit(args);
  if (code !== 0) {
    throw new Error(`Failed to fetch logs for '${name}'.`);
  }
}
async function execServiceCommand(projectName, serviceName, command, execUser, workdir) {
  const name = containerName(projectName, serviceName);
  const args = buildExecArgs(name, command, isInteractiveTerminal(), execUser, workdir);
  const code = await runPodmanInherit(args);
  if (code !== 0) {
    throw new Error(`Failed to exec in '${name}'.`);
  }
}
function formatStoppedComposerContainerError(name, serviceName, state) {
  const stateDetail = state ? ` (state: ${state})` : "";
  return new Error(
    `Container '${name}' is not running${stateDetail}, so Composer could not be ensured. Check 'loom logs ${serviceName} --no-follow' for the startup failure.`
  );
}
async function ensureComposerAvailable(projectName, serviceName) {
  return ensureComposerAvailableWithDependencies(projectName, serviceName);
}
async function ensureComposerAvailableWithDependencies(projectName, serviceName, dependencies2 = {}) {
  const name = containerName(projectName, serviceName);
  const inspectContainerByName = dependencies2.inspectContainerByName ?? inspectContainer;
  const runPodmanCommand = dependencies2.runPodmanCommand ?? runPodman;
  const info = await inspectContainerByName(name);
  if (!info) {
    throw new Error(`Container '${name}' not found while ensuring Composer.`);
  }
  if (!info.running) {
    throw formatStoppedComposerContainerError(name, serviceName, info.state);
  }
  const result2 = await runPodmanCommand([
    "exec",
    name,
    "sh",
    "-c",
    `command -v composer >/dev/null 2>&1 || (EXPECTED_SIGNATURE=$(php -r "copy('https://composer.github.io/installer.sig', 'php://stdout');") && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && ACTUAL_SIGNATURE=$(php -r "echo hash_file('sha384', 'composer-setup.php');") && [ "$EXPECTED_SIGNATURE" = "$ACTUAL_SIGNATURE" ] && php composer-setup.php --install-dir=/usr/local/bin --filename=composer && rm -f composer-setup.php)`
  ]);
  if (!result2.ok) {
    if (/can only create exec sessions on running containers|container state improper/i.test(result2.stderr)) {
      const latestInfo = await inspectContainerByName(name);
      if (!latestInfo) {
        throw new Error(`Container '${name}' disappeared during composer check: ${result2.stderr || "unknown error"}`);
      }
      if (!latestInfo.running) {
        throw formatStoppedComposerContainerError(name, serviceName, latestInfo.state);
      }
    }
    throw new Error(`Failed to ensure Composer in '${name}': ${result2.stderr || "unknown error"}`);
  }
}

// ../../packages/runtime-podman/src/machine.ts
async function detectPodmanCapabilities() {
  return detectPodmanCapabilitiesWithDependencies();
}
async function detectPodmanCapabilitiesWithDependencies(dependencies2 = {}) {
  const platform = dependencies2.platform ?? process.platform;
  const runPodmanCommand = dependencies2.runPodmanCommand ?? runPodman;
  const versionResult = await runPodmanCommand(["version", "--format", "{{.Version}}"]);
  if (!versionResult.ok) {
    return {
      available: false,
      rootless: false,
      machine: {
        supported: platform !== "linux",
        running: false
      }
    };
  }
  const rootlessResult = await runPodmanCommand(["info", "--format", "{{.Host.Security.Rootless}}"]);
  const rootless = rootlessResult.ok ? rootlessResult.stdout.toLowerCase() === "true" : false;
  const machineSupported = platform !== "linux";
  let machineRunning = false;
  if (machineSupported) {
    const machineResult = await runPodmanCommand(["machine", "inspect", "--format", "{{.State}}"]);
    machineRunning = machineResult.ok && machineResult.stdout.toLowerCase().includes("running");
  }
  return {
    available: true,
    version: versionResult.stdout,
    rootless,
    machine: {
      supported: machineSupported,
      running: machineRunning
    }
  };
}
async function ensureMachineRunning(managed) {
  return ensureMachineRunningWithDependencies(managed);
}
async function ensureMachineRunningWithDependencies(managed, dependencies2 = {}) {
  const platform = dependencies2.platform ?? process.platform;
  const runPodmanCommand = dependencies2.runPodmanCommand ?? runPodman;
  const detectCapabilities = dependencies2.detectCapabilities ?? (() => detectPodmanCapabilitiesWithDependencies({ platform, runPodmanCommand }));
  if (platform === "linux") {
    return;
  }
  const capabilities = await detectCapabilities();
  if (!capabilities.available) {
    throw new Error("Podman is not available on PATH. Install Podman first.");
  }
  if (!capabilities.machine.supported) {
    return;
  }
  if (capabilities.machine.running) {
    return;
  }
  if (!managed) {
    throw new Error("Podman Machine is not running. Start it or set runtime.machine.managed=true.");
  }
  const startResult = await runPodmanCommand(["machine", "start"]);
  if (!startResult.ok) {
    const initResult = await runPodmanCommand(["machine", "init"]);
    if (!initResult.ok) {
      throw new Error(`Unable to initialize Podman Machine: ${initResult.stderr || "unknown error"}`);
    }
    const retryStart = await runPodmanCommand(["machine", "start"]);
    if (!retryStart.ok) {
      throw new Error(`Unable to start Podman Machine: ${retryStart.stderr || "unknown error"}`);
    }
  }
}

// ../../packages/runtime-podman/src/readiness.ts
import { Socket } from "node:net";
function sleep(ms) {
  return new Promise((resolve14) => setTimeout(resolve14, ms));
}
async function isPortOpen(port, timeoutMs) {
  return new Promise((resolve14) => {
    const socket = new Socket();
    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      cleanup();
      resolve14(true);
    });
    socket.once("timeout", () => {
      cleanup();
      resolve14(false);
    });
    socket.once("error", () => {
      cleanup();
      resolve14(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}
async function arePortsReachable(ports, timeoutMs) {
  if (ports.length === 0) {
    return false;
  }
  const results = await Promise.all(ports.map((port) => isPortOpen(port, timeoutMs)));
  return results.every(Boolean);
}
async function waitForServiceReady(projectName, serviceName, options) {
  return waitForServiceReadyWithDependencies(projectName, serviceName, options);
}
async function waitForServiceReadyWithDependencies(projectName, serviceName, options, dependencies2 = {}) {
  const inspectContainerByName = dependencies2.inspectContainerByName ?? inspectContainer;
  const delay = dependencies2.sleep ?? sleep;
  const portsReachable = dependencies2.arePortsReachable ?? arePortsReachable;
  const now = dependencies2.now ?? Date.now;
  const name = containerName(projectName, serviceName);
  const {
    startPeriodSeconds = 0,
    intervalSeconds = 2,
    progressIntervalSeconds = 15,
    retries = 30,
    timeoutSeconds = 2,
    ports = [],
    command
  } = options ?? {};
  const startPeriodMs = startPeriodSeconds * 1e3;
  const intervalMs = Math.max(intervalSeconds * 1e3, 100);
  const progressIntervalMs = Math.max(progressIntervalSeconds * 1e3, intervalMs);
  const graceAttempts = Math.ceil(startPeriodMs / intervalMs);
  const maxAttempts = Math.max(retries + graceAttempts, 1);
  const timeoutMs = Math.max(startPeriodMs + retries * intervalMs, 6e4);
  const probeTimeoutMs = timeoutSeconds * 1e3;
  const hostPorts = parseHostPorts(ports);
  const hasExplicitReadinessProbe = Boolean(command) || hostPorts.length > 0;
  const stableRunningChecksRequired = hasExplicitReadinessProbe ? 1 : 2;
  let stableRunningChecks = 0;
  let attempts = 0;
  const startedAt = now();
  let lastProgressAt = startedAt - progressIntervalMs;
  while (attempts < maxAttempts && now() - startedAt <= timeoutMs) {
    attempts += 1;
    const info = await inspectContainerByName(name);
    if (!info) {
      throw new Error(`Container '${name}' not found while waiting for readiness.`);
    }
    if (!info.running) {
      throw new Error(
        `Container '${name}' exited before becoming ready. Check 'loom logs ${serviceName} --no-follow' for the startup failure.`
      );
    }
    stableRunningChecks += 1;
    const elapsedMs = now() - startedAt;
    const elapsedSeconds = Math.floor(elapsedMs / 1e3);
    const withinStartPeriod = elapsedMs < startPeriodMs;
    if (info.health) {
      if (info.health.toLowerCase() === "healthy") {
        return;
      }
      if (info.health.toLowerCase() === "unhealthy") {
        if (withinStartPeriod) {
          if (now() - lastProgressAt >= progressIntervalMs) {
            options?.onProgress?.({
              elapsedSeconds,
              detail: "healthcheck is still settling during startup grace period"
            });
            lastProgressAt = now();
          }
          await delay(intervalMs);
          continue;
        }
        throw new Error(`Container '${name}' reported unhealthy status.`);
      }
      if (now() - lastProgressAt >= progressIntervalMs) {
        options?.onProgress?.({
          elapsedSeconds,
          detail: `health: ${info.health.toLowerCase()}`
        });
        lastProgressAt = now();
      }
      await delay(intervalMs);
      continue;
    }
    if (hostPorts.length > 0) {
      const reachable = await portsReachable(hostPorts, probeTimeoutMs);
      if (reachable) {
        return;
      }
      if (now() - lastProgressAt >= progressIntervalMs) {
        options?.onProgress?.({
          elapsedSeconds,
          detail: `waiting for ports ${hostPorts.join(", ")} to accept connections`
        });
        lastProgressAt = now();
      }
      await delay(intervalMs);
      continue;
    }
    if (stableRunningChecks >= stableRunningChecksRequired) {
      return;
    }
    if (now() - lastProgressAt >= progressIntervalMs) {
      options?.onProgress?.({
        elapsedSeconds,
        detail: `container running; waiting for stability check ${stableRunningChecks}/${stableRunningChecksRequired}`
      });
      lastProgressAt = now();
    }
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for service '${serviceName}' to become ready.`);
}

// ../../packages/network/src/index.ts
import { mkdir as mkdir3, readFile as readFile2, rm as rm3, writeFile } from "node:fs/promises";
import { resolve as resolve3 } from "node:path";
function projectNetworkName(projectName) {
  return `loom-${projectName}`;
}
function windowsHostsFilePath() {
  const systemRoot = process.env.SystemRoot ?? "C:\\Windows";
  return process.env.LOOM_WINDOWS_HOSTS_FILE ?? resolve3(systemRoot, "System32", "drivers", "etc", "hosts");
}
function managedHostsStartMarker(projectName) {
  return `# >>> loom:${projectName}`;
}
function managedHostsEndMarker(projectName) {
  return `# <<< loom:${projectName}`;
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function removeManagedHostsBlock(content, projectName) {
  const start2 = escapeRegExp(managedHostsStartMarker(projectName));
  const end = escapeRegExp(managedHostsEndMarker(projectName));
  const blockPattern = new RegExp(`(?:^|\\n)${start2}\\n[\\s\\S]*?\\n${end}(?=\\n|$)`, "g");
  return content.replace(blockPattern, "").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n");
}
function renderManagedHostsBlock(projectName, hosts) {
  return [
    managedHostsStartMarker(projectName),
    ...hosts.map((host) => `127.0.0.1 ${host}`),
    managedHostsEndMarker(projectName)
  ].join("\n");
}
function applyManagedHostsEntries(content, projectName, hosts) {
  const withoutExistingBlock = removeManagedHostsBlock(content, projectName).trimEnd();
  if (hosts.length === 0) {
    return withoutExistingBlock ? `${withoutExistingBlock}
` : "";
  }
  const nextBlock = renderManagedHostsBlock(projectName, hosts);
  return withoutExistingBlock ? `${withoutExistingBlock}

${nextBlock}
` : `${nextBlock}
`;
}
function uniqueRouteHosts(bindings) {
  const managedHosts = [...new Set(bindings.map((binding) => binding.host).filter((host) => !host.startsWith("*.")))].sort();
  const skippedHosts = [...new Set(bindings.map((binding) => binding.host).filter((host) => host.startsWith("*.")))].sort();
  return { managedHosts, skippedHosts };
}
function assertSafeRouteHost(host) {
  const valid = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/.test(host);
  if (!valid) {
    throw new Error(`Route host '${host}' is invalid.`);
  }
}
function assertSafeServiceName(serviceName) {
  const valid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(serviceName);
  if (!valid) {
    throw new Error(`Service name '${serviceName}' is invalid for routing.`);
  }
}
function parsePublishedPort(portMapping) {
  const withoutProtocol = portMapping.split("/")[0]?.trim();
  if (!withoutProtocol) {
    return null;
  }
  const segments = withoutProtocol.split(":").map((segment) => segment.trim());
  if (segments.length < 2) {
    return null;
  }
  const host = Number(segments[segments.length - 2]);
  const container = Number(segments[segments.length - 1]);
  if (!Number.isFinite(host) || !Number.isFinite(container) || host <= 0 || container <= 0) {
    return null;
  }
  return { host, container };
}
function resolveRouteBindings(config) {
  return (config.routes ?? []).map((route) => {
    assertSafeRouteHost(route.host);
    assertSafeServiceName(route.service);
    const service = config.services[route.service];
    if (!service) {
      throw new Error(`Route references unknown service '${route.service}'.`);
    }
    const mappedPort = (service.ports ?? []).map((port) => parsePublishedPort(port)).find((mapping) => mapping?.container === route.port);
    const externalPort = mappedPort ? mappedPort.host : route.port;
    return {
      host: route.host,
      service: route.service,
      targetPort: route.port,
      externalPort,
      https: route.https ?? true
    };
  });
}
async function ensureServiceNetwork(config) {
  const network = projectNetworkName(config.name);
  await ensurePodmanNetwork(network);
  return network;
}
var SHARED_PROXY = "loom-proxy";
var PROXY_SITES_DIR = "/etc/caddy/sites";
function proxyContainerName() {
  return SHARED_PROXY;
}
function buildProjectCaddyfile(bindings, certPath, keyPath) {
  return bindings.map((binding) => {
    const scheme = binding.https ? "https" : "http";
    const tlsConfig = binding.https ? `
  tls ${certPath} ${keyPath}` : "";
    return `${scheme}://${binding.host} {
  reverse_proxy ${binding.service}:${binding.targetPort}${tlsConfig}
}`;
  }).join("\n\n");
}
function buildMainCaddyfile() {
  return `{
  auto_https off
}
import ${PROXY_SITES_DIR}/*
`;
}
async function writeSharedProxyConfig(projectName, bindings, certPath, keyPath, networkDir) {
  await mkdir3(networkDir, { recursive: true });
  const projectFile = resolve3(networkDir, `${projectName}.Caddyfile`);
  const mainFile = resolve3(networkDir, "Caddyfile");
  if (bindings.length > 0) {
    await writeFile(projectFile, buildProjectCaddyfile(bindings, certPath, keyPath), "utf-8");
  } else {
    try {
      await rm3(projectFile, { force: true });
    } catch {
    }
  }
  await writeFile(mainFile, buildMainCaddyfile(), "utf-8");
}
async function ensureRouteProxy(config, bindings, certPaths, networkName, hostHttpPort = 8080, hostHttpsPort = 8443) {
  const runDir = resolve3(process.cwd(), ".loom", "network");
  const mountedCertPath = "/certs/tls.crt";
  const mountedKeyPath = "/certs/tls.key";
  const container = proxyContainerName();
  await writeSharedProxyConfig(config.name, bindings, mountedCertPath, mountedKeyPath, runDir);
  const exists = await runPodman(["container", "exists", container]);
  if (!exists.ok) {
    const start2 = await runPodman([
      "run",
      "-d",
      "--name",
      container,
      "--network",
      networkName,
      "-p",
      `${hostHttpPort}:80`,
      "-p",
      `${hostHttpsPort}:443`,
      "-v",
      `${runDir}:/etc/caddy/sites:ro`,
      "-v",
      `${certPaths.certPath}:${mountedCertPath}:ro`,
      "-v",
      `${certPaths.keyPath}:${mountedKeyPath}:ro`,
      "docker.io/library/caddy:2-alpine",
      "caddy",
      "run",
      "--config",
      "/etc/caddy/sites/Caddyfile",
      "--adapter",
      "caddyfile"
    ]);
    if (!start2.ok) {
      throw new Error(`Failed to start route proxy container '${container}': ${start2.stderr || "unknown error"}`);
    }
  }
  return {
    containerName: container,
    httpPort: hostHttpPort,
    httpsPort: hostHttpsPort
  };
}
async function ensureRouteHosts(projectName, bindings) {
  const result2 = uniqueRouteHosts(bindings);
  const hostsPath = process.platform === "win32" ? windowsHostsFilePath() : "/etc/hosts";
  try {
    const currentContent = await readFile2(hostsPath, "utf-8");
    const nextContent = applyManagedHostsEntries(currentContent, projectName, result2.managedHosts);
    if (nextContent !== currentContent) {
      await writeFile(hostsPath, nextContent, "utf-8");
    }
    return result2;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Warning: Failed to write hosts file (${message})
`);
    return { managedHosts: [], skippedHosts: result2.skippedHosts, pendingHosts: result2.managedHosts };
  }
}
async function stopRouteProxy(projectName) {
  const runDir = resolve3(process.cwd(), ".loom", "network");
  const projectFile = resolve3(runDir, `${projectName}.Caddyfile`);
  try {
    await rm3(projectFile, { force: true });
  } catch {
  }
  const mainFile = resolve3(runDir, "Caddyfile");
  try {
    await writeFile(mainFile, buildMainCaddyfile(), "utf-8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
async function stopRouteHosts(projectName) {
  const hostsPath = process.platform === "win32" ? windowsHostsFilePath() : "/etc/hosts";
  try {
    const currentContent = await readFile2(hostsPath, "utf-8");
    const nextContent = removeManagedHostsBlock(currentContent, projectName);
    if (nextContent !== currentContent) {
      await writeFile(hostsPath, nextContent, "utf-8");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Warning: Failed to clean hosts file (${message})
`);
  }
}

// ../../packages/https/src/index.ts
import { mkdir as mkdir4, writeFile as writeFile2, access as access3 } from "node:fs/promises";
import { resolve as resolve4 } from "node:path";
import { constants as constants3 } from "node:fs";
import { spawn as spawn3 } from "node:child_process";
function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn3(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", () => {
      reject(new Error(`Failed to run ${command}.`));
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(stderr.trim() || `${command} exited with code ${code ?? 1}`));
    });
  });
}
async function ensureLocalCertificates(projectName, hosts) {
  const certDir = resolve4(process.cwd(), ".loom", "certs");
  await mkdir4(certDir, { recursive: true });
  const certPath = resolve4(certDir, `${projectName}.crt`);
  const keyPath = resolve4(certDir, `${projectName}.key`);
  try {
    await access3(certPath, constants3.F_OK);
    await access3(keyPath, constants3.F_OK);
    return { certPath, keyPath };
  } catch {
    const configPath = resolve4(certDir, `${projectName}.openssl.cnf`);
    const uniqueHosts = Array.from(new Set(hosts));
    const sanEntries = uniqueHosts.map((host, index) => `DNS.${index + 1} = ${host}`).join("\n");
    const opensslConfig = `[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
CN = ${projectName}.loom.local

[v3_req]
subjectAltName = @alt_names

[alt_names]
${sanEntries}
`;
    await writeFile2(configPath, opensslConfig, "utf-8");
    await run("openssl", [
      "req",
      "-x509",
      "-nodes",
      "-days",
      "365",
      "-newkey",
      "rsa:2048",
      "-keyout",
      keyPath,
      "-out",
      certPath,
      "-config",
      configPath,
      "-extensions",
      "v3_req"
    ]);
    return { certPath, keyPath };
  }
}

// ../../packages/core/src/dependencies.ts
var defaultOrchestratorDependencies = {
  backupExtensionForServiceType,
  backupServiceToFile,
  restoreServiceFromFile,
  supportedBackupServiceTypes: SUPPORTED_BACKUP_SERVICE_TYPES,
  supportedRestoreServiceTypes: SUPPORTED_RESTORE_SERVICE_TYPES,
  containerName,
  detectPodmanCapabilities,
  ensureComposerAvailable,
  ensureLocalCertificates,
  ensureMachineRunning,
  ensureRouteHosts,
  ensureRouteProxy,
  ensureServiceNetwork,
  ensureServiceStarted,
  execServiceCommand,
  inspectContainer,
  isContainerRunning,
  listProjectContainers,
  removeContainer,
  resolveRouteBindings,
  stopRouteHosts,
  stopRouteProxy,
  stopService,
  tailServiceLogs,
  waitForServiceReady
};

// ../../packages/core/src/backup.ts
import { resolve as resolve5 } from "node:path";

// ../../packages/core/src/utils.ts
function levenshteinDistance(a, b) {
  const matrix = Array.from(
    { length: a.length + 1 },
    () => Array.from({ length: b.length + 1 }, () => 0)
  );
  for (let index = 0; index <= a.length; index += 1) {
    matrix[index][0] = index;
  }
  for (let index = 0; index <= b.length; index += 1) {
    matrix[0][index] = index;
  }
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }
  return matrix[a.length][b.length];
}
function closestServiceName(target, candidates) {
  if (candidates.length === 0) {
    return void 0;
  }
  const scored = candidates.map((candidate) => ({
    candidate,
    score: levenshteinDistance(target.toLowerCase(), candidate.toLowerCase())
  })).sort((left, right) => left.score - right.score);
  const best = scored[0];
  const threshold = Math.max(2, Math.ceil(target.length * 0.4));
  return best.score <= threshold ? best.candidate : void 0;
}
function dependencyOrder(config) {
  const visited = /* @__PURE__ */ new Set();
  const temp = /* @__PURE__ */ new Set();
  const ordered = [];
  const visit = (serviceName) => {
    if (visited.has(serviceName)) {
      return;
    }
    if (temp.has(serviceName)) {
      throw new Error(`Circular dependency detected at service '${serviceName}'.`);
    }
    const service = config.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service '${serviceName}' in dependency graph.`);
    }
    temp.add(serviceName);
    for (const dependency of service.dependsOn ?? []) {
      visit(dependency);
    }
    temp.delete(serviceName);
    visited.add(serviceName);
    ordered.push(serviceName);
  };
  for (const serviceName of Object.keys(config.services)) {
    visit(serviceName);
  }
  return ordered;
}

// ../../packages/core/src/services.ts
function getConfiguredService(config, serviceName) {
  return config.services[serviceName];
}
async function buildServiceNotFoundError(config, serviceName, listProjectContainersByProject) {
  const availableServices = Object.keys(config.services).sort();
  const containers = await listProjectContainersByProject(config.name);
  const runningServices = containers.filter((container) => container.running).map((container) => container.name.replace(new RegExp(`^${config.name}-`), "")).filter((name) => config.services[name]).sort();
  const availableMessage = availableServices.length > 0 ? availableServices.join(", ") : "none";
  const runningMessage = runningServices.length > 0 ? runningServices.join(", ") : "none";
  const closestMatch = closestServiceName(serviceName, availableServices);
  const suggestion = closestMatch ? ` Did you mean '${closestMatch}'?` : "";
  return new Error(
    `Service '${serviceName}' is not defined in loom.yaml.${suggestion} Available services: ${availableMessage}. Running services: ${runningMessage}.`
  );
}
async function requireConfiguredService(config, serviceName, listProjectContainersByProject) {
  const service = getConfiguredService(config, serviceName);
  if (service) {
    return service;
  }
  throw await buildServiceNotFoundError(config, serviceName, listProjectContainersByProject);
}

// ../../packages/core/src/backup.ts
function listBackupSupportedServices(config, backupExtensionForServiceType2) {
  return Object.entries(config.services).filter(
    ([, service]) => Boolean(backupExtensionForServiceType2(service.type))
  );
}
function requireBackupExtension(serviceName, serviceType, supportedBackupServiceTypes, backupExtensionForServiceType2) {
  const extension = backupExtensionForServiceType2(serviceType);
  if (!extension) {
    throw new Error(
      `Service '${serviceName}' has type '${serviceType}', which is not currently supported by 'loom backup'. Supported types: ${supportedBackupServiceTypes.join(", ")}.`
    );
  }
  return extension;
}
function resolveBackupOutputPath(projectRoot, projectName, serviceName, extension, outputPath, now = /* @__PURE__ */ new Date()) {
  if (outputPath) {
    return resolve5(projectRoot, outputPath);
  }
  const timestamp = now.toISOString().replace(/[:]/g, "-");
  return resolve5(
    projectRoot,
    ".loom",
    "backups",
    `${projectName}-${serviceName}-${timestamp}.${extension}`
  );
}
async function backupConfiguredService(config, projectRoot, serviceName, dependencies2, outputPath) {
  const service = await requireConfiguredService(
    config,
    serviceName,
    dependencies2.listProjectContainers
  );
  const extension = requireBackupExtension(
    serviceName,
    service.type,
    dependencies2.supportedBackupServiceTypes,
    dependencies2.backupExtensionForServiceType
  );
  const finalPath = resolveBackupOutputPath(
    projectRoot,
    config.name,
    serviceName,
    extension,
    outputPath
  );
  await dependencies2.backupServiceToFile(config.name, serviceName, service, finalPath);
  return finalPath;
}
async function backupAllConfiguredServices(config, projectRoot, dependencies2) {
  const supported = listBackupSupportedServices(config, dependencies2.backupExtensionForServiceType);
  if (supported.length === 0) {
    throw new Error(
      `No backup-supported services found in loom.yaml. Supported types: ${dependencies2.supportedBackupServiceTypes.join(", ")}.`
    );
  }
  const results = [];
  for (const [serviceName] of supported) {
    const path = await backupConfiguredService(
      config,
      projectRoot,
      serviceName,
      dependencies2
    );
    results.push({ service: serviceName, path });
  }
  return results;
}

// ../../packages/core/src/restore.ts
import { resolve as resolve6 } from "node:path";
function resolveRestoreInputPath(projectRoot, inputPath) {
  return resolve6(projectRoot, inputPath);
}
function requireRestoreSupport(serviceName, serviceType, supportedRestoreServiceTypes) {
  const normalizedType = serviceType.toLowerCase();
  if (normalizedType === "sqlserver" || normalizedType === "mssql") {
    throw new Error(
      `Service '${serviceName}' has type '${serviceType}', but SQL Server restore is not yet supported by 'loom restore'. The current SQL Server backup format is a live .bak of 'master', which is not safely restorable through the running container flow Loom uses today.`
    );
  }
  if (supportedRestoreServiceTypes.includes(normalizedType)) {
    return;
  }
  throw new Error(
    `Service '${serviceName}' has type '${serviceType}', which is not currently supported by 'loom restore'. Supported types: ${supportedRestoreServiceTypes.join(", ")}.`
  );
}
async function restoreConfiguredService(config, projectRoot, serviceName, inputPath, dependencies2) {
  const service = await requireConfiguredService(
    config,
    serviceName,
    dependencies2.listProjectContainers
  );
  requireRestoreSupport(serviceName, service.type, dependencies2.supportedRestoreServiceTypes);
  const finalInputPath = resolveRestoreInputPath(projectRoot, inputPath);
  if (service.type.toLowerCase() === "redis") {
    await dependencies2.stopService(config.name, serviceName);
    await dependencies2.restoreServiceFromFile(config.name, serviceName, service, finalInputPath);
    const networkName = await dependencies2.ensureServiceNetwork(config);
    await dependencies2.ensureServiceStarted(config.name, serviceName, service, networkName);
    await dependencies2.waitForServiceReady(config.name, serviceName, {
      ...service.healthcheck,
      ports: service.ports,
      progressIntervalSeconds: 15
    });
    return finalInputPath;
  }
  await dependencies2.restoreServiceFromFile(config.name, serviceName, service, finalInputPath);
  return finalInputPath;
}

// ../../packages/core/src/output.ts
function isTransientWaitingMessage(message) {
  return /^- waiting for .+ readiness \(.+\)\n$/.test(message);
}
function createOrchestratorOutput(streams = { stdout: process.stdout, stderr: process.stderr }) {
  let pendingInlineStatus = false;
  function flushInlineStatus() {
    if (!pendingInlineStatus) {
      return;
    }
    streams.stdout.write("\n");
    pendingInlineStatus = false;
  }
  return {
    writeOut(message) {
      if (streams.stdout.isTTY && isTransientWaitingMessage(message)) {
        streams.stdout.write(`\x1B[2K\r${message.trimEnd()}`);
        pendingInlineStatus = true;
        return;
      }
      flushInlineStatus();
      streams.stdout.write(message);
    },
    writeErr(message) {
      flushInlineStatus();
      streams.stderr.write(message);
    }
  };
}
var defaultOrchestratorOutput = createOrchestratorOutput();

// ../../packages/core/src/lifecycle.ts
async function stopProjectResources(projectName, order, options = {}) {
  const stopServiceByName = options.stopServiceByName ?? defaultOrchestratorDependencies.stopService;
  const stopRouteProxyByProject = options.stopRouteProxyByProject ?? defaultOrchestratorDependencies.stopRouteProxy;
  const stopRouteHostsByProject = options.stopRouteHostsByProject ?? defaultOrchestratorDependencies.stopRouteHosts;
  const writeOut = options.writeOut ?? process.stdout.write.bind(process.stdout);
  const writeErr = options.writeErr ?? process.stderr.write.bind(process.stderr);
  const errors = [];
  for (const serviceName of order) {
    try {
      await stopServiceByName(projectName, serviceName);
      writeOut(`- stopped ${serviceName}
`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`service '${serviceName}': ${message}`);
      writeErr(`- failed stopping ${serviceName}: ${message}
`);
    }
  }
  try {
    await stopRouteProxyByProject(projectName);
    writeOut("- stopped route proxy\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`route proxy: ${message}`);
    writeErr(`- failed stopping route proxy: ${message}
`);
  }
  try {
    await stopRouteHostsByProject(projectName);
    writeOut("- cleaned route hosts\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`route hosts: ${message}`);
    writeErr(`- failed cleaning route hosts: ${message}
`);
  }
  if (errors.length > 0) {
    throw new Error(`One or more resources failed to stop: ${errors.join(" | ")}`);
  }
}

// ../../packages/core/src/status.ts
async function buildLoomStatus(config, dependencies2) {
  const capabilities = await dependencies2.detectPodmanCapabilities();
  const routes = dependencies2.resolveRouteBindings(config);
  const httpsHosts = routes.filter((route) => route.https).map((route) => route.host);
  const https = httpsHosts.length > 0 ? await dependencies2.ensureLocalCertificates(config.name, httpsHosts) : void 0;
  return {
    project: config.name,
    podman: {
      available: capabilities.available,
      version: capabilities.version,
      rootless: capabilities.rootless,
      machineRunning: capabilities.machine.running
    },
    services: await Promise.all(
      Object.entries(config.services).map(async ([name, service]) => {
        const container = dependencies2.containerName(config.name, name);
        const inspected = await dependencies2.inspectContainer(container);
        return {
          name,
          image: service.image,
          container,
          running: await dependencies2.isContainerRunning(container),
          state: inspected?.state,
          health: inspected?.health
        };
      })
    ),
    routes: routes.map((route) => ({
      host: route.host,
      target: `${route.service}:${route.targetPort}`,
      https: route.https
    })),
    https,
    proxy: routes.length > 0 ? { httpPort: 8080, httpsPort: 8443 } : void 0
  };
}

// ../../packages/core/src/startup.ts
function formatStartupNotice() {
  return "Note: Startup may take a few minutes while Loom downloads images and installs dependencies. Starts using cached resources are usually faster.\n";
}
function formatStartHeader(projectName, serviceCount, networkName) {
  return `Starting ${serviceCount} service(s) for ${projectName} on network ${networkName}...
`;
}
function formatStartedService(serviceName) {
  return `- started ${serviceName}
`;
}
function formatWaitingService(serviceName, detail, elapsedSeconds) {
  return `- waiting for ${serviceName} readiness (${detail}, ${elapsedSeconds}s elapsed)
`;
}
function formatRouteBindings(routeBindings, proxyPorts) {
  if (routeBindings.length === 0) {
    return [];
  }
  return [
    "Route bindings:\n",
    ...routeBindings.map((binding) => {
      const protocol = binding.https ? "https" : "http";
      const proxyPort = proxyPorts ? binding.https ? proxyPorts.https : proxyPorts.http : void 0;
      const hostUrl = proxyPort ? `${protocol}://${binding.host}:${proxyPort}` : `${protocol}://${binding.host}`;
      const directProtocol = binding.targetPort === 443 ? "https" : "http";
      return `- ${hostUrl} -> ${binding.service}:${binding.targetPort} (direct: ${directProtocol}://localhost:${binding.externalPort}/)
`;
    })
  ];
}
function formatProxyPorts(httpPort, httpsPort) {
  return `Route proxy listener ports: http://localhost:${httpPort} https://localhost:${httpsPort} (use with configured route hostnames)
`;
}
function formatHttpsInfo(httpsInfo) {
  if (!httpsInfo) {
    return [];
  }
  return [
    `HTTPS cert: ${httpsInfo.certPath}
`,
    `HTTPS key: ${httpsInfo.keyPath}
`
  ];
}
function formatBrowserUrl(routeBindings, proxyPorts) {
  if (routeBindings.length === 0) {
    return [];
  }
  return routeBindings.map((binding) => {
    const protocol = binding.https ? "https" : "http";
    const proxyPort = proxyPorts ? binding.https ? proxyPorts.https : proxyPorts.http : void 0;
    const url = proxyPort ? `${protocol}://${binding.host}:${proxyPort}` : `${protocol}://${binding.host}`;
    return `
\u2192 Open ${url} in your browser
`;
  });
}

// ../../packages/core/src/https.ts
async function resolveHttpsInfo(projectName, routeBindings, ensureLocalCertificates2) {
  const httpsHosts = routeBindings.filter((binding) => binding.https).map((binding) => binding.host);
  if (httpsHosts.length === 0) {
    return void 0;
  }
  return ensureLocalCertificates2(projectName, httpsHosts);
}
async function resolveProxyCertificateInfo(projectName, routeBindings, ensureLocalCertificates2, existingInfo) {
  return existingInfo ?? ensureLocalCertificates2(projectName, routeBindings.filter((b) => b.https).map((b) => b.host));
}

// ../../packages/core/src/routes.ts
async function publishConfiguredRoutes(config, routeBindings, networkName, dependencies2, output) {
  const httpsInfo = await resolveHttpsInfo(
    config.name,
    routeBindings,
    dependencies2.ensureLocalCertificates
  );
  if (routeBindings.length > 0) {
    const certificateInfo = await resolveProxyCertificateInfo(
      config.name,
      routeBindings,
      dependencies2.ensureLocalCertificates,
      httpsInfo
    );
    const proxy = await dependencies2.ensureRouteProxy(
      config,
      routeBindings,
      certificateInfo,
      networkName
    );
    for (const line of formatRouteBindings(routeBindings, { http: proxy.httpPort, https: proxy.httpsPort })) {
      output.writeOut(line);
    }
    output.writeOut(formatProxyPorts(proxy.httpPort, proxy.httpsPort));
    try {
      const routeHosts = await dependencies2.ensureRouteHosts(config.name, routeBindings);
      if (routeHosts.managedHosts.length > 0) {
        output.writeOut(`Hosts entries added: ${routeHosts.managedHosts.join(", ")} -> 127.0.0.1
`);
      }
      if (routeHosts.skippedHosts.length > 0) {
        output.writeErr(`Skipped wildcard hosts: ${routeHosts.skippedHosts.join(", ")}
`);
      }
      if (routeHosts.pendingHosts && routeHosts.pendingHosts.length > 0) {
        output.writeOut(`To enable route hostnames, add to /etc/hosts:
${routeHosts.pendingHosts.map((h) => `  127.0.0.1 ${h}`).join("\n")}
`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      output.writeErr(`Warning: failed to manage Windows hosts entries automatically: ${message}
`);
    }
    for (const line of formatBrowserUrl(routeBindings, { http: proxy.httpPort, https: proxy.httpsPort })) {
      output.writeOut(line);
    }
  }
  for (const line of formatHttpsInfo(httpsInfo)) {
    output.writeOut(line);
  }
}

// ../../packages/core/src/runtime.ts
import { existsSync } from "node:fs";
function rootlessRuntimePath(uid, runtimeDir) {
  return runtimeDir || process.env.XDG_RUNTIME_DIR || `/run/user/${uid}`;
}
function assertLinuxRootlessRuntimeReady(config, dependencies2) {
  const platform = dependencies2.platform ?? process.platform;
  if (platform !== "linux" || !config.runtime.rootless) {
    return;
  }
  const uid = dependencies2.uid ?? process.getuid?.();
  if (uid === void 0) {
    return;
  }
  const runtimeDir = rootlessRuntimePath(uid, dependencies2.runtimeDir);
  const runtimeDirExists = dependencies2.runtimeDirExists ?? existsSync;
  if (runtimeDirExists(runtimeDir)) {
    return;
  }
  throw new Error(
    `Rootless Podman requires a writable user runtime directory, but '${runtimeDir}' does not exist. Log in with a real user session or enable lingering with 'loginctl enable-linger ${uid}', then retry 'loom start'.`
  );
}
async function ensureRuntimeReady(config, dependencies2) {
  assertLinuxRootlessRuntimeReady(config, dependencies2);
  await dependencies2.ensureMachineRunning(config.runtime.machine?.managed ?? true);
  const capabilities = await dependencies2.detectPodmanCapabilities();
  if (!capabilities.available) {
    throw new Error("Podman is unavailable. Install Podman and retry `loom start`.");
  }
  if (config.runtime.rootless && !capabilities.rootless) {
    throw new Error("Loom config requires rootless Podman, but Podman is running rootful.");
  }
}

// ../../packages/core/src/service-start.ts
async function startConfiguredService(config, serviceName, networkName, dependencies2, output) {
  const service = config.services[serviceName];
  await dependencies2.ensureServiceStarted(config.name, serviceName, service, networkName);
  if (service.type.toLowerCase() === "php" && service.composer !== false) {
    await dependencies2.ensureComposerAvailable(config.name, serviceName);
  }
  await dependencies2.waitForServiceReady(config.name, serviceName, {
    ...service.healthcheck,
    ports: service.ports,
    progressIntervalSeconds: 15,
    onProgress(progress) {
      output.writeOut(formatWaitingService(serviceName, progress.detail, progress.elapsedSeconds));
    }
  });
  output.writeOut(formatStartedService(serviceName));
}

// ../../packages/core/src/tasks.ts
function getConfiguredTask(config, taskName) {
  return config.tasks?.[taskName];
}
function requireConfiguredTask(config, taskName) {
  const task = getConfiguredTask(config, taskName);
  if (!task) {
    throw new Error(`Task '${taskName}' is not defined in loom.yaml.`);
  }
  return task;
}

// ../../packages/core/src/index.ts
var LoomOrchestrator = class {
  constructor(config, projectRoot = process.cwd(), dependencies2 = defaultOrchestratorDependencies, output = defaultOrchestratorOutput) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.dependencies = dependencies2;
    this.output = output;
  }
  config;
  projectRoot;
  dependencies;
  output;
  async recreateExistingProjectContainers() {
    const containers = await this.dependencies.listProjectContainers(this.config.name);
    if (containers.length === 0) {
      return;
    }
    this.output.writeOut(`Recreating ${containers.length} existing container(s) for ${this.config.name}...
`);
    for (const container of containers) {
      await this.dependencies.removeContainer(container.name);
      this.output.writeOut(`- removed ${container.name}
`);
    }
  }
  async start(options = {}) {
    await ensureRuntimeReady(this.config, this.dependencies);
    if (options.recreate) {
      await this.recreateExistingProjectContainers();
    }
    const networkName = await this.dependencies.ensureServiceNetwork(this.config);
    const routeBindings = this.dependencies.resolveRouteBindings(this.config);
    const order = dependencyOrder(this.config);
    this.output.writeOut(formatStartupNotice());
    this.output.writeOut(formatStartHeader(this.config.name, order.length, networkName));
    for (const serviceName of order) {
      await startConfiguredService(this.config, serviceName, networkName, this.dependencies, this.output);
    }
    await publishConfiguredRoutes(this.config, routeBindings, networkName, this.dependencies, this.output);
  }
  async stop() {
    const order = dependencyOrder(this.config).reverse();
    this.output.writeOut(`Stopping ${order.length} service(s) for ${this.config.name}...
`);
    await stopProjectResources(this.config.name, order, {
      stopServiceByName: this.dependencies.stopService,
      stopRouteHostsByProject: this.dependencies.stopRouteHosts,
      stopRouteProxyByProject: this.dependencies.stopRouteProxy,
      writeOut: this.output.writeOut,
      writeErr: this.output.writeErr
    });
  }
  async restart(options = {}) {
    await this.stop();
    await this.start(options);
  }
  async status() {
    return buildLoomStatus(this.config, this.dependencies);
  }
  async ps() {
    return this.dependencies.listProjectContainers(this.config.name);
  }
  async runTask(taskName) {
    const task = requireConfiguredTask(this.config, taskName);
    const service = await requireConfiguredService(
      this.config,
      task.service,
      this.dependencies.listProjectContainers
    );
    this.output.writeOut(`Running task '${taskName}' in service '${task.service}': ${task.command}
`);
    await this.dependencies.execServiceCommand(this.config.name, task.service, ["sh", "-c", task.command], service.execUser, service.workdir);
  }
  async logs(serviceName, follow = true) {
    await requireConfiguredService(
      this.config,
      serviceName,
      this.dependencies.listProjectContainers
    );
    await this.dependencies.tailServiceLogs(this.config.name, serviceName, follow);
  }
  async exec(serviceName, command) {
    const service = await requireConfiguredService(
      this.config,
      serviceName,
      this.dependencies.listProjectContainers
    );
    await this.dependencies.execServiceCommand(this.config.name, serviceName, command, service.execUser, service.workdir);
  }
  async backup(serviceName, outputPath) {
    return backupConfiguredService(
      this.config,
      this.projectRoot,
      serviceName,
      this.dependencies,
      outputPath
    );
  }
  async backupAll() {
    return backupAllConfiguredServices(this.config, this.projectRoot, this.dependencies);
  }
  async restore(serviceName, inputPath) {
    return restoreConfiguredService(
      this.config,
      this.projectRoot,
      serviceName,
      inputPath,
      this.dependencies
    );
  }
};

// ../../packages/tasks/src/index.ts
async function runNamedTask(orchestrator, taskName) {
  await orchestrator.runTask(taskName);
}

// src/init-detect.ts
import { access as access4, readFile as readFile3, readdir } from "node:fs/promises";
import { resolve as resolve7 } from "node:path";
async function pathExists(path) {
  try {
    await access4(path);
    return true;
  } catch {
    return false;
  }
}
async function readOptionalFile(path) {
  try {
    return await readFile3(path, "utf8");
  } catch {
    return void 0;
  }
}
function includesAny(content, patterns) {
  return patterns.some((pattern) => content.includes(pattern));
}
async function detectInitTemplateSuggestion(rootDir) {
  const composerJson = await readOptionalFile(resolve7(rootDir, "composer.json"));
  if (composerJson) {
    if (includesAny(composerJson, ["drupal/core-recommended", "drupal/core-composer-scaffold"])) {
      return "php-drupal";
    }
    if (includesAny(composerJson, ["symfony/framework-bundle"])) {
      return "php-symfony";
    }
    if (includesAny(composerJson, ["roots/wordpress", "johnpbloch/wordpress"])) {
      return "php-wordpress";
    }
    return "php";
  }
  const packageJson = await readOptionalFile(resolve7(rootDir, "package.json"));
  if (packageJson) {
    if (includesAny(packageJson, ['"bun"', "bun.lock", "bunfig.toml"])) {
      return "bun";
    }
    return "node";
  }
  const pyprojectToml = await readOptionalFile(resolve7(rootDir, "pyproject.toml"));
  if (pyprojectToml) {
    if (includesAny(pyprojectToml.toLowerCase(), ["django"])) {
      return "python-django";
    }
    if (includesAny(pyprojectToml.toLowerCase(), ["fastapi"])) {
      return "python-fastapi";
    }
    if (includesAny(pyprojectToml.toLowerCase(), ["flask"])) {
      return "python-flask";
    }
    return "python";
  }
  const requirementsTxt = await readOptionalFile(resolve7(rootDir, "requirements.txt"));
  if (requirementsTxt) {
    const lowered = requirementsTxt.toLowerCase();
    if (includesAny(lowered, ["django"])) {
      return "python-django";
    }
    if (includesAny(lowered, ["fastapi"])) {
      return "python-fastapi";
    }
    if (includesAny(lowered, ["flask"])) {
      return "python-flask";
    }
    return "python";
  }
  const gemfile = await readOptionalFile(resolve7(rootDir, "Gemfile"));
  if (gemfile && includesAny(gemfile.toLowerCase(), ["rails"])) {
    return "rails7";
  }
  try {
    const entries = await readdir(rootDir);
    if (entries.some((entry) => entry.endsWith(".csproj") || entry.endsWith(".sln"))) {
      return "dotnet";
    }
  } catch {
    return void 0;
  }
  if (await pathExists(resolve7(rootDir, "bun.lockb"))) {
    return "bun";
  }
  if (await pathExists(resolve7(rootDir, "bun.lock"))) {
    return "bun";
  }
  return void 0;
}

// src/clean-prompt.ts
import { createInterface } from "node:readline/promises";
function isCleanConfirmed(answer) {
  return /^(?:y|yes)$/i.test(answer.trim());
}
async function confirmProjectClean(input = process.stdin, output = process.stdout) {
  const prompt = createInterface({ input, output });
  try {
    return isCleanConfirmed(await prompt.question("Remove these generated paths? [y/N] "));
  } finally {
    prompt.close();
  }
}

// ../../stacks/definition.ts
import { isAbsolute as isAbsolute2, posix } from "node:path";
var stackIds = [
  "node",
  "node-mean",
  "node-mern",
  "node-t3",
  "bun",
  "python",
  "python-django",
  "python-flask",
  "python-fastapi",
  "php",
  "php-wordpress",
  "php-drupal",
  "php-symfony",
  "db-mysql",
  "db-sqlserver",
  "db-postgres",
  "db-mongodb",
  "db-redis",
  "db-elasticsearch",
  "db-sqlite",
  "db-mariadb",
  "db-all",
  "dotnet",
  "rails7",
  "rails7-hotwire",
  "jamstack",
  "serverless",
  "spring-react",
  "spring-boot",
  "astro",
  "django-react"
];
function safeRelative(path) {
  if (!path || path === "." || isAbsolute2(path) || path.includes("\\")) return false;
  return path.split("/").every((part) => part !== "" && part !== "." && part !== "..") && posix.normalize(path) === path;
}
function assertSortedUnique(values, kind) {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${kind}`);
  if (values.some((value, index) => index > 0 && values[index - 1] > value)) {
    throw new Error(`${kind} must be sorted`);
  }
}
function validateGeneratorVersion(version) {
  const rejected = /^(?:latest|next|canary|nightly|unversioned)$/i;
  if (!version || rejected.test(version) || /[\s*^~<>=|]/.test(version) || /(?:^|\.)x(?:\.|$)/i.test(version) || !/^\d+(?:\.\d+){1,}(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Expected exact generator version, received '${version}'`);
  }
}
function validateRuntimeImage(image) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(image.env)) throw new Error(`Runtime image environment '${image.env}' must be uppercase`);
  const withoutDigest = image.reference.split("@", 1)[0];
  const lastSlash = withoutDigest.lastIndexOf("/");
  const colon = withoutDigest.lastIndexOf(":");
  const tag = colon > lastSlash ? withoutDigest.slice(colon + 1) : "";
  const digest = image.reference.includes("@") ? image.reference.slice(image.reference.indexOf("@") + 1) : void 0;
  const exactTag = /^(?:\d+\.\d+\.\d+(?:[-.][0-9A-Za-z][0-9A-Za-z.-]*)?|\d+\.\d+-[A-Za-z][0-9A-Za-z.-]*)$/.test(tag) || /^\d{4}(?:[-.]\d{2}){1,2}(?:[-.][0-9A-Za-z.-]+)?$/.test(tag) || /(?:^|-)CU\d+(?:-|$)/i.test(tag);
  if (!tag || tag.toLowerCase() === "latest" || !exactTag || digest !== void 0 && !/^sha256:[a-f0-9]{64}$/.test(digest)) {
    throw new Error(`Runtime image '${image.reference}' must use an exact version tag`);
  }
}
function validateStackDefinition(definition) {
  if (!stackIds.includes(definition.id)) throw new Error(`Unknown stack id: ${definition.id}`);
  if (!Number.isInteger(definition.definitionVersion) || definition.definitionVersion <= 0) throw new Error("Definition version must be a positive integer");
  if (definition.assetPath !== `${definition.id}/templates` || !safeRelative(definition.assetPath)) throw new Error(`Unsafe asset path: ${definition.assetPath}`);
  assertSortedUnique(definition.legacyScaffoldVersions, "legacy scaffold versions");
  if (definition.generator.kind === "command") {
    if (!definition.generator.package.trim() || definition.generator.command.length === 0 || definition.generator.command.some((argument) => !argument.trim())) {
      throw new Error("Command generator requires a package and nonempty command argv");
    }
    validateRuntimeImage({ env: "GENERATOR_IMAGE", reference: definition.generator.image });
    validateGeneratorVersion(definition.generator.version);
    const execution = definition.generator.execution;
    const containerPaths = [execution.mountTarget, ...execution.workdir === void 0 ? [] : [execution.workdir]];
    if (execution.kind !== "container" || !execution.context.trim() || containerPaths.some((path) => !path.startsWith("/") || path.includes("\\") || path.split("/").some((part, index) => index > 0 && (!part || part === "." || part === "..")))) {
      throw new Error("Command generator requires valid container execution topology");
    }
    const environmentNames = execution.environment.map(({ name }) => name);
    assertSortedUnique(environmentNames, "generator execution environment names");
    if (execution.environment.some(({ name, value }) => !/^[A-Z][A-Z0-9_]*$/.test(name) || !value.trim())) {
      throw new Error("Command generator requires valid execution environment values");
    }
  }
  const runtimeEnvs = definition.runtimeImages.map(({ env }) => env);
  assertSortedUnique(runtimeEnvs, "runtime image environments");
  for (const image of definition.runtimeImages) validateRuntimeImage(image);
  for (const check of definition.verification) {
    if (check.service !== void 0 && !/^[a-z][a-z0-9-]*$/.test(check.service)) {
      throw new Error(`Verification service '${check.service}' must be a service name`);
    }
    if (check.command.length === 0 || check.command.some((argument) => !argument.trim())) {
      throw new Error("Verification command requires nonempty argv");
    }
  }
  const generatedPaths = definition.generatedPaths.map(({ path }) => path);
  const protectedPaths = [...definition.protectedPaths];
  for (const [kind, paths] of [["generated path", generatedPaths], ["protected path", protectedPaths], ["Loom-owned path", definition.loomOwnedFiles], ["host-write path", definition.hostWrites]]) {
    for (const path of paths) if (!safeRelative(path) || path === ".loom" || path.startsWith(".loom/")) throw new Error(`Unsafe ${kind}: ${path}`);
    assertSortedUnique(paths, `${kind}s`);
  }
  for (const generatedPath of generatedPaths) {
    if (protectedPaths.some((path) => generatedPath === path || path.startsWith(`${generatedPath}/`))) throw new Error(`Generated path contains protected path: ${generatedPath}`);
  }
  if (!Number.isInteger(definition.readiness.timeoutSeconds) || definition.readiness.timeoutSeconds <= 0 || !definition.readiness.value.trim()) throw new Error("Readiness requires a value and positive timeout");
  assertSortedUnique(definition.compatibility.architectures, "architectures");
}
function defineStack(definition) {
  validateStackDefinition(definition);
  return definition;
}

// ../../stacks/pins.ts
var runtimeImagePins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/alpine
  alpine320: "docker.io/library/alpine:3.20.7",
  // Verified 2026-09-01 against Docker Hub: https://hub.docker.com/r/keinos/sqlite3
  sqlite346: "docker.io/keinos/sqlite3:3.46.1",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/r/oven/bun
  bun1: "docker.io/oven/bun:1.2.18",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/node
  node22Alpine: "docker.io/library/node:22.17.1-alpine",
  node24Alpine: "docker.io/library/node:24.4.1-alpine",
  // Verified 2026-08-17 against Microsoft Artifact Registry: https://mcr.microsoft.com/v2/dotnet/sdk/manifests/8.0.412
  dotnet8Sdk: "mcr.microsoft.com/dotnet/sdk:8.0.412",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/maven
  maven39Temurin21: "docker.io/library/maven:3.9.11-eclipse-temurin-21",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/memcached
  memcached16Alpine: "docker.io/library/memcached:1.6.39-alpine",
  // Verified 2026-08-17 against Elastic Container Registry: https://docker.elastic.co/r/elasticsearch/elasticsearch
  elasticsearch817: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mariadb
  mariadb118: "docker.io/library/mariadb:11.8.2",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mongo
  mongo70: "docker.io/library/mongo:7.0.21",
  // Verified 2026-08-17 against Microsoft Artifact Registry: https://mcr.microsoft.com/v2/mssql/server/manifests/2022-CU20-ubuntu-22.04
  mssql2022: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/mysql
  mysql84: "docker.io/library/mysql:8.4.6",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/php
  php84Apache: "docker.io/library/php:8.4.10-apache",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/ruby
  ruby338: "docker.io/library/ruby:3.3.8",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/wordpress
  wordpress682Php83Apache: "docker.io/library/wordpress:6.8.2-php8.3-apache",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/postgres
  postgres16Alpine: "docker.io/library/postgres:16.9-alpine",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/python
  python312Slim: "docker.io/library/python:3.12.11-slim",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/redis
  redis74Alpine: "docker.io/library/redis:7.4.5-alpine"
};
var generatorPins = {
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/composer
  composerImage: "docker.io/library/composer:2.8.10",
  // Verified 2026-08-17 against RubyGems: https://rubygems.org/gems/bundler/versions/2.6.9
  bundler: "2.6.9",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/drupal/recommended-project
  drupalRecommendedProject: "11.2.2",
  // Verified 2026-08-17 against RubyGems: https://rubygems.org/gems/rails/versions/7.1.5
  rails: "7.1.5",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/symfony/skeleton
  symfonySkeleton: "7.3.99",
  // Verified 2026-08-17 against Packagist: https://packagist.org/packages/symfony/webapp-pack
  symfonyWebappPack: "1.3.0",
  // Verified 2026-08-17 against Docker Hub: https://hub.docker.com/_/wordpress
  wordpress: "6.8.2"
};

// ../../stacks/node/stack.ts
var nodeStack = defineStack({
  id: "node",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "node/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["npm install"],
  start: ["npm start"],
  readiness: { kind: "http", value: "http://127.0.0.1:3000/health", timeoutSeconds: 496 },
  hostWrites: ["node_modules"],
  verification: [{ service: "app", command: ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: "dist", category: "build" },
    { path: "node_modules", category: "dependency" }
  ],
  protectedPaths: ["src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/astro/stack.ts
var astroStack = defineStack({
  id: "astro",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "astro/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["npm install"],
  start: ["npx astro dev --host 0.0.0.0 --port 4321"],
  readiness: { kind: "http", value: "http://127.0.0.1:4321", timeoutSeconds: 495 },
  hostWrites: ["node_modules"],
  verification: [{ service: "app", command: ["node", "-e", "fetch('http://127.0.0.1:4321').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "dist", category: "build" }, { path: "node_modules", category: "dependency" }],
  protectedPaths: ["public", "src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/bun/stack.ts
var bunStack = defineStack({
  id: "bun",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "bun/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "BUN_IMAGE", reference: runtimeImagePins.bun1 }],
  install: [],
  start: ["bun run dev"],
  readiness: { kind: "http", value: "http://127.0.0.1:3004/", timeoutSeconds: 250 },
  hostWrites: [],
  verification: [{ service: "app", command: ["bun", "-e", "fetch('http://127.0.0.1:3004/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: ["index.ts"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/jamstack/stack.ts
var jamstackStack = defineStack({
  id: "jamstack",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "jamstack/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["cd api && npm install", "cd web && npm install"],
  start: ["cd api && npm start", "cd web && npm run dev -- --host 0.0.0.0 --port 5174"],
  readiness: { kind: "http", value: "http://127.0.0.1:5174", timeoutSeconds: 325 },
  hostWrites: ["api/node_modules", "web/node_modules"],
  verification: [{ service: "web", command: ["node", "-e", "fetch('http://127.0.0.1:5174').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "api/dist", category: "build" }, { path: "api/node_modules", category: "dependency" }, { path: "web/dist", category: "build" }, { path: "web/node_modules", category: "dependency" }],
  protectedPaths: ["api/src", "web/src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/node-mean/stack.ts
var nodeMeanStack = defineStack({
  id: "node-mean",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "node-mean/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["cd api && npm install", "cd web && npm install"],
  start: ["cd api && npm start", "cd web && npm start"],
  readiness: { kind: "http", value: "http://127.0.0.1:4200", timeoutSeconds: 325 },
  hostWrites: ["api/node_modules", "web/node_modules"],
  verification: [{ service: "web", command: ["node", "-e", "fetch('http://127.0.0.1:4200').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "api/dist", category: "build" }, { path: "api/node_modules", category: "dependency" }, { path: "web/dist", category: "build" }, { path: "web/node_modules", category: "dependency" }],
  protectedPaths: ["api/src", "web/src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/node-mern/stack.ts
var nodeMernStack = defineStack({
  id: "node-mern",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "node-mern/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["cd api && npm install", "cd web && npm install"],
  start: ["cd api && npm start", "cd web && npm start"],
  readiness: { kind: "http", value: "http://127.0.0.1:5173", timeoutSeconds: 325 },
  hostWrites: ["api/node_modules", "web/node_modules"],
  verification: [{ service: "web", command: ["node", "-e", "fetch('http://127.0.0.1:5173').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "api/dist", category: "build" }, { path: "api/node_modules", category: "dependency" }, { path: "web/dist", category: "build" }, { path: "web/node_modules", category: "dependency" }],
  protectedPaths: ["api/src", "web/src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/node-t3/stack.ts
var nodeT3Stack = defineStack({
  id: "node-t3",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "node-t3/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine }],
  install: ["corepack enable && pnpm install"],
  start: ["pnpm dev"],
  readiness: { kind: "http", value: "http://127.0.0.1:3003", timeoutSeconds: 486 },
  hostWrites: ["node_modules"],
  verification: [{ service: "app", command: ["node", "-e", "fetch('http://127.0.0.1:3003').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: ".next", category: "build" }, { path: "node_modules", category: "dependency" }],
  protectedPaths: ["apps", "packages"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/serverless/stack.ts
var serverlessStack = defineStack({
  id: "serverless",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "serverless/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node22Alpine }],
  install: [],
  start: ["npm run dev:api", "npm run dev:web"],
  readiness: { kind: "http", value: "http://127.0.0.1:3008", timeoutSeconds: 326 },
  hostWrites: [],
  verification: [{ service: "api", command: ["npm", "run", "invoke:health"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: ["dev-server.js", "handler.js", "web", "web-server.js"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/django-react/stack.ts
var djangoReactStack = defineStack({
  id: "django-react",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "django-react/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [
    { env: "NODE_IMAGE", reference: runtimeImagePins.node24Alpine },
    { env: "PYTHON_IMAGE", reference: runtimeImagePins.python312Slim }
  ],
  install: [
    "cd backend && pip install --disable-pip-version-check --user -r requirements.txt",
    "cd frontend && npm install --no-audit --no-fund"
  ],
  start: [
    "cd backend && python manage.py migrate --noinput",
    "cd backend && python manage.py runserver 0.0.0.0:8001",
    "cd frontend && npm run dev -- --host 0.0.0.0 --port 5176"
  ],
  readiness: { kind: "http", value: "http://127.0.0.1:5176", timeoutSeconds: 485 },
  hostWrites: ["backend/db.sqlite3", "backend/project/__pycache__", "frontend/node_modules", "frontend/package-lock.json"],
  verification: [{ service: "web", command: ["node", "-e", "fetch('http://127.0.0.1:5176').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: "backend/.pytest_cache", category: "cache" },
    { path: "backend/.venv", category: "dependency" },
    { path: "frontend/dist", category: "build" },
    { path: "frontend/node_modules", category: "dependency" }
  ],
  protectedPaths: ["backend/project", "frontend/src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-all/stack.ts
var sqliteStart = `sh -c "sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null"`;
var dbAllStack = defineStack({
  id: "db-all",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-all/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [
    { env: "ELASTICSEARCH_IMAGE", reference: runtimeImagePins.elasticsearch817 },
    { env: "MARIADB_IMAGE", reference: runtimeImagePins.mariadb118 },
    { env: "MONGO_IMAGE", reference: runtimeImagePins.mongo70 },
    { env: "MSSQL_IMAGE", reference: runtimeImagePins.mssql2022 },
    { env: "MYSQL_IMAGE", reference: runtimeImagePins.mysql84 },
    { env: "POSTGRES_IMAGE", reference: runtimeImagePins.postgres16Alpine },
    { env: "REDIS_IMAGE", reference: runtimeImagePins.redis74Alpine },
    { env: "SQLITE_IMAGE", reference: runtimeImagePins.sqlite346 }
  ],
  install: [],
  start: ["redis-server --appendonly yes", sqliteStart],
  readiness: { kind: "http", value: "http://127.0.0.1:9200/_cluster/health", timeoutSeconds: 300 },
  hostWrites: [],
  verification: [
    { service: "mysql", command: ["mysql", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"] },
    { service: "sqlserver", command: ["/opt/mssql-tools18/bin/sqlcmd", "-S", "127.0.0.1", "-U", "sa", "-P", "LoomDev!Passw0rd", "-C", "-Q", "SELECT 1"] },
    { service: "postgres", command: ["psql", "-U", "loom", "-d", "loom", "-c", "SELECT 1"] },
    { service: "mongodb", command: ["mongosh", "--quiet", "--host", "127.0.0.1", "--username", "loom", "--password", "loom", "--authenticationDatabase", "admin", "--eval", "quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)"] },
    { service: "redis", command: ["redis-cli", "ping"] },
    { service: "elasticsearch", command: ["curl", "--fail", "http://127.0.0.1:9200/_cluster/health"] },
    { service: "sqlite", command: ["sqlite3", "/data/loom.db", "select 1;"] },
    { service: "mariadb", command: ["mariadb", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"] }
  ],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-elasticsearch/stack.ts
var dbElasticsearchStack = defineStack({
  id: "db-elasticsearch",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-elasticsearch/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "ELASTICSEARCH_IMAGE", reference: runtimeImagePins.elasticsearch817 }],
  install: [],
  start: [],
  readiness: { kind: "http", value: "http://127.0.0.1:9200/_cluster/health", timeoutSeconds: 300 },
  hostWrites: [],
  verification: [{ service: "db", command: ["curl", "--fail", "http://127.0.0.1:9200/_cluster/health"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-mariadb/stack.ts
var dbMariadbStack = defineStack({
  id: "db-mariadb",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-mariadb/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "MARIADB_IMAGE", reference: runtimeImagePins.mariadb118 }],
  install: [],
  start: [],
  readiness: { kind: "command", value: "mariadb-admin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
  hostWrites: [],
  verification: [{ service: "db", command: ["mariadb", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-mongodb/stack.ts
var dbMongodbStack = defineStack({
  id: "db-mongodb",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-mongodb/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "MONGO_IMAGE", reference: runtimeImagePins.mongo70 }],
  install: [],
  start: [],
  readiness: { kind: "port", value: "127.0.0.1:27017", timeoutSeconds: 120 },
  hostWrites: [],
  verification: [{ service: "db", command: ["mongosh", "--quiet", "--host", "127.0.0.1", "--username", "loom", "--password", "loom", "--authenticationDatabase", "admin", "--eval", "quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-mysql/stack.ts
var dbMysqlStack = defineStack({
  id: "db-mysql",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-mysql/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "MYSQL_IMAGE", reference: runtimeImagePins.mysql84 }],
  install: [],
  start: [],
  readiness: { kind: "command", value: "mysqladmin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
  hostWrites: [],
  verification: [{ service: "db", command: ["mysql", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-postgres/stack.ts
var dbPostgresStack = defineStack({
  id: "db-postgres",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-postgres/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "POSTGRES_IMAGE", reference: runtimeImagePins.postgres16Alpine }],
  install: [],
  start: [],
  readiness: { kind: "command", value: "pg_isready -U loom", timeoutSeconds: 95 },
  hostWrites: [],
  verification: [{ service: "db", command: ["psql", "-U", "loom", "-d", "loom", "-c", "SELECT 1"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-redis/stack.ts
var dbRedisStack = defineStack({
  id: "db-redis",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-redis/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "REDIS_IMAGE", reference: runtimeImagePins.redis74Alpine }],
  install: [],
  start: ["redis-server --appendonly yes"],
  readiness: { kind: "command", value: "redis-cli ping | grep PONG", timeoutSeconds: 92 },
  hostWrites: [],
  verification: [{ service: "db", command: ["redis-cli", "ping"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-sqlite/stack.ts
var start = `sh -c "sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null"`;
var dbSqliteStack = defineStack({
  id: "db-sqlite",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-sqlite/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "SQLITE_IMAGE", reference: runtimeImagePins.sqlite346 }],
  install: [],
  start: [start],
  readiness: { kind: "command", value: "sqlite3 /data/loom.db 'select 1;'", timeoutSeconds: 60 },
  hostWrites: [],
  verification: [{ service: "db", command: ["sqlite3", "/data/loom.db", "select 1;"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/db-sqlserver/stack.ts
var dbSqlserverStack = defineStack({
  id: "db-sqlserver",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "db-sqlserver/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "MSSQL_IMAGE", reference: runtimeImagePins.mssql2022 }],
  install: [],
  start: [],
  readiness: { kind: "port", value: "127.0.0.1:1433", timeoutSeconds: 300 },
  hostWrites: [],
  verification: [{ service: "db", command: ["/opt/mssql-tools18/bin/sqlcmd", "-S", "127.0.0.1", "-U", "sa", "-P", "LoomDev!Passw0rd", "-C", "-Q", "SELECT 1"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [],
  protectedPaths: [],
  compatibility: { architectures: ["x64"], runtime: "podman-rootless" }
});

// ../../stacks/dotnet/stack.ts
var dotnetStack = defineStack({
  id: "dotnet",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "dotnet/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "DOTNET_IMAGE", reference: runtimeImagePins.dotnet8Sdk }],
  install: ["dotnet restore"],
  start: ["dotnet run --urls http://0.0.0.0:5000"],
  readiness: { kind: "http", value: "http://127.0.0.1:5000/", timeoutSeconds: 330 },
  hostWrites: ["src/bin", "src/obj"],
  verification: [{ service: "app", command: ["wget", "-qO", "/dev/null", "http://127.0.0.1:5000/"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "src/bin", category: "build" }, { path: "src/obj", category: "build" }],
  protectedPaths: ["src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/php/stack.ts
var phpStack = defineStack({
  id: "php",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "php/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [
    { env: "PHP_IMAGE", reference: runtimeImagePins.php84Apache }
  ],
  install: [],
  start: ["apache2-foreground"],
  readiness: { kind: "port", value: "127.0.0.1:80", timeoutSeconds: 90 },
  hostWrites: [],
  verification: [{ service: "app", command: ["php", "-r", "exit((int)!@fsockopen('127.0.0.1', 80));"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "vendor", category: "dependency" }],
  protectedPaths: ["index.php"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/php-drupal/stack.ts
var phpDrupalStack = defineStack({
  id: "php-drupal",
  definitionVersion: 2,
  legacyScaffoldVersions: ["2", "unversioned"],
  assetPath: "php-drupal/templates",
  scaffoldVersion: "2",
  generator: {
    kind: "command",
    image: generatorPins.composerImage,
    package: "drupal/recommended-project",
    version: generatorPins.drupalRecommendedProject,
    command: ["create-project", "{package}:{version}", "."],
    execution: {
      kind: "container",
      context: "Drupal project with Podman Composer",
      mountTarget: "/app",
      workdir: "/app",
      environment: [{ name: "HOME", value: "/tmp" }]
    }
  },
  runtimeImages: [
    { env: "PHP_IMAGE", reference: runtimeImagePins.php84Apache }
  ],
  install: [],
  start: ["apache2-foreground"],
  readiness: { kind: "port", value: "127.0.0.1:80", timeoutSeconds: 90 },
  hostWrites: ["data/files"],
  verification: [{ service: "app", command: ["php", "-r", "exit((int)!@fsockopen('127.0.0.1', 80));"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "vendor", category: "dependency" }],
  protectedPaths: ["modules", "themes", "web"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/php-symfony/stack.ts
var phpSymfonyStack = defineStack({
  id: "php-symfony",
  definitionVersion: 2,
  legacyScaffoldVersions: ["2", "unversioned"],
  assetPath: "php-symfony/templates",
  scaffoldVersion: "2",
  generator: {
    kind: "command",
    image: generatorPins.composerImage,
    package: "symfony/skeleton",
    version: generatorPins.symfonySkeleton,
    command: ["sh", "-c", `composer create-project {package}:{version} . && composer require symfony/webapp-pack:${generatorPins.symfonyWebappPack}`],
    execution: {
      kind: "container",
      context: "Symfony project with Podman Composer",
      mountTarget: "/app",
      workdir: "/app",
      environment: [{ name: "HOME", value: "/tmp" }]
    }
  },
  runtimeImages: [
    { env: "PHP_IMAGE", reference: runtimeImagePins.php84Apache }
  ],
  install: [],
  start: ["apache2-foreground"],
  readiness: { kind: "port", value: "127.0.0.1:80", timeoutSeconds: 90 },
  hostWrites: ["var/cache"],
  verification: [{ service: "app", command: ["php", "bin/console", "about"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "var/cache", category: "cache" }, { path: "vendor", category: "dependency" }],
  protectedPaths: ["config", "public", "src", "templates"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/php-wordpress/stack.ts
var phpWordpressStack = defineStack({
  id: "php-wordpress",
  definitionVersion: 2,
  legacyScaffoldVersions: ["2", "wordpress-6-php8.3-apache"],
  assetPath: "php-wordpress/templates",
  scaffoldVersion: "2",
  generator: {
    kind: "command",
    image: runtimeImagePins.wordpress682Php83Apache,
    package: "wordpress",
    version: generatorPins.wordpress,
    command: ["sh", "-c", "cp -a /usr/src/wordpress/. /app/"],
    execution: { kind: "container", context: "WordPress project with Podman", mountTarget: "/app", environment: [] }
  },
  runtimeImages: [
    { env: "WORDPRESS_IMAGE", reference: runtimeImagePins.wordpress682Php83Apache }
  ],
  install: [],
  start: ["docker-entrypoint.sh apache2-foreground"],
  readiness: { kind: "port", value: "127.0.0.1:80", timeoutSeconds: 90 },
  hostWrites: ["wp-content"],
  verification: [{ service: "app", command: ["php", "-r", "exit((int)!@fsockopen('127.0.0.1', 80));"] }],
  loomOwnedFiles: [".env.example", "loom.yaml", "wp-config.php"],
  generatedPaths: [],
  protectedPaths: ["wp-content"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/python/stack.ts
var pythonStack = defineStack({
  id: "python",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "python/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "PYTHON_IMAGE", reference: runtimeImagePins.python312Slim }],
  install: [],
  start: ["python -m http.server 8000"],
  readiness: { kind: "http", value: "http://127.0.0.1:8000/", timeoutSeconds: 366 },
  hostWrites: [],
  verification: [{ service: "app", command: ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/', timeout=2)"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: ".pytest_cache", category: "cache" },
    { path: ".venv", category: "dependency" },
    { path: "__pycache__", category: "cache" }
  ],
  protectedPaths: ["index.html"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/python-django/stack.ts
var pythonDjangoStack = defineStack({
  id: "python-django",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "python-django/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "PYTHON_IMAGE", reference: runtimeImagePins.python312Slim }],
  install: ["pip install --user -r requirements.txt"],
  start: ["python manage.py migrate --noinput", "python manage.py runserver 0.0.0.0:8001"],
  readiness: { kind: "http", value: "http://127.0.0.1:8001/health", timeoutSeconds: 488 },
  hostWrites: ["db.sqlite3", "project/__pycache__"],
  verification: [{ service: "app", command: ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=2)"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: ".pytest_cache", category: "cache" },
    { path: ".venv", category: "dependency" },
    { path: "__pycache__", category: "cache" }
  ],
  protectedPaths: ["manage.py", "project", "requirements.txt"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/python-fastapi/stack.ts
var pythonFastapiStack = defineStack({
  id: "python-fastapi",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "python-fastapi/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "PYTHON_IMAGE", reference: runtimeImagePins.python312Slim }],
  install: ["pip install --user -r requirements.txt"],
  start: ["uvicorn app.main:app --host 0.0.0.0 --port 8003"],
  readiness: { kind: "http", value: "http://127.0.0.1:8003/health", timeoutSeconds: 488 },
  hostWrites: ["app/__pycache__"],
  verification: [{ service: "app", command: ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8003/health', timeout=2)"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: ".pytest_cache", category: "cache" },
    { path: ".venv", category: "dependency" },
    { path: "__pycache__", category: "cache" }
  ],
  protectedPaths: ["app", "requirements.txt"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/python-flask/stack.ts
var pythonFlaskStack = defineStack({
  id: "python-flask",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "python-flask/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "PYTHON_IMAGE", reference: runtimeImagePins.python312Slim }],
  install: ["pip install --user -r requirements.txt"],
  start: ["flask --app app run --host 0.0.0.0 --port 8002"],
  readiness: { kind: "http", value: "http://127.0.0.1:8002/health", timeoutSeconds: 488 },
  hostWrites: ["__pycache__"],
  verification: [{ service: "app", command: ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8002/health', timeout=2)"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [
    { path: ".pytest_cache", category: "cache" },
    { path: ".venv", category: "dependency" },
    { path: "__pycache__", category: "cache" }
  ],
  protectedPaths: ["app.py", "requirements.txt"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/spring-boot/stack.ts
var springBootStack = defineStack({
  id: "spring-boot",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "spring-boot/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [{ env: "JAVA_IMAGE", reference: runtimeImagePins.maven39Temurin21 }],
  install: [],
  start: ['mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.address=0.0.0.0 -Dserver.port=8080"'],
  readiness: { kind: "http", value: "http://127.0.0.1:8080/api/health", timeoutSeconds: 630 },
  hostWrites: ["target"],
  verification: [{ service: "app", command: ["wget", "-q", "-O-", "http://127.0.0.1:8080/api/health"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "target", category: "build" }],
  protectedPaths: ["src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/spring-react/stack.ts
var springReactStack = defineStack({
  id: "spring-react",
  definitionVersion: 2,
  legacyScaffoldVersions: ["1", "2"],
  assetPath: "spring-react/templates",
  scaffoldVersion: "2",
  generator: { kind: "none" },
  runtimeImages: [
    { env: "JAVA_IMAGE", reference: runtimeImagePins.maven39Temurin21 },
    { env: "NODE_IMAGE", reference: runtimeImagePins.node22Alpine }
  ],
  install: ["cd frontend && npm install"],
  start: [
    'cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.address=0.0.0.0 -Dserver.port=8080"',
    "cd frontend && npm run build",
    "cd frontend && npm run serve"
  ],
  readiness: { kind: "http", value: "http://127.0.0.1:5175", timeoutSeconds: 410 },
  hostWrites: ["backend/target", "frontend/dist", "frontend/node_modules"],
  verification: [{ service: "web", command: ["node", "-e", "fetch('http://127.0.0.1:5175').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "backend/target", category: "build" }, { path: "frontend/dist", category: "build" }, { path: "frontend/node_modules", category: "dependency" }],
  protectedPaths: ["backend/src", "frontend/src"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/rails7/stack.ts
var rails7Stack = defineStack({
  id: "rails7",
  definitionVersion: 2,
  legacyScaffoldVersions: ["2", "rails-7.1.5"],
  assetPath: "rails7/templates",
  scaffoldVersion: "2",
  generator: {
    kind: "command",
    image: runtimeImagePins.ruby338,
    package: "rails",
    version: generatorPins.rails,
    command: ["sh", "-c", `gem install bundler -v ${generatorPins.bundler} --no-document && gem install {package} -v {version} --no-document && /usr/local/bundle/bin/rails _{version}_ new . --skip-javascript --skip-test --skip-system-test`],
    execution: {
      kind: "container",
      context: "Rails 7 project with Podman",
      mountTarget: "/workspace",
      workdir: "/workspace",
      environment: []
    }
  },
  runtimeImages: [{ env: "RUBY_IMAGE", reference: runtimeImagePins.ruby338 }],
  install: ["bundle install"],
  start: ["bin/rails server -b 0.0.0.0 -p 3006"],
  readiness: { kind: "port", value: "127.0.0.1:3006", timeoutSeconds: 610 },
  hostWrites: ["log", "tmp", "vendor/bundle"],
  verification: [{ service: "app", command: ["ruby", "-rsocket", "-e", "TCPSocket.new('127.0.0.1', 3006).close"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "log", category: "cache" }, { path: "tmp", category: "cache" }, { path: "vendor/bundle", category: "dependency" }],
  protectedPaths: ["app", "config", "db", "lib"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/rails7-hotwire/stack.ts
var rails7HotwireStack = defineStack({
  id: "rails7-hotwire",
  definitionVersion: 2,
  legacyScaffoldVersions: ["2", "rails-7.1.5-hotwire"],
  assetPath: "rails7-hotwire/templates",
  scaffoldVersion: "2",
  generator: {
    kind: "command",
    image: runtimeImagePins.ruby338,
    package: "rails",
    version: generatorPins.rails,
    command: ["sh", "-c", `gem install bundler -v ${generatorPins.bundler} --no-document && gem install {package} -v {version} --no-document && /usr/local/bundle/bin/rails _{version}_ new . --skip-test --skip-system-test`],
    execution: {
      kind: "container",
      context: "Rails 7 + Hotwire project with Podman",
      mountTarget: "/workspace",
      workdir: "/workspace",
      environment: []
    }
  },
  runtimeImages: [{ env: "RUBY_IMAGE", reference: runtimeImagePins.ruby338 }],
  install: ["bundle install"],
  start: ["bin/rails server -b 0.0.0.0 -p 3008"],
  readiness: { kind: "port", value: "127.0.0.1:3008", timeoutSeconds: 610 },
  hostWrites: ["log", "tmp", "vendor/bundle"],
  verification: [{ service: "app", command: ["ruby", "-rsocket", "-e", "TCPSocket.new('127.0.0.1', 3008).close"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "log", category: "cache" }, { path: "tmp", category: "cache" }, { path: "vendor/bundle", category: "dependency" }],
  protectedPaths: ["app", "config", "db", "lib"],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});

// ../../stacks/index.ts
var compatibility = { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" };
var generated = (path, category) => ({ path, category });
var nodeGenerated = [generated("dist", "build"), generated("node_modules", "dependency")];
var phpGenerated = [generated("vendor", "dependency")];
var pythonGenerated = [generated(".pytest_cache", "cache"), generated(".venv", "dependency"), generated("__pycache__", "cache")];
var railsGenerated = [generated("log", "cache"), generated("tmp", "cache"), generated("vendor/bundle", "dependency")];
var springGenerated = [generated("target", "build")];
function nestedNodeGenerated(...roots) {
  return roots.flatMap((root) => [generated(`${root}/dist`, "build"), generated(`${root}/node_modules`, "dependency")]).sort((a, b) => a.path.localeCompare(b.path));
}
var generatedPathsByStack = {
  node: nodeGenerated,
  "node-mean": nestedNodeGenerated("api", "web"),
  "node-mern": nestedNodeGenerated("api", "web"),
  "node-t3": [generated(".next", "build"), generated("node_modules", "dependency")],
  bun: nodeGenerated,
  python: pythonGenerated,
  "python-django": pythonGenerated,
  "python-flask": pythonGenerated,
  "python-fastapi": pythonGenerated,
  php: phpGenerated,
  "php-wordpress": [],
  "php-drupal": phpGenerated,
  "php-symfony": [generated("var/cache", "cache"), generated("vendor", "dependency")],
  "db-mysql": [],
  "db-sqlserver": [],
  "db-postgres": [],
  "db-mongodb": [],
  "db-redis": [],
  "db-elasticsearch": [],
  "db-sqlite": [],
  "db-mariadb": [],
  "db-all": [],
  dotnet: [generated("src/bin", "build"), generated("src/obj", "build")],
  rails7: railsGenerated,
  "rails7-hotwire": railsGenerated,
  jamstack: nestedNodeGenerated("api", "web"),
  serverless: [generated("node_modules", "dependency"), generated("web/dist", "build"), generated("web/node_modules", "dependency")],
  "spring-react": [generated("backend/target", "build"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")],
  "spring-boot": springGenerated,
  astro: nodeGenerated,
  "django-react": [generated("backend/.pytest_cache", "cache"), generated("backend/.venv", "dependency"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")]
};
var protectedPathsByStack = {
  node: ["src"],
  "node-mean": ["api/src", "web/src"],
  "node-mern": ["api/src", "web/src"],
  "node-t3": ["apps", "packages"],
  bun: ["src"],
  python: ["app.py"],
  "python-django": ["project"],
  "python-flask": ["app.py", "templates"],
  "python-fastapi": ["app"],
  php: ["public", "src"],
  "php-wordpress": ["wp-content"],
  "php-drupal": ["modules", "themes", "web"],
  "php-symfony": ["config", "public", "src", "templates"],
  "db-mysql": [],
  "db-sqlserver": [],
  "db-postgres": [],
  "db-mongodb": [],
  "db-redis": [],
  "db-elasticsearch": [],
  "db-sqlite": [],
  "db-mariadb": [],
  "db-all": [],
  dotnet: ["src"],
  rails7: ["app", "config", "db", "lib"],
  "rails7-hotwire": ["app", "config", "db", "lib"],
  jamstack: ["api/src", "web/src"],
  serverless: ["src", "web/src"],
  "spring-react": ["backend/src", "frontend/src"],
  "spring-boot": ["src"],
  astro: ["public", "src"],
  "django-react": ["backend/project", "frontend/src"]
};
function compatibilityDefinition(id) {
  const scaffoldVersion = "1";
  return defineStack({
    id,
    definitionVersion: 1,
    legacyScaffoldVersions: [],
    assetPath: `${id}/templates`,
    scaffoldVersion,
    generator: { kind: "none" },
    runtimeImages: [],
    install: [],
    start: [],
    readiness: { kind: "command", value: "true", timeoutSeconds: 1 },
    hostWrites: [],
    verification: [],
    loomOwnedFiles: [".env.example", "loom.yaml"],
    generatedPaths: generatedPathsByStack[id],
    protectedPaths: protectedPathsByStack[id],
    compatibility
  });
}
var migratedDefinitions = new Map([
  nodeStack,
  nodeMeanStack,
  nodeMernStack,
  nodeT3Stack,
  bunStack,
  pythonStack,
  pythonDjangoStack,
  pythonFlaskStack,
  pythonFastapiStack,
  phpStack,
  dotnetStack,
  jamstackStack,
  serverlessStack,
  springReactStack,
  springBootStack,
  astroStack,
  djangoReactStack,
  dbMysqlStack,
  dbSqlserverStack,
  dbPostgresStack,
  dbMongodbStack,
  dbRedisStack,
  dbElasticsearchStack,
  dbSqliteStack,
  dbMariadbStack,
  dbAllStack,
  phpWordpressStack,
  phpDrupalStack,
  phpSymfonyStack,
  rails7Stack,
  rails7HotwireStack
].map((definition) => [definition.id, definition]));
var stackDefinitions = stackIds.map((id) => migratedDefinitions.get(id) ?? compatibilityDefinition(id));
var stackDefinitionsById = new Map(stackDefinitions.map((definition) => [definition.id, definition]));
function findStackDefinition(stackId) {
  return stackDefinitionsById.get(stackId);
}
function listStackIds() {
  return stackDefinitions.map(({ id }) => id).sort();
}
for (const definition of stackDefinitions) validateStackDefinition(definition);

// src/database-service.ts
var imageMetadata = {
  postgres: { stackId: "db-postgres", env: "POSTGRES_IMAGE" },
  mysql: { stackId: "db-mysql", env: "MYSQL_IMAGE" },
  mariadb: { stackId: "db-mariadb", env: "MARIADB_IMAGE" },
  mongodb: { stackId: "db-mongodb", env: "MONGO_IMAGE" },
  redis: { stackId: "db-redis", env: "REDIS_IMAGE" }
};
function databaseImage(db) {
  const metadata = imageMetadata[db];
  const definition = findStackDefinition(metadata.stackId);
  const image = definition?.runtimeImages.find(({ env }) => env === metadata.env);
  if (!image) throw new Error(`Missing canonical ${metadata.env} pin for '${metadata.stackId}'`);
  return image;
}
function buildDatabaseServiceBlock(db) {
  const image = databaseImage(db);
  switch (db) {
    case "postgres":
      return {
        serviceName: "postgres",
        serviceYaml: [
          "  postgres:",
          "    type: postgres",
          `    image: \${POSTGRES_IMAGE:-${image.reference}}`,
          "    env:",
          "      POSTGRES_USER: app",
          "      POSTGRES_PASSWORD: app",
          "      POSTGRES_DB: app",
          "    ports:",
          '      - "5432:5432"',
          "    volumes:",
          "      - ./data/postgres:/var/lib/postgresql/data",
          "    healthcheck:",
          "      command: pg_isready -U app",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 5"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          POSTGRES_USER: "app",
          POSTGRES_PASSWORD: "app",
          POSTGRES_DB: "app",
          DATABASE_URL: "postgresql://app:app@postgres:5432/app"
        }
      };
    case "mysql":
      return {
        serviceName: "mysql",
        serviceYaml: [
          "  mysql:",
          "    type: mysql",
          `    image: \${MYSQL_IMAGE:-${image.reference}}`,
          "    env:",
          "      MYSQL_ROOT_PASSWORD: root",
          "      MYSQL_DATABASE: app",
          "      MYSQL_USER: app",
          "      MYSQL_PASSWORD: app",
          "    ports:",
          '      - "3306:3306"',
          "    volumes:",
          "      - ./data/mysql:/var/lib/mysql",
          "    healthcheck:",
          "      command: mysqladmin ping -h 127.0.0.1 -proot",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 10"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MYSQL_ROOT_PASSWORD: "root",
          MYSQL_DATABASE: "app",
          MYSQL_USER: "app",
          MYSQL_PASSWORD: "app",
          MYSQL_URL: "mysql://app:app@mysql:3306/app"
        }
      };
    case "mariadb":
      return {
        serviceName: "mariadb",
        serviceYaml: [
          "  mariadb:",
          "    type: mariadb",
          `    image: \${MARIADB_IMAGE:-${image.reference}}`,
          "    env:",
          "      MARIADB_ROOT_PASSWORD: root",
          "      MARIADB_DATABASE: app",
          "      MARIADB_USER: app",
          "      MARIADB_PASSWORD: app",
          "    ports:",
          '      - "3307:3306"',
          "    volumes:",
          "      - ./data/mariadb:/var/lib/mysql",
          "    healthcheck:",
          "      command: mariadb-admin ping -h 127.0.0.1 -uroot -proot",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 10"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MARIADB_ROOT_PASSWORD: "root",
          MARIADB_DATABASE: "app",
          MARIADB_USER: "app",
          MARIADB_PASSWORD: "app",
          MARIADB_URL: "mysql://app:app@mariadb:3306/app"
        }
      };
    case "mongodb":
      return {
        serviceName: "mongodb",
        serviceYaml: [
          "  mongodb:",
          "    type: mongodb",
          `    image: \${MONGO_IMAGE:-${image.reference}}`,
          "    env:",
          "      MONGO_INITDB_ROOT_USERNAME: app",
          "      MONGO_INITDB_ROOT_PASSWORD: app",
          "      MONGO_INITDB_DATABASE: app",
          "    ports:",
          '      - "27017:27017"',
          "    volumes:",
          "      - ./data/mongodb:/data/db"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          MONGO_INITDB_ROOT_USERNAME: "app",
          MONGO_INITDB_ROOT_PASSWORD: "app",
          MONGO_INITDB_DATABASE: "app",
          MONGODB_URL: "mongodb://app:app@mongodb:27017/app?authSource=admin"
        }
      };
    case "redis":
      return {
        serviceName: "redis",
        serviceYaml: [
          "  redis:",
          "    type: redis",
          `    image: \${REDIS_IMAGE:-${image.reference}}`,
          "    command: redis-server --appendonly yes",
          "    ports:",
          '      - "6379:6379"',
          "    volumes:",
          "      - ./data/redis:/data",
          "    healthcheck:",
          "      command: redis-cli ping | grep PONG",
          "      intervalSeconds: 3",
          "      timeoutSeconds: 3",
          "      retries: 30",
          "      startPeriodSeconds: 2"
        ].join("\n"),
        envVars: {
          [image.env]: image.reference,
          REDIS_URL: "redis://redis:6379"
        }
      };
  }
}

// src/doctor-output.ts
function formatDoctorResults(results) {
  const labels = { pass: "PASS", warning: "WARN", failure: "FAIL" };
  return results.map(
    (item) => `[${labels[item.status]}] ${item.id}: ${item.summary}${item.detail ? ` \u2014 ${item.detail}` : ""}`
  ).join("\n") + (results.length ? "\n" : "");
}
function formatDoctorJson(results) {
  return `${JSON.stringify(results, null, 2)}
`;
}
function doctorExitCode(results) {
  return results.some(({ status }) => status === "failure") ? 1 : 0;
}

// src/init-prompt.ts
import { createInterface as createInterface2 } from "node:readline/promises";
var initTemplateChoices = [
  "node",
  "node-mean",
  "node-mern",
  "node-t3",
  "bun",
  "python",
  "python-django",
  "python-flask",
  "python-fastapi",
  "php",
  "php-wordpress",
  "php-drupal",
  "php-symfony",
  "db-mysql",
  "db-sqlserver",
  "db-postgres",
  "db-mongodb",
  "db-redis",
  "db-elasticsearch",
  "db-sqlite",
  "db-mariadb",
  "db-all",
  "dotnet",
  "rails7",
  "rails7-hotwire",
  "jamstack",
  "serverless",
  "spring-react",
  "spring-boot",
  "astro",
  "django-react"
];
var initTemplateDescriptions = {
  node: "Node.js runtime starter app.",
  "node-mean": "MongoDB, Express.js, Angular, and Node.js.",
  "node-mern": "MongoDB, Express.js API, React frontend, and Node.js runtime.",
  "node-t3": "Next.js, TypeScript, and a Node.js runtime.",
  bun: "Bun runtime starter app.",
  python: "Python runtime starter app.",
  "python-django": "Django web app on Python.",
  "python-flask": "Flask web app on Python.",
  "python-fastapi": "FastAPI service on Python.",
  php: "Plain PHP app served by Apache + PHP.",
  "php-wordpress": "WordPress with PHP.",
  "php-drupal": "Drupal served by Apache + PHP.",
  "php-symfony": "Symfony app served by Apache + PHP.",
  "db-mysql": "MySQL database only.",
  "db-sqlserver": "SQL Server database only.",
  "db-postgres": "PostgreSQL database only.",
  "db-mongodb": "MongoDB database only.",
  "db-redis": "Redis database only.",
  "db-elasticsearch": "Elasticsearch service only.",
  "db-sqlite": "SQLite starter app and local file database.",
  "db-mariadb": "MariaDB database only.",
  "db-all": "PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite, SQL Server, and Elasticsearch.",
  dotnet: ".NET starter app.",
  rails7: "Rails 7 app bootstrapped into the project and run on a Ruby base image.",
  "rails7-hotwire": "Rails 7 with Hotwire bootstrapped into the project and run on a Ruby base image.",
  jamstack: "JavaScript, APIs, Markup with a static-first frontend and Node.js API.",
  serverless: "Static frontend plus Node.js FaaS-style HTTP functions and webhooks.",
  "spring-react": "Spring Boot backend and React frontend with a local /api proxy.",
  "spring-boot": "Spring Boot application on Java 21.",
  astro: "Astro static site with islands architecture.",
  "django-react": "Django backend and React frontend."
};
var initImageChoicesByTemplate = {
  node: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }],
  "node-mean": [
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }
  ],
  "node-mern": [
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }
  ],
  "node-t3": [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }],
  jamstack: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }],
  serverless: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }],
  "spring-react": [
    { envKey: "JAVA_IMAGE", label: "Java runtime", options: ["docker.io/library/maven:3.9-eclipse-temurin-17", "docker.io/library/maven:3.9-eclipse-temurin-21"] },
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }
  ],
  "spring-boot": [
    { envKey: "JAVA_IMAGE", label: "Java runtime", options: ["docker.io/library/maven:3.9-eclipse-temurin-17", "docker.io/library/maven:3.9-eclipse-temurin-21"] }
  ],
  astro: [{ envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }],
  "django-react": [
    { envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["docker.io/library/python:3.12-slim", "docker.io/library/python:3.13-slim"] },
    { envKey: "NODE_IMAGE", label: "Node runtime", options: ["docker.io/library/node:22-alpine", "docker.io/library/node:24-alpine"] }
  ],
  bun: [{ envKey: "BUN_IMAGE", label: "Bun runtime", options: ["docker.io/oven/bun:1.1", "docker.io/oven/bun:1.2"] }],
  python: [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["docker.io/library/python:3.12-slim", "docker.io/library/python:3.13-slim"] }],
  "python-django": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["docker.io/library/python:3.12-slim", "docker.io/library/python:3.13-slim"] }],
  "python-flask": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["docker.io/library/python:3.12-slim", "docker.io/library/python:3.13-slim"] }],
  "python-fastapi": [{ envKey: "PYTHON_IMAGE", label: "Python runtime", options: ["docker.io/library/python:3.12-slim", "docker.io/library/python:3.13-slim"] }],
  php: [
    { envKey: "PHP_IMAGE", label: "PHP runtime", options: ["docker.io/library/php:8.4-apache", "docker.io/library/php:8.3-apache"] }
  ],
  "php-drupal": [
    { envKey: "PHP_IMAGE", label: "PHP runtime", options: ["docker.io/library/php:8.4-apache", "docker.io/library/php:8.3-apache"] }
  ],
  "php-symfony": [
    { envKey: "PHP_IMAGE", label: "PHP runtime", options: ["docker.io/library/php:8.4-apache", "docker.io/library/php:8.3-apache"] }
  ],
  "php-wordpress": [{ envKey: "WORDPRESS_IMAGE", label: "WordPress image", options: ["docker.io/library/wordpress:6-php8.3-apache", "docker.io/library/wordpress:6-php8.4-apache"] }],
  rails7: [{ envKey: "RUBY_IMAGE", label: "Ruby base image", options: ["docker.io/library/ruby:3.3", "docker.io/library/ruby:3.4"] }],
  "rails7-hotwire": [{ envKey: "RUBY_IMAGE", label: "Ruby base image", options: ["docker.io/library/ruby:3.3", "docker.io/library/ruby:3.4"] }],
  dotnet: [{ envKey: "DOTNET_IMAGE", label: ".NET runtime", options: ["mcr.microsoft.com/dotnet/sdk:8.0", "mcr.microsoft.com/dotnet/sdk:10.0"] }]
};
async function chooseInitTemplate(suggestedTemplate, input = process.stdin, output = process.stdout) {
  output.write("Choose a template to initialize:\n");
  initTemplateChoices.forEach((template, index) => {
    output.write(`${index + 1}. ${template} - ${initTemplateDescriptions[template]}
`);
  });
  if (suggestedTemplate) {
    output.write(`Suggested template: ${suggestedTemplate}
`);
  }
  const rl = createInterface2({ input, output });
  try {
    const prompt = suggestedTemplate ? `Template number or name [default: ${suggestedTemplate}]: ` : "Template number or name: ";
    const answer = (await rl.question(prompt)).trim();
    if (!answer && suggestedTemplate) {
      return suggestedTemplate;
    }
    const selectedIndex = Number.parseInt(answer, 10);
    if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= initTemplateChoices.length) {
      return initTemplateChoices[selectedIndex - 1];
    }
    if (initTemplateChoices.includes(answer)) {
      return answer;
    }
    throw new Error(
      `Unknown template selection '${answer}'. Choose a number from 1 to ${initTemplateChoices.length} or a valid template name.`
    );
  } finally {
    rl.close();
  }
}
function describeInitTemplate(template) {
  return initTemplateDescriptions[template] ?? "Loom project template.";
}
async function chooseInitImageOverrides(template, currentValues, lockedEnvKeys = [], input = process.stdin, output = process.stdout) {
  const imageChoices = (initImageChoicesByTemplate[template] ?? []).filter((choice) => !lockedEnvKeys.includes(choice.envKey));
  if (imageChoices.length === 0) {
    return {};
  }
  const rl = createInterface2({ input, output });
  try {
    const selected = {};
    for (const choice of imageChoices) {
      const currentValue = currentValues[choice.envKey] ?? choice.options[0];
      output.write(`Choose ${choice.label} for '${template}':
`);
      choice.options.forEach((option, index) => {
        output.write(`${index + 1}. ${option}
`);
      });
      const answer = (await rl.question(`${choice.label} [default: ${currentValue}]: `)).trim();
      if (!answer) {
        selected[choice.envKey] = currentValue;
        continue;
      }
      const selectedIndex = Number.parseInt(answer, 10);
      if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= choice.options.length) {
        selected[choice.envKey] = choice.options[selectedIndex - 1];
        continue;
      }
      if (choice.options.includes(answer)) {
        selected[choice.envKey] = answer;
        continue;
      }
      throw new Error(
        `Unknown ${choice.label} selection '${answer}'. Choose a number from 1 to ${choice.options.length} or a listed image tag.`
      );
    }
    return selected;
  } finally {
    rl.close();
  }
}
var supportedDbTypes = ["postgres", "mysql", "mariadb", "mongodb", "redis"];
var dbTypeDescriptions = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
  mongodb: "MongoDB",
  redis: "Redis"
};
function isValidDbType(value) {
  return supportedDbTypes.includes(value);
}
function describeDbType(db) {
  return dbTypeDescriptions[db];
}
async function chooseInitDatabases(input = process.stdin, output = process.stdout) {
  if (!input.isTTY) {
    return [];
  }
  const rl = createInterface2({ input, output });
  try {
    const selected = [];
    while (true) {
      output.write("\nAdd a database (optional)?\n");
      supportedDbTypes.forEach((db, index) => {
        output.write(`${index + 1}. ${describeDbType(db)}
`);
      });
      const answer = (await rl.question("Database number [skip]: ")).trim();
      if (!answer) {
        break;
      }
      const selectedIndex = Number.parseInt(answer, 10);
      if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= supportedDbTypes.length) {
        const db = supportedDbTypes[selectedIndex - 1];
        if (!selected.includes(db)) {
          selected.push(db);
          output.write(`Added ${describeDbType(db)}.
`);
        } else {
          output.write(`${describeDbType(db)} already selected.
`);
        }
        continue;
      }
      if (isValidDbType(answer)) {
        if (!selected.includes(answer)) {
          selected.push(answer);
          output.write(`Added ${describeDbType(answer)}.
`);
        } else {
          output.write(`${describeDbType(answer)} already selected.
`);
        }
        continue;
      }
      output.write(`Unknown database type '${answer}'. Choose a number from 1 to ${supportedDbTypes.length}, or press Enter to skip.
`);
    }
    return selected;
  } finally {
    rl.close();
  }
}

// src/init-template.ts
import { spawn as spawn4 } from "node:child_process";
import { access as access5, readFile as readFile4, readdir as readdir2, rm as rm4 } from "node:fs/promises";
import { resolve as resolve8 } from "node:path";
async function directoryHasFiles(path) {
  try {
    const entries = await readdir2(path);
    return entries.length > 0;
  } catch {
    return false;
  }
}
async function clearDirectoryContents(path) {
  const entries = await readdir2(path);
  const results = await Promise.allSettled(entries.map((entry) => rm4(resolve8(path, entry), { recursive: true, force: true })));
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    const messages = failures.map((f) => f.reason instanceof Error ? f.reason.message : String(f.reason)).join("; ");
    throw new Error(`Failed to clear ${failures.length} entry(ies) in '${path}': ${messages}`);
  }
}
async function fileExists(path) {
  try {
    await access5(path);
    return true;
  } catch {
    return false;
  }
}
async function readTextFile(path) {
  return readFile4(path, "utf8");
}
async function runCommand2(command, args, cwd) {
  await new Promise((resolve14, reject) => {
    const child = spawn4(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve14();
        return;
      }
      reject(new Error(stderr.trim() || `Command '${command}' failed with exit code ${code ?? "unknown"}.`));
    });
  });
}
function errorCode(error) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : void 0;
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function formatBootstrapError(stackId, context, image, error) {
  const detail = errorMessage(error).trim() || "unknown error";
  if (isRegistryAuthError(detail)) {
    return new Error(
      `Failed to initialize '${stackId}' (${context}) because image '${image}' requires registry access or authentication: ${detail}${buildRegistryLoginHint(image)}`
    );
  }
  if (isImageUnavailableError(detail)) {
    return new Error(
      `Failed to initialize '${stackId}' (${context}) because image '${image}' is not available or could not be pulled: ${detail}`
    );
  }
  return new Error(`Failed to initialize '${stackId}' (${context}): ${detail}`);
}
function renderGeneratorCommand(definition) {
  if (definition.generator.kind !== "command") throw new Error(`Stack '${definition.id}' does not declare a command generator.`);
  const generator = definition.generator;
  return generator.command.map((argument) => argument.replaceAll("{package}", generator.package).replaceAll("{version}", generator.version));
}
async function runStackGeneratorWithDependencies(definition, targetDir, dependencies2 = {}) {
  if (definition.generator.kind !== "command") throw new Error(`Stack '${definition.id}' does not declare a command generator.`);
  const execute = dependencies2.runCommand ?? runCommand2;
  const execution = definition.generator.execution;
  const podmanArgs = [
    "run",
    "--rm",
    ...process.platform === "linux" ? ["--userns=keep-id"] : [],
    ...execution.environment.flatMap(({ name, value }) => ["-e", `${name}=${value}`]),
    "-v",
    `${targetDir}:${execution.mountTarget}`,
    ...execution.workdir === void 0 ? [] : ["-w", execution.workdir],
    definition.generator.image,
    ...renderGeneratorCommand(definition)
  ];
  try {
    await execute("podman", podmanArgs, targetDir);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      throw new Error(
        `Podman is required to initialize '${definition.id}'. Install Podman and retry 'loom init ${definition.id}'.`
      );
    }
    throw formatBootstrapError(
      definition.id,
      execution.context,
      definition.generator.image,
      error
    );
  }
}
async function looksLikeDrupalProject(targetDir, dependencies2) {
  const hasFile = dependencies2.fileExists ?? fileExists;
  const readText = dependencies2.readTextFile ?? readTextFile;
  if (await hasFile(resolve8(targetDir, "web", "index.php"))) {
    return true;
  }
  if (!await hasFile(resolve8(targetDir, "composer.json"))) {
    return false;
  }
  try {
    const composerJson = await readText(resolve8(targetDir, "composer.json"));
    return /drupal\/(core|recommended-project|legacy-project)/i.test(composerJson);
  } catch {
    return false;
  }
}
async function looksLikeRailsProject(targetDir, dependencies2) {
  const hasFile = dependencies2.fileExists ?? fileExists;
  return await hasFile(resolve8(targetDir, "Gemfile")) && (await hasFile(resolve8(targetDir, "bin", "rails")) || await hasFile(resolve8(targetDir, "config", "application.rb")));
}
async function looksLikeWordPressProject(targetDir, dependencies2) {
  const hasFile = dependencies2.fileExists ?? fileExists;
  return await hasFile(resolve8(targetDir, "index.php")) && (await hasFile(resolve8(targetDir, "wp-config.php")) || await hasFile(resolve8(targetDir, "wp-content")) || await hasFile(resolve8(targetDir, "wp-includes", "version.php")));
}
async function looksLikeSymfonyProject(targetDir, dependencies2) {
  const hasFile = dependencies2.fileExists ?? fileExists;
  const readText = dependencies2.readTextFile ?? readTextFile;
  if (await hasFile(resolve8(targetDir, "bin", "console")) || await hasFile(resolve8(targetDir, "config", "bundles.php"))) {
    return true;
  }
  if (!await hasFile(resolve8(targetDir, "composer.json"))) {
    return false;
  }
  try {
    const composerJson = await readText(resolve8(targetDir, "composer.json"));
    return /symfony\/(framework-bundle|runtime|console|webapp-pack|skeleton)/i.test(composerJson);
  } catch {
    return false;
  }
}
async function prepareInitTarget(definition, targetDir, blankTemplate, dependencies2 = {}) {
  const template = definition.id;
  const hasFiles = dependencies2.directoryHasFiles ?? directoryHasFiles;
  const nonEmpty = await hasFiles(targetDir);
  if (template === "php-drupal") {
    if (nonEmpty) {
      if (await looksLikeDrupalProject(targetDir, dependencies2)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }
      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom runs composer create-project in that directory.`
      );
    }
    const bootstrapDrupal = dependencies2.runDrupalCreateProject ?? ((path) => runStackGeneratorWithDependencies(definition, path));
    await bootstrapDrupal(targetDir);
    return { overwriteTemplateFiles: false };
  }
  if (template === "php-wordpress") {
    if (nonEmpty) {
      if (await looksLikeWordPressProject(targetDir, dependencies2)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example", "wp-config.php"]
        };
      }
      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps WordPress files in that directory.`
      );
    }
    const bootstrapWordPress = dependencies2.runWordPressCreateProject ?? ((path) => runStackGeneratorWithDependencies(definition, path));
    await bootstrapWordPress(targetDir);
    return { overwriteTemplateFiles: false };
  }
  if (template === "rails7") {
    if (nonEmpty) {
      if (await looksLikeRailsProject(targetDir, dependencies2)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }
      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Rails project in that directory.`
      );
    }
    const bootstrapRails = dependencies2.runRailsCreateProject ?? ((path) => runStackGeneratorWithDependencies(definition, path));
    await bootstrapRails(targetDir);
    return { overwriteTemplateFiles: false };
  }
  if (template === "rails7-hotwire") {
    if (nonEmpty) {
      if (await looksLikeRailsProject(targetDir, dependencies2)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }
      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Rails project in that directory.`
      );
    }
    const bootstrapRailsHotwire = dependencies2.runRailsHotwireCreateProject ?? ((path) => runStackGeneratorWithDependencies(definition, path));
    await bootstrapRailsHotwire(targetDir);
    return { overwriteTemplateFiles: false };
  }
  if (template === "php-symfony") {
    if (nonEmpty) {
      if (await looksLikeSymfonyProject(targetDir, dependencies2)) {
        return {
          overwriteTemplateFiles: true,
          templateEntriesToUpdate: ["loom.yaml"],
          templateEntriesToCreateIfMissing: [".env.example"]
        };
      }
      throw new Error(
        `Target directory '${targetDir}' must be empty to initialize '${template}' because Loom bootstraps the Symfony project in that directory.`
      );
    }
    const bootstrapSymfony = dependencies2.runSymfonyCreateProject ?? ((path) => runStackGeneratorWithDependencies(definition, path));
    await bootstrapSymfony(targetDir);
    return {
      overwriteTemplateFiles: false,
      templateEntriesToUpdate: ["loom.yaml"],
      templateEntriesToCreateIfMissing: [".env.example"]
    };
  }
  if (nonEmpty && blankTemplate) {
    process.stderr.write(
      `Warning: '--blank-template' will delete all existing files in '${targetDir}'. Starting fresh template copy...
`
    );
    const clear = dependencies2.clearDirectory ?? clearDirectoryContents;
    await clear(targetDir);
    return { overwriteTemplateFiles: false };
  }
  if (nonEmpty) {
    return {
      overwriteTemplateFiles: false,
      templateEntriesToUpdate: ["loom.yaml"],
      templateEntriesToCreateIfMissing: [".env.example"]
    };
  }
  return { overwriteTemplateFiles: false };
}

// src/project-manifest.ts
import { createHash as createHash2 } from "node:crypto";
import { mkdir as mkdir5, readFile as readFile5, rename, rm as rm5, writeFile as writeFile3 } from "node:fs/promises";
import { isAbsolute as isAbsolute3, resolve as resolve9 } from "node:path";
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertSafeRelativePath(path, label) {
  const segments = path.split(/[\\/]/);
  if (!path || isAbsolute3(path) || /^[A-Za-z]:[\\/]/.test(path) || segments.some((segment) => !segment || segment === ".." || segment === ".")) {
    throw new Error(`Unsafe ${label} '${path}' in Loom project manifest`);
  }
}
function assertCommonManifest(value) {
  if (typeof value.loomVersion !== "string" || !isRecord(value.stack) || typeof value.stack.id !== "string" || typeof value.stack.scaffoldVersion !== "string" || !isRecord(value.ownedFiles)) throw new Error("Invalid Loom project manifest");
}
function parseV1(value) {
  assertCommonManifest(value);
  for (const [path, entry] of Object.entries(value.ownedFiles)) {
    assertSafeRelativePath(path, "owned file path");
    if (!isRecord(entry) || typeof entry.sha256 !== "string") throw new Error("Invalid Loom project manifest owned file entry");
  }
  return value;
}
function parseV2(value) {
  assertCommonManifest(value);
  const definitionVersion = value.stack.definitionVersion;
  if (definitionVersion !== void 0 && (!Number.isInteger(definitionVersion) || definitionVersion <= 0)) {
    throw new Error("Invalid Loom project manifest stack definition version");
  }
  for (const [path, entry] of Object.entries(value.ownedFiles)) {
    assertSafeRelativePath(path, "owned file path");
    if (!isRecord(entry) || typeof entry.sha256 !== "string" || typeof entry.baselinePath !== "string") {
      throw new Error("Invalid Loom project manifest owned file entry");
    }
    assertSafeRelativePath(entry.baselinePath, "baseline path");
  }
  if (!isRecord(value.renderInputs) || typeof value.renderInputs.projectName !== "string" || typeof value.renderInputs.adopted !== "boolean" || !Array.isArray(value.renderInputs.databases) || !value.renderInputs.databases.every((database) => typeof database === "string") || value.renderInputs.phpDocroot !== void 0 && typeof value.renderInputs.phpDocroot !== "string") {
    throw new Error("Invalid Loom project manifest render inputs");
  }
  return value;
}
function classifyProjectManifestStack(manifest, stack) {
  if (manifest.stack.id !== stack.id) {
    return { kind: "incompatible", reason: `Manifest stack '${manifest.stack.id}' does not match '${stack.id}'` };
  }
  const definitionVersion = "definitionVersion" in manifest.stack ? manifest.stack.definitionVersion : void 0;
  if (definitionVersion === stack.definitionVersion && manifest.stack.scaffoldVersion === stack.scaffoldVersion) {
    return { kind: "current" };
  }
  if ((definitionVersion === void 0 || definitionVersion < stack.definitionVersion) && stack.legacyScaffoldVersions.includes(manifest.stack.scaffoldVersion)) {
    return { kind: "legacy-compatible" };
  }
  if (definitionVersion !== void 0 && definitionVersion > stack.definitionVersion) {
    return {
      kind: "incompatible",
      reason: `Manifest definition version ${definitionVersion} is newer than supported version ${stack.definitionVersion}`
    };
  }
  return {
    kind: "incompatible",
    reason: `Scaffold version '${manifest.stack.scaffoldVersion}' is not a declared legacy scaffold version for '${stack.id}'`
  };
}
async function sha256File(path) {
  try {
    const contents = await readFile5(path);
    return createHash2("sha256").update(contents).digest("hex");
  } catch (error) {
    if (error.code === "ENOENT") return void 0;
    throw error;
  }
}
function getBaselinePath(relativePath, sha256) {
  return `.loom/baselines/${sha256}-${encodeURIComponent(relativePath)}`;
}
async function buildProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs) {
  const ownedFiles = {};
  for (const relativePath of ownedFilePaths) {
    assertSafeRelativePath(relativePath, "owned file path");
    const sha256 = await sha256File(resolve9(targetDir, relativePath));
    if (sha256) ownedFiles[relativePath] = { sha256, baselinePath: getBaselinePath(relativePath, sha256) };
  }
  return {
    version: 2,
    loomVersion,
    stack: { id: stack.id, scaffoldVersion: stack.scaffoldVersion, definitionVersion: stack.definitionVersion },
    ownedFiles,
    renderInputs: {
      projectName: renderInputs.projectName,
      ...renderInputs.phpDocroot === void 0 ? {} : { phpDocroot: renderInputs.phpDocroot },
      databases: [...renderInputs.databases].sort(),
      adopted: renderInputs.adopted
    }
  };
}
async function loadProjectManifest(targetDir) {
  let contents;
  try {
    contents = await readFile5(resolve9(targetDir, ".loom", "manifest.json"), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { kind: "missing" };
    throw error;
  }
  const value = JSON.parse(contents);
  if (!isRecord(value) || typeof value.version !== "number") throw new Error("Invalid Loom project manifest");
  if (value.version === 1) return { kind: "migration-required", manifest: parseV1(value) };
  if (value.version === 2) return { kind: "ready", manifest: parseV2(value) };
  throw new Error(`Unsupported manifest version '${value.version}'`);
}
async function writeProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs) {
  const manifest = await buildProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs);
  const loomDir = resolve9(targetDir, ".loom");
  const manifestPath = resolve9(loomDir, "manifest.json");
  const temporaryPath = resolve9(loomDir, `manifest.json.tmp-${process.pid}`);
  await mkdir5(resolve9(loomDir, "baselines"), { recursive: true });
  for (const [relativePath, entry] of Object.entries(manifest.ownedFiles)) {
    const destination = resolve9(targetDir, entry.baselinePath);
    const temporaryBaseline = `${destination}.tmp-${process.pid}`;
    try {
      await writeFile3(temporaryBaseline, await readFile5(resolve9(targetDir, relativePath)));
      await rename(temporaryBaseline, destination);
    } finally {
      await rm5(temporaryBaseline, { force: true });
    }
  }
  try {
    await writeFile3(temporaryPath, `${JSON.stringify(manifest, null, 2)}
`, "utf8");
    await rename(temporaryPath, manifestPath);
  } finally {
    await rm5(temporaryPath, { force: true });
  }
  return manifestPath;
}

// src/project-clean.ts
import {
  lstat as nodeLstat,
  readdir as nodeReaddir,
  realpath as nodeRealpath,
  rm as nodeRm
} from "node:fs/promises";
import { isAbsolute as isAbsolute4, relative, resolve as resolve10 } from "node:path";
var defaultDependencies = {
  lstat: nodeLstat,
  readdir: (path, options) => nodeReaddir(path, options),
  realpath: nodeRealpath,
  rm: nodeRm
};
var fixedProtectedPaths = [".env", "loom.yaml"];
var dependencyManifestNames = /* @__PURE__ */ new Set([
  "Cargo.toml",
  "Gemfile",
  "Pipfile",
  "composer.json",
  "package.json",
  "pom.xml",
  "pyproject.toml",
  "requirements.txt",
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "settings.gradle.kts"
]);
var lockfileNames = /* @__PURE__ */ new Set([
  "Cargo.lock",
  "Gemfile.lock",
  "Pipfile.lock",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "gradle.lockfile",
  "package-lock.json",
  "packages.lock.json",
  "pnpm-lock.yaml",
  "poetry.lock",
  "uv.lock",
  "yarn.lock"
]);
function dependencies(overrides) {
  return { ...defaultDependencies, ...overrides };
}
function isKnownProtectedFile(path) {
  const name = path.split("/").at(-1);
  return name === ".env" || name === "loom.yaml" || dependencyManifestNames.has(name) || lockfileNames.has(name) || name.endsWith(".csproj") || name.endsWith(".sln") || /^requirements(?:-[^/]+)?\.txt$/.test(name);
}
function assertSafeRelativePath2(path) {
  const parts = path.split("/");
  if (!path || path === "." || isAbsolute4(path) || /^[A-Za-z]:[\\/]/.test(path) || path.includes("\\") || parts.some((part) => !part || part === "." || part === "..") || path === ".loom" || path.startsWith(".loom/")) {
    throw new Error(`Unsafe generated path '${path}'`);
  }
}
function containsPath(container, protectedPath) {
  return container === protectedPath || protectedPath.startsWith(`${container}/`);
}
function assertNotProtected(path, protectedPaths) {
  if (isKnownProtectedFile(path) || protectedPaths.some((protectedPath) => containsPath(path, protectedPath))) {
    throw new Error(`Generated path '${path}' contains a protected path`);
  }
}
function containedTarget(projectRoot, path) {
  const target = resolve10(projectRoot, path);
  const fromRoot = relative(projectRoot, target);
  if (!fromRoot || fromRoot === ".." || fromRoot.startsWith("../") || isAbsolute4(fromRoot)) {
    throw new Error(`Unsafe generated path '${path}' escapes the project root`);
  }
  return target;
}
async function optionalLstat(path, fs) {
  try {
    return await fs.lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return void 0;
    throw error;
  }
}
async function validatePathChain(projectRoot, path, fs) {
  let current = projectRoot;
  for (const part of path.split("/")) {
    current = resolve10(current, part);
    const stats = await optionalLstat(current, fs);
    if (!stats) return void 0;
    if (stats.isSymbolicLink()) throw new Error(`Generated path '${path}' traverses a symlink at '${current}'`);
  }
  return optionalLstat(containedTarget(projectRoot, path), fs);
}
async function inspectTree(absolutePath, relativePath, initialStats, fs) {
  if (initialStats.isSymbolicLink()) return 0;
  if (initialStats.isFile()) return initialStats.size;
  if (!initialStats.isDirectory()) return 0;
  let bytes = 0;
  const entries = (await fs.readdir(absolutePath, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const childRelative = `${relativePath}/${entry.name}`;
    const childAbsolute = resolve10(absolutePath, entry.name);
    const stats = await fs.lstat(childAbsolute);
    bytes += await inspectTree(childAbsolute, childRelative, stats, fs);
  }
  return bytes;
}
async function discoverProjectManifests(projectRoot, generatedPaths, fs) {
  const found = [];
  async function walk(directory, directoryRelative) {
    const entries = (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const childRelative = directoryRelative ? `${directoryRelative}/${entry.name}` : entry.name;
      if (childRelative === ".loom" || childRelative.startsWith(".loom/") || childRelative === ".git" || generatedPaths.some((generatedPath) => childRelative === generatedPath || childRelative.startsWith(`${generatedPath}/`))) {
        continue;
      }
      const childAbsolute = resolve10(directory, entry.name);
      const stats = await fs.lstat(childAbsolute);
      if (stats.isSymbolicLink()) continue;
      if (stats.isDirectory()) await walk(childAbsolute, childRelative);
      else if (stats.isFile() && isKnownProtectedFile(childRelative)) found.push(childRelative);
    }
  }
  await walk(projectRoot, "");
  return found;
}
async function getProtectedPaths(projectRoot, stack, manifest, fs) {
  const discovered = await discoverProjectManifests(projectRoot, stack.generatedPaths.map(({ path }) => path), fs);
  return [.../* @__PURE__ */ new Set([
    ...fixedProtectedPaths,
    ...stack.protectedPaths,
    ...Object.keys(manifest.ownedFiles),
    ...discovered
  ])].sort();
}
function validateAllDeclarations(items, protectedPaths) {
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    assertSafeRelativePath2(item.path);
    assertNotProtected(item.path, protectedPaths);
    if (!["dependency", "cache", "build"].includes(item.category)) {
      throw new Error(`Unsafe generated path category for '${item.path}'`);
    }
    if (seen.has(item.path)) throw new Error(`Unsafe duplicate generated path '${item.path}'`);
    seen.add(item.path);
  }
}
async function planProjectClean(options) {
  const fs = dependencies(options.dependencies);
  const projectRoot = await fs.realpath(options.projectRoot);
  const declarations = options.stack.generatedPaths.map(({ path, category }) => ({ path, category }));
  const initialProtectedPaths = [...fixedProtectedPaths, ...options.stack.protectedPaths, ...Object.keys(options.manifest.ownedFiles)].sort();
  validateAllDeclarations(declarations, initialProtectedPaths);
  const protectedPaths = await getProtectedPaths(projectRoot, options.stack, options.manifest, fs);
  validateAllDeclarations(declarations, protectedPaths);
  const items = [];
  for (const declaration of [...declarations].sort((a, b) => a.path.localeCompare(b.path))) {
    const target = containedTarget(projectRoot, declaration.path);
    const stats = await validatePathChain(projectRoot, declaration.path, fs);
    const bytes = stats ? await inspectTree(target, declaration.path, stats, fs) : 0;
    items.push({ ...declaration, exists: stats !== void 0, bytes });
  }
  return { projectRoot, items, totalBytes: items.reduce((total, item) => total + item.bytes, 0), protectedPaths };
}
async function applyProjectClean(plan, dependencyOverrides) {
  const fs = dependencies(dependencyOverrides);
  const projectRoot = await fs.realpath(plan.projectRoot);
  if (projectRoot !== plan.projectRoot) throw new Error("Unsafe cleanup plan project root changed after planning");
  validateAllDeclarations(plan.items, plan.protectedPaths);
  const removed = [];
  const missing = [];
  for (const item of [...plan.items].sort((a, b) => a.path.localeCompare(b.path))) {
    const target = containedTarget(projectRoot, item.path);
    const stats = await validatePathChain(projectRoot, item.path, fs);
    if (!stats) {
      missing.push(item.path);
      continue;
    }
    if (!item.exists) throw new Error(`Generated path '${item.path}' appeared after cleanup planning`);
    await inspectTree(target, item.path, stats, fs);
    await fs.rm(target, { recursive: true, force: false });
    removed.push(item.path);
  }
  return { removed, missing };
}

// src/project-doctor.ts
import { constants as constants4 } from "node:fs";
import { access as access6, lstat, readdir as readdir3 } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname as dirname3, resolve as resolve11 } from "node:path";
var lockfileFamilies = [
  { manifest: "package.json", locks: ["bun.lock", "bun.lockb", "npm-shrinkwrap.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"] },
  { manifest: "composer.json", locks: ["composer.lock"] },
  { manifest: "pyproject.toml", locks: ["Pipfile.lock", "poetry.lock", "uv.lock"] },
  { manifest: "Gemfile", locks: ["Gemfile.lock"] },
  { manifest: "pom.xml", locks: ["gradle.lockfile"] }
];
var runtimeImageServiceTypeByEnv = {
  ALPINE_IMAGE: "alpine",
  BUN_IMAGE: "node",
  DOTNET_IMAGE: "dotnet",
  ELASTICSEARCH_IMAGE: "elasticsearch",
  JAVA_IMAGE: "java",
  MARIADB_IMAGE: "mariadb",
  MEMCACHED_IMAGE: "memcached",
  MONGO_IMAGE: "mongodb",
  MSSQL_IMAGE: "sqlserver",
  MYSQL_IMAGE: "mysql",
  NODE_IMAGE: "node",
  PHP_IMAGE: "php",
  POSTGRES_IMAGE: "postgres",
  PYTHON_IMAGE: "python",
  REDIS_IMAGE: "redis",
  RUBY_IMAGE: "ruby",
  SQLITE_IMAGE: "sqlite",
  WORDPRESS_IMAGE: "php"
};
function result(id, status, summary, detail) {
  return { id, status, summary, ...detail ? { detail } : {} };
}
function dependencyRoots(stack) {
  if (!stack) return [];
  return [...new Set(stack.generatedPaths.filter(({ category }) => category === "dependency").map(({ path }) => {
    const railsBundleSuffix = "vendor/bundle";
    if (path === railsBundleSuffix) return "";
    if (path.endsWith(`/${railsBundleSuffix}`)) return path.slice(0, -railsBundleSuffix.length - 1);
    const parent = dirname3(path);
    return parent === "." ? "" : parent;
  }))].sort();
}
async function dependencyFiles(projectRoot, roots) {
  const found = /* @__PURE__ */ new Map();
  for (const relativeDirectory of roots) {
    const directory = resolve11(projectRoot, relativeDirectory);
    let entries;
    try {
      entries = await readdir3(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    const names = /* @__PURE__ */ new Set();
    for (const entry of entries) {
      if (entry.isFile()) names.add(entry.name);
    }
    found.set(relativeDirectory, names);
  }
  return found;
}
function parsePortMapping(mapping) {
  const protocolParts = mapping.split("/");
  if (protocolParts.length > 2 || protocolParts[1] !== void 0 && protocolParts[1] !== "tcp") return void 0;
  const parts = protocolParts[0].split(":");
  if (parts.length < 1 || parts.length > 3) return void 0;
  const numbers = parts.length === 3 ? parts.slice(1) : parts;
  if (parts.length === 3 && !parts[0]) return void 0;
  if (!numbers.every((value) => /^\d+$/.test(value))) return void 0;
  const parsed = numbers.map(Number);
  if (parsed.some((port) => port < 1 || port > 65535)) return void 0;
  return parsed.length === 1 ? { containerPort: parsed[0], source: mapping } : { hostPort: parsed[0], containerPort: parsed[1], source: mapping };
}
async function manifestCheck(options) {
  if (options.manifest.kind === "missing") return result("manifest", "failure", "Project manifest is missing");
  if (!options.stack || options.stack.id !== options.manifest.manifest.stack.id) return result("manifest", "failure", "Manifest selects an unknown stack", options.manifest.manifest.stack.id);
  const compatibility2 = classifyProjectManifestStack(options.manifest.manifest, options.stack);
  if (compatibility2.kind === "incompatible") return result("manifest", "failure", "Project manifest is incompatible with this Loom release", compatibility2.reason);
  if (options.manifest.kind === "migration-required") return result("manifest", "warning", "Project manifest requires migration", "Run loom upgrade --initialize-baseline.");
  if (compatibility2.kind === "legacy-compatible") {
    return result("manifest", "warning", "Project definition metadata requires upgrade", "Run loom upgrade to record the current definition version.");
  }
  return result("manifest", "pass", "Project manifest is current");
}
function imagesCheck(options) {
  if (!options.stack) return result("images", "failure", "Runtime image pins cannot be checked for an unknown stack");
  const expectedByServiceType = /* @__PURE__ */ new Map();
  const addDefinitionImages = (definition) => {
    for (const { env, reference } of definition.runtimeImages) {
      const serviceType = runtimeImageServiceTypeByEnv[env];
      if (!serviceType) continue;
      const references = expectedByServiceType.get(serviceType) ?? /* @__PURE__ */ new Set();
      references.add(reference);
      expectedByServiceType.set(serviceType, references);
    }
  };
  addDefinitionImages(options.stack);
  if (options.manifest.kind === "ready") {
    for (const database of [...new Set(options.manifest.manifest.renderInputs.databases)].sort()) {
      const definition = findStackDefinition(`db-${database}`);
      if (definition) addDefinitionImages(definition);
    }
  }
  const overrides = Object.entries(options.config.services).sort(([a], [b]) => a.localeCompare(b)).filter(([, service]) => expectedByServiceType.get(service.type)?.has(service.image) !== true).map(([serviceName, service]) => `${serviceName}=${service.image}`);
  return overrides.length ? result("images", "warning", "Runtime image overrides reduce reproducibility", overrides.join("; ")) : result("images", "pass", "Runtime images match selected stack definitions");
}
async function podmanCheck(config, probes) {
  if (!config.runtime.rootless) return result("podman", "failure", "Project configuration does not enable rootless Podman");
  const capabilities = await probes.podman();
  if (!capabilities.available) return result("podman", "failure", "Podman is unavailable");
  if (!capabilities.rootless) return result("podman", "failure", "Podman is not running rootless");
  return result("podman", "pass", "Rootless Podman is available", capabilities.version);
}
function architectureCheck(stack, probes) {
  const architecture = probes.architecture();
  if (!stack) return result("architecture", "failure", "Stack compatibility is unknown");
  return stack.compatibility.architectures.includes(architecture) ? result("architecture", "pass", `Host architecture ${architecture} is supported`) : result("architecture", "failure", `Host architecture ${architecture} is unsupported`);
}
async function lockfilesCheck(projectRoot, stack) {
  const directories = await dependencyFiles(projectRoot, dependencyRoots(stack));
  const problems = [];
  for (const [directory, names] of [...directories].sort(([a], [b]) => a.localeCompare(b))) {
    for (const family of lockfileFamilies) {
      if (!names.has(family.manifest)) continue;
      const present = family.locks.filter((lock) => names.has(lock));
      const location = directory || ".";
      if (present.length === 0) problems.push(`${location}/${family.manifest}: missing lockfile`);
      else if (present.length > 1) problems.push(`${location}/${family.manifest}: conflicting lockfiles (${present.join(", ")})`);
    }
  }
  if (!problems.length) return result("lockfiles", "pass", "Dependency lockfiles are consistent");
  const conflicts = problems.filter((problem) => problem.includes("conflicting"));
  return result("lockfiles", conflicts.length ? "failure" : "warning", conflicts.length ? "Dependency lockfiles conflict" : "Dependency lockfiles are missing", problems.join("; "));
}
async function dependenciesCheck(projectRoot, stack, probes) {
  if (!stack) return result("dependencies", "failure", "Dependency paths cannot be checked for an unknown stack");
  const failures = [];
  const currentUid = process.getuid?.();
  for (const item of stack.generatedPaths.filter(({ category }) => category === "dependency")) {
    const state = await probes.pathState(resolve11(projectRoot, item.path));
    if (!state.exists) continue;
    if (!state.writable) failures.push(`${item.path} is not writable`);
    if (currentUid !== void 0 && state.uid !== void 0 && state.uid !== currentUid) failures.push(`${item.path} is owned by uid ${state.uid}`);
  }
  return failures.length ? result("dependencies", "failure", "Dependency paths have ownership or permission problems", failures.join("; ")) : result("dependencies", "pass", "Dependency paths are writable");
}
function parsedServicePorts(config) {
  const mappings = /* @__PURE__ */ new Map();
  const errors = [];
  for (const [serviceName, service] of Object.entries(config.services).sort(([a], [b]) => a.localeCompare(b))) {
    const parsed = [];
    for (const mapping of service.ports ?? []) {
      const value = parsePortMapping(mapping);
      if (value) parsed.push(value);
      else errors.push(`${serviceName}: ${mapping}`);
    }
    mappings.set(serviceName, parsed);
  }
  return { mappings, errors };
}
async function portsCheck(config, probes, parsed) {
  if (parsed.errors.length) return result("ports", "failure", "Service port mappings are invalid", parsed.errors.join("; "));
  const claims = /* @__PURE__ */ new Map();
  for (const [serviceName, mappings] of parsed.mappings) {
    for (const mapping of mappings) {
      if (mapping.hostPort === void 0) continue;
      const existing = claims.get(mapping.hostPort) ?? [];
      existing.push(`${serviceName} (${mapping.source})`);
      claims.set(mapping.hostPort, existing);
    }
  }
  const duplicateClaims = [...claims].filter(([, claimants]) => claimants.length > 1).sort(([a], [b]) => a - b);
  if (duplicateClaims.length) {
    return result(
      "ports",
      "failure",
      "Configured host ports have conflicting claims",
      duplicateClaims.map(([port, claimants]) => `${port}: ${claimants.join(", ")}`).join("; ")
    );
  }
  const ports = [...new Set([...parsed.mappings.values()].flatMap((items) => items.flatMap(({ hostPort }) => hostPort === void 0 ? [] : [hostPort])))].sort((a, b) => a - b);
  const runningContainers = new Set(await probes.runningContainers(config.name));
  const unavailable = [];
  for (const port of ports) {
    if (await probes.portAvailable(port)) continue;
    const belongsToRunningService = [...parsed.mappings].some(([serviceName, mappings]) => mappings.some(({ hostPort }) => hostPort === port) && runningContainers.has(`${config.name}-${serviceName}`));
    if (!belongsToRunningService) unavailable.push(port);
  }
  return unavailable.length ? result("ports", "failure", "Configured host ports are unavailable", unavailable.join(", ")) : result("ports", "pass", "Configured host ports are available");
}
function routesCheck(config, parsed) {
  const failures = [];
  for (const route of config.routes ?? []) {
    const servicePorts = parsed.mappings.get(route.service);
    if (!servicePorts) failures.push(`${route.host}: service ${route.service} does not exist`);
    else if (!servicePorts.some(({ containerPort }) => containerPort === route.port)) failures.push(`${route.host}: ${route.service} does not expose container port ${route.port}`);
  }
  return failures.length ? result("routes", "failure", "Routes have invalid targets", failures.join("; ")) : result("routes", "pass", "Routes target exposed service ports");
}
async function hostsCheck(config, probes) {
  if (!config.routes?.length) return result("hosts", "pass", "No route host integration is required");
  return await probes.hostsWritable() ? result("hosts", "pass", "Route host integration is writable") : result("hosts", "warning", "Route host integration is unavailable", "Localhost access remains available.");
}
async function defaultPathState(path) {
  try {
    const state = await lstat(path);
    try {
      await access6(path, constants4.W_OK);
      return { exists: true, uid: state.uid, writable: true };
    } catch {
      return { exists: true, uid: state.uid, writable: false };
    }
  } catch (error) {
    if (error.code === "ENOENT") return { exists: false, writable: false };
    throw error;
  }
}
async function defaultPortAvailable(port) {
  return await new Promise((resolveResult, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", (error) => error.code === "EADDRINUSE" || error.code === "EACCES" || error.code === "EPERM" ? resolveResult(false) : reject(error));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close((error) => error ? reject(error) : resolveResult(true)));
  });
}
function defaultDoctorProbes() {
  return {
    podman: detectPodmanCapabilities,
    architecture: () => process.arch,
    pathState: defaultPathState,
    portAvailable: defaultPortAvailable,
    runningContainers: async (projectName) => {
      try {
        return (await listProjectContainers(projectName)).filter(({ running }) => running).map(({ name }) => name);
      } catch {
        return [];
      }
    },
    hostsWritable: async () => {
      if (process.platform === "win32") return false;
      try {
        await access6("/etc/hosts", constants4.W_OK);
        return true;
      } catch {
        return false;
      }
    }
  };
}
async function runProjectDoctor(options) {
  const probes = options.probes ?? defaultDoctorProbes();
  const parsed = parsedServicePorts(options.config);
  return [
    await manifestCheck(options),
    imagesCheck(options),
    await podmanCheck(options.config, probes),
    architectureCheck(options.stack, probes),
    await lockfilesCheck(options.projectRoot, options.stack),
    await dependenciesCheck(options.projectRoot, options.stack, probes),
    await portsCheck(options.config, probes, parsed),
    routesCheck(options.config, parsed),
    await hostsCheck(options.config, probes)
  ];
}

// src/project-upgrade.ts
import { createHash as createHash3 } from "node:crypto";
import { access as access7, copyFile, lstat as lstat2, mkdir as mkdir6, mkdtemp as mkdtemp2, readFile as readFile6, realpath, rename as rename2, rm as rm6, writeFile as writeFile4 } from "node:fs/promises";
import { dirname as dirname4, isAbsolute as isAbsolute5, relative as relative2, resolve as resolve12 } from "node:path";
function assertSafeRelativePath3(path, label) {
  const segments = path.split(/[\\/]/);
  if (!path || isAbsolute5(path) || /^[A-Za-z]:[\\/]/.test(path) || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Unsafe ${label} '${path}'`);
  }
}
function resolveContained(root, path, label) {
  assertSafeRelativePath3(path, label);
  const resolvedRoot = resolve12(root);
  const resolvedPath = resolve12(resolvedRoot, path);
  const fromRoot = relative2(resolvedRoot, resolvedPath);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute5(fromRoot)) throw new Error(`Unsafe ${label} '${path}'`);
  return resolvedPath;
}
async function sha256File2(path) {
  try {
    return createHash3("sha256").update(await readFile6(path)).digest("hex");
  } catch (error) {
    if (error.code === "ENOENT") return void 0;
    throw error;
  }
}
async function assertNoSymlinkPath(root, relativePath, label) {
  assertSafeRelativePath3(relativePath, label);
  const resolvedRoot = await realpath(root);
  const destination = resolve12(resolvedRoot, relativePath);
  const fromRealRoot = relative2(resolvedRoot, destination);
  if (!fromRealRoot || fromRealRoot.startsWith("..") || isAbsolute5(fromRealRoot)) throw new Error(`Unsafe ${label} '${relativePath}'`);
  let current = resolvedRoot;
  for (const segment of relativePath.split(/[\\/]/)) {
    current = resolve12(current, segment);
    try {
      if ((await lstat2(current)).isSymbolicLink()) throw new Error(`Refusing symlinked ${label} '${relativePath}'`);
    } catch (error) {
      if (error.code === "ENOENT") break;
      throw error;
    }
  }
  return destination;
}
function baselinePath(path, sha256) {
  return `.loom/baselines/${sha256}-${encodeURIComponent(path)}`;
}
function renderProjectName(loomYaml, projectName) {
  return loomYaml.replace(/^(name:\s*).+$/m, `$1${projectName}`);
}
function normalizeDocrootPath(raw) {
  const normalized = raw.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return !normalized || normalized === "." ? "." : normalized;
}
function buildPhpBaseCommand(containerDocroot) {
  return [
    "command: |",
    "      set -eu",
    '      target_uid="${HOST_UID:-1000}"',
    '      target_gid="${HOST_GID:-1000}"',
    '      current_gid="$(getent group www-data | cut -d: -f3)"',
    '      if [ "$current_gid" != "$target_gid" ]; then',
    '        if getent group "$target_gid" >/dev/null 2>&1; then',
    '          existing_group="$(getent group "$target_gid" | cut -d: -f1)"',
    '          usermod -g "$existing_group" www-data',
    "        else",
    '          groupmod -o -g "$target_gid" www-data',
    "        fi",
    "      fi",
    '      current_uid="$(id -u www-data)"',
    '      if [ "$current_uid" != "$target_uid" ]; then',
    '        if getent passwd "$target_uid" >/dev/null 2>&1; then',
    '          existing_user="$(getent passwd "$target_uid" | cut -d: -f1)"',
    '          usermod -l loom-www-data -m -d /var/www -s /usr/sbin/nologin "$existing_user" >/dev/null 2>&1 || true',
    "        fi",
    '        usermod -o -u "$target_uid" www-data',
    "      fi",
    "      cat > /etc/apache2/sites-available/000-default.conf << 'APACHE_CONF'",
    "      <VirtualHost *:80>",
    `          DocumentRoot ${containerDocroot}`,
    `          <Directory ${containerDocroot}>`,
    "              Options FollowSymLinks",
    "              AllowOverride All",
    "              Require all granted",
    "              FallbackResource /index.php",
    "          </Directory>",
    "          ErrorLog /dev/stderr",
    "          CustomLog /dev/stdout combined",
    "      </VirtualHost>",
    "      APACHE_CONF",
    "      a2enmod rewrite >/dev/null",
    `      if [ ! -f ${containerDocroot}/index.php ]; then`,
    `        printf '%s\\n' '<?php echo "Loom PHP example is running.";' > ${containerDocroot}/index.php`,
    "      fi",
    "      exec apache2-foreground",
    "    volumes:"
  ].join("\n");
}
function renderPhpDocroot(loomYaml, template, phpDocrootRaw) {
  if (!phpDocrootRaw || ["php-wordpress", "php-drupal"].includes(template)) return loomYaml;
  if (!template.startsWith("php")) throw new Error("--php-docroot can only be used with PHP templates.");
  const phpDocroot = normalizeDocrootPath(phpDocrootRaw);
  if (template === "php") {
    const containerDocroot = phpDocroot === "." ? "/app" : `/app/${phpDocroot}`;
    return loomYaml.replace(/command:\s*\|[\s\S]*?\n\s*volumes:/m, buildPhpBaseCommand(containerDocroot));
  }
  return loomYaml.replace(/(\s+DocumentRoot\s+)\/app\/[^\s]+/, `$1/app/${phpDocroot}`).replace(/(\s+<Directory\s+)\/app\/[^\s>]+(>)/, `$1/app/${phpDocroot}$2`);
}
function renderDatabaseService(loomYaml, db) {
  const { serviceName, serviceYaml } = buildDatabaseServiceBlock(db);
  if (new RegExp(`^ {2}${serviceName}:`, "m").test(loomYaml)) return loomYaml;
  const insertion = /^(routes:|tasks:)/m.test(loomYaml) ? loomYaml.replace(/^(routes:|tasks:)/m, `${serviceYaml}
$1`) : `${loomYaml.trimEnd()}
${serviceYaml}
`;
  if (/^ {4}dependsOn:/m.test(insertion)) {
    return insertion.replace(/^( {4}dependsOn:(?:\n {6}- [^\n]+)*)/m, `$1
      - ${serviceName}`);
  }
  const portsIndex = insertion.indexOf("\n    ports:");
  return portsIndex === -1 ? insertion : `${insertion.slice(0, portsIndex)}
    dependsOn:
      - ${serviceName}${insertion.slice(portsIndex)}`;
}
async function renderCandidates(options, candidateRoot) {
  const assetRoot = resolveContained(options.stacksRoot, options.stack.assetPath, "stack asset path");
  for (const path of options.stack.loomOwnedFiles) {
    const source = resolveContained(assetRoot, path, "Loom-owned asset path");
    try {
      await access7(source);
    } catch {
      throw new Error(`Missing Loom-owned asset '${path}' for stack '${options.stack.id}'`);
    }
    const destination = resolveContained(candidateRoot, path, "candidate path");
    await mkdir6(resolve12(destination, ".."), { recursive: true });
    await copyFile(source, destination);
  }
  if (options.stack.loomOwnedFiles.includes("loom.yaml")) {
    const path = resolve12(candidateRoot, "loom.yaml");
    let content = await readFile6(path, "utf8");
    content = renderProjectName(content, options.manifest.renderInputs.projectName);
    content = renderPhpDocroot(content, options.stack.id, options.manifest.renderInputs.phpDocroot);
    for (const database of options.manifest.renderInputs.databases) {
      if (!["postgres", "mysql", "mariadb", "mongodb", "redis"].includes(database)) throw new Error(`Unknown stored database type '${database}'`);
      content = renderDatabaseService(content, database);
    }
    await writeFile4(path, content, "utf8");
  }
}
async function planProjectUpgrade(options) {
  const compatibility2 = classifyProjectManifestStack(options.manifest, options.stack);
  if (compatibility2.kind === "incompatible") {
    throw new Error(`Project manifest is incompatible with stack '${options.stack.id}': ${compatibility2.reason}`);
  }
  await mkdir6(resolve12(options.projectRoot, ".loom"), { recursive: true });
  const candidateRoot = await mkdtemp2(resolve12(options.projectRoot, ".loom", "upgrade-candidate-"));
  try {
    for (const path of Object.keys(options.manifest.ownedFiles)) assertSafeRelativePath3(path, "owned file path");
    for (const path of options.stack.loomOwnedFiles) assertSafeRelativePath3(path, "Loom-owned asset path");
    await renderCandidates(options, candidateRoot);
    const files = [];
    for (const path of Object.keys(options.manifest.ownedFiles).sort()) {
      if (!options.stack.loomOwnedFiles.includes(path)) throw new Error(`Stack '${options.stack.id}' does not declare owned asset '${path}'`);
      const currentSha256 = await sha256File2(resolveContained(options.projectRoot, path, "owned file path"));
      const candidatePath = resolveContained(candidateRoot, path, "candidate path");
      const candidateSha256 = await sha256File2(candidatePath);
      if (!candidateSha256) throw new Error(`Missing Loom-owned asset '${path}' for stack '${options.stack.id}'`);
      const baselineSha256 = options.manifest.ownedFiles[path].sha256;
      files.push({ path, state: currentSha256 === void 0 ? "missing" : currentSha256 === baselineSha256 ? "unchanged" : "modified", ...currentSha256 ? { currentSha256 } : {}, baselineSha256, candidateSha256, candidatePath });
    }
    return { projectRoot: resolve12(options.projectRoot), candidateRoot, manifest: options.manifest, stack: options.stack, files };
  } catch (error) {
    await rm6(candidateRoot, { recursive: true, force: true });
    throw error;
  }
}
async function applyProjectUpgrade(plan, options) {
  const updated = plan.files.filter((file) => file.state !== "modified" || options.forceModified).map((file) => file.path);
  const skipped = plan.files.filter((file) => file.state === "modified" && !options.forceModified).map((file) => file.path);
  const loomDir = await assertNoSymlinkPath(plan.projectRoot, ".loom", "Loom metadata path");
  const stageRoot = await mkdtemp2(resolve12(loomDir, "upgrade-stage-"));
  try {
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const staged = resolveContained(stageRoot, file.path, "staged owned file path");
      await mkdir6(dirname4(staged), { recursive: true });
      await copyFile(file.candidatePath, staged);
      if (await sha256File2(staged) !== file.candidateSha256) throw new Error(`Candidate hash changed for '${file.path}'`);
      const target = await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
      await mkdir6(dirname4(target), { recursive: true });
      await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
    }
    const nextManifest = {
      ...plan.manifest,
      loomVersion: package_default.version,
      stack: {
        id: plan.stack.id,
        scaffoldVersion: plan.stack.scaffoldVersion,
        definitionVersion: plan.stack.definitionVersion
      },
      ownedFiles: { ...plan.manifest.ownedFiles }
    };
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const nextBaselinePath = baselinePath(file.path, file.candidateSha256);
      const stagedBaseline = resolveContained(stageRoot, nextBaselinePath, "staged baseline path");
      await mkdir6(dirname4(stagedBaseline), { recursive: true });
      await copyFile(file.candidatePath, stagedBaseline);
      nextManifest.ownedFiles[file.path] = { sha256: file.candidateSha256, baselinePath: nextBaselinePath };
    }
    const stagedManifest = resolve12(stageRoot, ".loom", "manifest.json");
    await mkdir6(dirname4(stagedManifest), { recursive: true });
    await writeFile4(stagedManifest, `${JSON.stringify(nextManifest, null, 2)}
`, "utf8");
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const target = await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
      await rename2(resolveContained(stageRoot, file.path, "staged owned file path"), target);
    }
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const path = nextManifest.ownedFiles[file.path].baselinePath;
      const target = await assertNoSymlinkPath(plan.projectRoot, path, "baseline path");
      await mkdir6(dirname4(target), { recursive: true });
      await rename2(resolveContained(stageRoot, path, "staged baseline path"), target);
    }
    const manifestTarget = await assertNoSymlinkPath(plan.projectRoot, ".loom/manifest.json", "manifest path");
    await rename2(stagedManifest, manifestTarget);
    return { updated, skipped };
  } finally {
    await Promise.all([
      rm6(stageRoot, { recursive: true, force: true }),
      rm6(plan.candidateRoot, { recursive: true, force: true })
    ]);
  }
}

// src/index.ts
var cli = cac("loom");
function resolveStacksRoot() {
  const candidates = [
    resolve13(fileURLToPath(new URL("./stacks", import.meta.url))),
    resolve13(fileURLToPath(new URL("../../../stacks", import.meta.url)))
  ];
  for (const candidate of candidates) {
    if (existsSync2(candidate)) {
      return candidate;
    }
  }
  throw new Error("Loom stack assets directory not found. Ensure the 'stacks/' directory exists and is readable.");
}
var stacksRoot = resolveStacksRoot();
function resolveStackSourceDir(stack) {
  const sourceDir = resolve13(stacksRoot, stack.assetPath);
  const fromRoot = relative3(stacksRoot, sourceDir);
  if (!fromRoot || fromRoot === ".." || fromRoot.startsWith("../") || fromRoot.startsWith("..\\") || isAbsolute6(fromRoot)) {
    throw new Error(`Unsafe stack asset path '${stack.assetPath}' for '${stack.id}'.`);
  }
  if (existsSync2(sourceDir)) return sourceDir;
  throw new Error(`Loom stack assets for '${stack.id}' were not found.`);
}
var ignoredTemplateEntries = /* @__PURE__ */ new Set([
  "node_modules",
  ".pnpm-store",
  ".turbo",
  ".loom"
]);
var topLevelIgnoredTemplateEntries = /* @__PURE__ */ new Set([
  "data",
  "dist",
  ".next"
]);
var phpDocrootIgnoredTemplates = /* @__PURE__ */ new Set(["php-wordpress", "php-drupal"]);
function formatBytes(bytes) {
  return `${bytes} B`;
}
function renderCleanPlan(plan) {
  process.stdout.write("Generated paths:\n");
  for (const item of plan.items) {
    process.stdout.write(`  ${item.path} [${item.category}] ${item.exists ? formatBytes(item.bytes) : "missing"}
`);
  }
  if (plan.items.length === 0) process.stdout.write("  (none)\n");
  process.stdout.write(`Total: ${formatBytes(plan.totalBytes)}
`);
}
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}
`);
      process.exitCode = 1;
    }
  };
}
async function bootstrapProject(configPath) {
  const project = await loadLoomProject(configPath);
  process.chdir(project.projectRoot);
  return new LoomOrchestrator(project.config, project.projectRoot);
}
async function ensureEnvFileFromExample(targetDir) {
  const envExamplePath = resolve13(targetDir, ".env.example");
  const envPath = resolve13(targetDir, ".env");
  try {
    await access8(envExamplePath);
  } catch {
    return;
  }
  try {
    await access8(envPath);
    return;
  } catch {
    await copyFile2(envExamplePath, envPath);
    process.stdout.write(`Created ${envPath} from .env.example
`);
  }
}
function isPhpTemplate(template) {
  return template.startsWith("php");
}
function resolveInitTargetDir(template, requestedDir) {
  const dir = requestedDir ?? ".";
  if (template.startsWith("db-") && (dir === "." || dir === "./")) {
    return resolve13(process.cwd(), "db");
  }
  return resolve13(process.cwd(), dir);
}
function validateInitOptions(template, phpDocroot) {
  if (!phpDocroot) {
    return;
  }
  if (!isPhpTemplate(template)) {
    throw new Error("--php-docroot can only be used with PHP templates.");
  }
}
function resolvePhpDocrootOption(template, phpDocroot) {
  if (!isPhpTemplate(template)) {
    return phpDocroot;
  }
  if (template === "php-symfony") {
    return phpDocroot ?? "public";
  }
  return phpDocroot ?? ".";
}
async function copyTemplate(sourceDir, targetDir, force) {
  await cp(sourceDir, targetDir, {
    recursive: true,
    force,
    filter: (sourcePath) => {
      const entryName = sourcePath.split("/").pop() ?? "";
      if (ignoredTemplateEntries.has(entryName)) {
        return false;
      }
      const relativePath = sourcePath.slice(sourceDir.length + 1);
      if (topLevelIgnoredTemplateEntries.has(entryName) && relativePath.split("/").length === 1) {
        return false;
      }
      return true;
    }
  });
}
async function copyTemplateEntries(sourceDir, targetDir, entries, force) {
  for (const entry of entries) {
    await cp(resolve13(sourceDir, entry), resolve13(targetDir, entry), {
      recursive: true,
      force
    });
  }
}
async function copyTemplateEntriesIfMissing(sourceDir, targetDir, entries) {
  for (const entry of entries) {
    const targetPath = resolve13(targetDir, entry);
    try {
      await access8(targetPath);
      continue;
    } catch {
      await cp(resolve13(sourceDir, entry), targetPath, {
        recursive: true,
        force: false
      });
    }
  }
}
async function fileExists2(path) {
  try {
    await access8(path);
    return true;
  } catch {
    return false;
  }
}
function normalizeProjectToken(raw) {
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || "project";
}
function deriveProjectName(targetDir) {
  const targetName = basename2(targetDir) === "db" ? basename2(resolve13(targetDir, "..")) : basename2(targetDir);
  return `loom-${normalizeProjectToken(targetName)}`;
}
async function applyProjectName(targetDir) {
  const loomPath = resolve13(targetDir, "loom.yaml");
  const projectName = deriveProjectName(targetDir);
  const loomYaml = await readFile7(loomPath, "utf8");
  const updatedLoomYaml = renderProjectName(loomYaml, projectName);
  if (updatedLoomYaml !== loomYaml) {
    await writeFile5(loomPath, updatedLoomYaml, "utf8");
  }
}
function replaceEnvVariable(content, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(content) ? content.replace(pattern, `${key}=${value}`) : content;
}
function parseEnvAssignments(optionValue) {
  if (!optionValue) {
    return {};
  }
  const values = Array.isArray(optionValue) ? optionValue : [optionValue];
  const assignments = {};
  for (const value of values) {
    const separatorIndex = value.indexOf("=");
    if (separatorIndex <= 0) {
      throw new Error(`Invalid --image value '${value}'. Use KEY=VALUE.`);
    }
    const key = value.slice(0, separatorIndex).trim();
    const assignedValue = value.slice(separatorIndex + 1).trim();
    if (!key || !assignedValue) {
      throw new Error(`Invalid --image value '${value}'. Use KEY=VALUE.`);
    }
    assignments[key] = assignedValue;
  }
  return assignments;
}
function parseEnvFile(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    values[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
  }
  return values;
}
function hasEnvVariable(content, key) {
  const pattern = new RegExp(`^${key}=`, "m");
  return pattern.test(content);
}
async function applyPhpDocroot(targetDir, template, phpDocrootRaw) {
  if (!phpDocrootRaw) {
    return;
  }
  if (!isPhpTemplate(template)) {
    throw new Error("--php-docroot can only be used with PHP templates.");
  }
  if (phpDocrootIgnoredTemplates.has(template)) {
    process.stdout.write(
      `Ignoring --php-docroot for '${template}' (template manages docroot internally).
`
    );
    return;
  }
  const loomPath = resolve13(targetDir, "loom.yaml");
  const loomYaml = renderPhpDocroot(await readFile7(loomPath, "utf8"), template, phpDocrootRaw);
  const displayedDocroot = phpDocrootRaw.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "") || ".";
  await writeFile5(loomPath, loomYaml, "utf8");
  process.stdout.write(`Set PHP docroot to '${displayedDocroot}' in ${loomPath}
`);
}
function replaceYamlEnvVariable(content, key, value) {
  const pattern = new RegExp(`(^\\s*${key}:\\s*).*$`, "m");
  return content.replace(pattern, (_match, group) => `${group}${value}`);
}
function serviceNameForDbType(loomYaml, dbType) {
  const lines = loomYaml.split("\n");
  let currentService = null;
  for (const line of lines) {
    const serviceMatch = /^ {2}([\w-]+):/.exec(line);
    if (serviceMatch) {
      currentService = serviceMatch[1];
    }
    const typeMatch = /^ {4}type:\s*(\S+)/.exec(line);
    if (typeMatch && typeMatch[1].toLowerCase() === dbType.toLowerCase() && currentService) {
      return currentService;
    }
  }
  return dbType;
}
async function customizeDbTemplateCredentials(targetDir) {
  const envPath = resolve13(targetDir, ".env");
  const loomConfigPath = resolve13(targetDir, "loom.yaml");
  let envContent;
  let loomYamlContent;
  try {
    envContent = await readFile7(envPath, "utf8");
    loomYamlContent = await readFile7(loomConfigPath, "utf8");
  } catch {
    return;
  }
  const targetName = basename2(targetDir) === "db" ? basename2(resolve13(targetDir, "..")) : basename2(targetDir);
  const token = normalizeProjectToken(targetName);
  const suffix = randomBytes(3).toString("hex");
  const appUser = `loom_${token}_${suffix}`.slice(0, 30);
  const appDb = `loom_${token}`.slice(0, 30);
  const appPassword = `Loom!${suffix}9aA`;
  const rootPassword = `Root!${suffix}9aA`;
  const mssqlPassword = `Loom${suffix}!9aA`;
  const replacements = {
    MYSQL_ROOT_PASSWORD: rootPassword,
    MYSQL_DATABASE: appDb,
    MYSQL_USER: appUser,
    MYSQL_PASSWORD: appPassword,
    MARIADB_ROOT_PASSWORD: rootPassword,
    MARIADB_DATABASE: appDb,
    MARIADB_USER: appUser,
    MARIADB_PASSWORD: appPassword,
    POSTGRES_USER: appUser,
    POSTGRES_PASSWORD: appPassword,
    POSTGRES_DB: appDb,
    MONGO_INITDB_ROOT_USERNAME: appUser,
    MONGO_INITDB_ROOT_PASSWORD: appPassword,
    MONGO_INITDB_DATABASE: appDb,
    MSSQL_SA_PASSWORD: mssqlPassword
  };
  for (const [key, value] of Object.entries(replacements)) {
    envContent = replaceEnvVariable(envContent, key, value);
    loomYamlContent = replaceYamlEnvVariable(loomYamlContent, key, value);
  }
  if (hasEnvVariable(envContent, "WORDPRESS_DB_HOST")) {
    envContent = replaceEnvVariable(envContent, "WORDPRESS_DB_NAME", appDb);
    envContent = replaceEnvVariable(envContent, "WORDPRESS_DB_USER", appUser);
    envContent = replaceEnvVariable(envContent, "WORDPRESS_DB_PASSWORD", appPassword);
    const wpDbHost = serviceNameForDbType(loomYamlContent, "mysql") || "db";
    envContent = replaceEnvVariable(envContent, "WORDPRESS_DB_HOST", `${wpDbHost}:3306`);
  }
  const mysqlHost = serviceNameForDbType(loomYamlContent, "mysql");
  const mariadbHost = serviceNameForDbType(loomYamlContent, "mariadb");
  const postgresHost = serviceNameForDbType(loomYamlContent, "postgres");
  const mongoHost = serviceNameForDbType(loomYamlContent, "mongodb");
  const mssqlHost = serviceNameForDbType(loomYamlContent, "sqlserver");
  const appUserEnc = encodeURIComponent(appUser);
  const appPasswordEnc = encodeURIComponent(appPassword);
  const mssqlPasswordEnc = encodeURIComponent(mssqlPassword);
  const mysqlUrl = `mysql://${appUserEnc}:${appPasswordEnc}@${mysqlHost}:3306/${appDb}`;
  const mariadbUrl = `mysql://${appUserEnc}:${appPasswordEnc}@${mariadbHost}:3306/${appDb}`;
  const postgresUrl = `postgresql://${appUserEnc}:${appPasswordEnc}@${postgresHost}:5432/${appDb}`;
  const mongoUrl = `mongodb://${appUserEnc}:${appPasswordEnc}@${mongoHost}:27017/${appDb}?authSource=admin`;
  const mssqlUrl = `sqlserver://sa:${mssqlPasswordEnc}@${mssqlHost}:1433;encrypt=false`;
  if (hasEnvVariable(envContent, "DATABASE_URL")) {
    if (hasEnvVariable(envContent, "POSTGRES_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", postgresUrl);
    } else if (hasEnvVariable(envContent, "MYSQL_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mysqlUrl);
    } else if (hasEnvVariable(envContent, "MARIADB_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mariadbUrl);
    } else if (hasEnvVariable(envContent, "MONGO_INITDB_ROOT_USERNAME")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mongoUrl);
    } else if (hasEnvVariable(envContent, "MSSQL_SA_PASSWORD")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mssqlUrl);
    }
  }
  envContent = replaceEnvVariable(envContent, "MYSQL_URL", mysqlUrl);
  envContent = replaceEnvVariable(envContent, "MARIADB_URL", mariadbUrl);
  envContent = replaceEnvVariable(envContent, "POSTGRES_URL", postgresUrl);
  envContent = replaceEnvVariable(envContent, "MONGODB_URL", mongoUrl);
  envContent = replaceEnvVariable(envContent, "MSSQL_URL", mssqlUrl);
  await writeFile5(envPath, envContent, "utf8");
  await writeFile5(loomConfigPath, loomYamlContent, "utf8");
  process.stdout.write(`Generated project-specific DB credentials in ${envPath}
`);
}
async function applyRuntimeImageSelections(targetDir, template, imageAssignments) {
  const envPath = resolve13(targetDir, ".env");
  let envContent;
  try {
    envContent = await readFile7(envPath, "utf8");
  } catch {
    return;
  }
  const currentValues = parseEnvFile(envContent);
  const chosenImages = { ...imageAssignments };
  const hasInteractiveChoices = (initImageChoicesByTemplate[template] ?? []).length > 0;
  if (hasInteractiveChoices && process.stdin.isTTY) {
    const prompted = await chooseInitImageOverrides(
      template,
      { ...currentValues, ...chosenImages },
      Object.keys(chosenImages)
    );
    Object.assign(chosenImages, prompted);
  }
  if (Object.keys(chosenImages).length === 0) {
    return;
  }
  for (const [key, value] of Object.entries(chosenImages)) {
    envContent = replaceEnvVariable(envContent, key, value);
  }
  await writeFile5(envPath, envContent, "utf8");
  process.stdout.write(`Configured runtime image selections in ${envPath}
`);
}
async function applyDatabaseService(targetDir, db) {
  const loomPath = resolve13(targetDir, "loom.yaml");
  let loomYaml;
  try {
    loomYaml = await readFile7(loomPath, "utf8");
  } catch {
    throw new Error(`No loom.yaml found in '${targetDir}'. Run 'loom init' first.`);
  }
  const { serviceName, serviceYaml, envVars } = buildDatabaseServiceBlock(db);
  const serviceAlreadyExists = new RegExp(`^ {2}${serviceName}:`, "m").test(loomYaml);
  if (serviceAlreadyExists) {
    process.stdout.write(`Service '${serviceName}' already exists in loom.yaml \u2014 skipping.
`);
    return;
  }
  const servicesInsertPattern = /^(routes:|tasks:)/m;
  if (servicesInsertPattern.test(loomYaml)) {
    loomYaml = loomYaml.replace(servicesInsertPattern, `${serviceYaml}
$1`);
  } else {
    loomYaml = loomYaml.trimEnd() + `
${serviceYaml}
`;
  }
  if (/^ {4}dependsOn:/m.test(loomYaml)) {
    loomYaml = loomYaml.replace(/^( {4}dependsOn:(?:\n {6}- [^\n]+)*)(?!\n {6}- ${serviceName})/m, `$1
      - ${serviceName}`);
  } else {
    const portsIdx = loomYaml.indexOf("\n    ports:");
    if (portsIdx !== -1) {
      loomYaml = loomYaml.slice(0, portsIdx) + `
    dependsOn:
      - ${serviceName}` + loomYaml.slice(portsIdx);
    }
  }
  await writeFile5(loomPath, loomYaml, "utf8");
  process.stdout.write(`Added '${serviceName}' database service to ${loomPath}
`);
  const envPath = resolve13(targetDir, ".env");
  try {
    let envContent = await readFile7(envPath, "utf8");
    let changed = false;
    for (const [key, value] of Object.entries(envVars)) {
      if (!hasEnvVariable(envContent, key)) {
        envContent = envContent.trimEnd() + `
${key}=${value}
`;
        changed = true;
      }
    }
    if (changed) {
      await writeFile5(envPath, envContent, "utf8");
      process.stdout.write(`Added database connection variables to ${envPath}
`);
    }
  } catch {
  }
}
cli.command("init [template]", "Initialize a sample project in a target directory").option("--dir <path>", "Target directory", { default: "." }).option("--blank-template", "Delete existing files and initialize a clean template copy", { default: false }).option("--php-docroot <path>", "PHP docroot path inside project (php/php-symfony templates)").option("--image <key=value>", "Override a template image variable during init (repeatable)").option("--db <type>", `Add a database service, repeatable (${supportedDbTypes.join(", ")})`).action(
  withErrorHandling(async (template, options) => {
    const selectedTemplate = template ?? await chooseInitTemplate(
      await detectInitTemplateSuggestion(process.cwd())
    );
    const stack = findStackDefinition(selectedTemplate);
    if (!stack) {
      const available = listStackIds().join(", ");
      throw new Error(`Unknown template '${selectedTemplate}'. Available templates: ${available}`);
    }
    process.stdout.write(`Initializing '${selectedTemplate}': ${describeInitTemplate(selectedTemplate)}
`);
    validateInitOptions(selectedTemplate, options.phpDocroot);
    const effectivePhpDocroot = resolvePhpDocrootOption(selectedTemplate, options.phpDocroot);
    const sourceDir = resolveStackSourceDir(stack);
    const targetDir = resolveInitTargetDir(selectedTemplate, options.dir);
    await mkdir7(targetDir, { recursive: true });
    const initPreparation = await prepareInitTarget(stack, targetDir, options.blankTemplate ?? false);
    if (initPreparation.templateEntriesToUpdate) {
      await copyTemplateEntries(
        sourceDir,
        targetDir,
        initPreparation.templateEntriesToUpdate,
        (options.blankTemplate ?? false) || initPreparation.overwriteTemplateFiles
      );
    } else {
      await copyTemplate(sourceDir, targetDir, (options.blankTemplate ?? false) || initPreparation.overwriteTemplateFiles);
    }
    if (initPreparation.templateEntriesToCreateIfMissing) {
      await copyTemplateEntriesIfMissing(
        sourceDir,
        targetDir,
        initPreparation.templateEntriesToCreateIfMissing
      );
    }
    await applyProjectName(targetDir);
    await applyPhpDocroot(targetDir, selectedTemplate, effectivePhpDocroot);
    await ensureEnvFileFromExample(targetDir);
    await applyRuntimeImageSelections(targetDir, selectedTemplate, parseEnvAssignments(options.image));
    let dbsToAdd = [];
    if (options.db) {
      dbsToAdd = Array.isArray(options.db) ? options.db : [options.db];
    } else if (process.stdin.isTTY && !selectedTemplate.startsWith("db-")) {
      const selected = await chooseInitDatabases();
      dbsToAdd = selected;
    }
    for (const dbType of dbsToAdd) {
      if (!isValidDbType(dbType)) {
        throw new Error(`Unknown database type '${dbType}'. Supported: ${supportedDbTypes.join(", ")}`);
      }
      await applyDatabaseService(targetDir, dbType);
    }
    if (dbsToAdd.length > 0 || selectedTemplate.startsWith("db-")) {
      await customizeDbTemplateCredentials(targetDir);
    }
    await writeProjectManifest(targetDir, package_default.version, stack, stack.loomOwnedFiles, {
      projectName: deriveProjectName(targetDir),
      ...effectivePhpDocroot === void 0 ? {} : { phpDocroot: effectivePhpDocroot },
      databases: [...dbsToAdd].sort(),
      adopted: false
    });
    process.stdout.write(`Initialized '${selectedTemplate}' in ${targetDir}
`);
    process.stdout.write(formatStartupNotice());
    process.stdout.write(`Next: cd ${targetDir} && loom start
`);
  })
);
cli.command("adopt [stack]", "Configure an existing local project without replacing application files").option("--dir <path>", "Existing project directory", { default: "." }).action(
  withErrorHandling(async (requestedStack, options) => {
    const targetDir = resolve13(process.cwd(), options.dir ?? ".");
    const selectedStack = requestedStack ?? await detectInitTemplateSuggestion(targetDir);
    if (!selectedStack) {
      throw new Error("Unable to detect a stack for this project. Retry with 'loom adopt <stack>'.");
    }
    const stack = findStackDefinition(selectedStack);
    if (!stack) {
      throw new Error(`Unknown stack '${selectedStack}'. Available stacks: ${listStackIds().join(", ")}`);
    }
    const loomConfigPath = resolve13(targetDir, "loom.yaml");
    if (await fileExists2(loomConfigPath)) {
      throw new Error(`Project already contains '${loomConfigPath}'. Adoption will not overwrite Loom configuration.`);
    }
    const sourceDir = resolveStackSourceDir(stack);
    const ownedFiles = ["loom.yaml"];
    await copyFile2(resolve13(sourceDir, "loom.yaml"), loomConfigPath);
    const sourceEnvExample = resolve13(sourceDir, ".env.example");
    const targetEnvExample = resolve13(targetDir, ".env.example");
    if (!await fileExists2(targetEnvExample) && await fileExists2(sourceEnvExample)) {
      await copyFile2(sourceEnvExample, targetEnvExample);
      ownedFiles.push(".env.example");
    }
    await applyProjectName(targetDir);
    await writeProjectManifest(targetDir, package_default.version, stack, ownedFiles, {
      projectName: deriveProjectName(targetDir),
      databases: [],
      adopted: true
    });
    process.stdout.write(`Adopted '${selectedStack}' in ${targetDir}
`);
    process.stdout.write(`Next: cd ${targetDir} && loom start
`);
  })
);
cli.command("upgrade", "Update only Loom-owned project files").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--force-modified", "Replace locally modified Loom-owned files", { default: false }).option("--initialize-baseline", "Migrate a v1 manifest using current Loom-owned files", { default: false }).action(
  withErrorHandling(async (options) => {
    const configPath = resolve13(process.cwd(), options.config ?? "loom.yaml");
    const projectRoot = dirname5(configPath);
    const loaded = await loadProjectManifest(projectRoot);
    if (loaded.kind === "missing") {
      throw new Error(`No Loom project manifest found in '${projectRoot}'. Run 'loom init' or 'loom adopt' first.`);
    }
    const stackId = loaded.manifest.stack.id;
    const stack = findStackDefinition(stackId);
    if (!stack) {
      throw new Error(`Unknown stack '${stackId}' in Loom project manifest. Available stacks: ${listStackIds().join(", ")}`);
    }
    const compatibility2 = classifyProjectManifestStack(loaded.manifest, stack);
    if (compatibility2.kind === "incompatible") {
      throw new Error(`Project manifest is incompatible with stack '${stackId}': ${compatibility2.reason}`);
    }
    if (loaded.kind === "migration-required") {
      if (!options.initializeBaseline) {
        throw new Error("This project uses a v1 Loom manifest. Run 'loom upgrade --initialize-baseline' before upgrading files.");
      }
      const loomYaml = await readFile7(configPath, "utf8");
      const projectName = /^name:\s*(.+)$/m.exec(loomYaml)?.[1]?.trim() || deriveProjectName(projectRoot);
      await writeProjectManifest(projectRoot, package_default.version, stack, Object.keys(loaded.manifest.ownedFiles), {
        projectName,
        databases: [],
        adopted: false
      });
      process.stdout.write(`Initialized upgrade baseline for '${stackId}' in ${projectRoot}. No project files were replaced.
`);
      return;
    }
    if (options.initializeBaseline) {
      throw new Error("The project already has an upgrade-safe v2 manifest; --initialize-baseline is not needed.");
    }
    const plan = await planProjectUpgrade({ projectRoot, stacksRoot, manifest: loaded.manifest, stack });
    for (const file of plan.files) {
      if (file.state === "modified" && !options.forceModified) {
        process.stdout.write(`modified ${file.path} -> skipped (use --force-modified to replace)
`);
      } else if (file.currentSha256 === file.candidateSha256) {
        process.stdout.write(`${file.state} ${file.path} -> already current
`);
      } else {
        process.stdout.write(`${file.state} ${file.path} -> update available
`);
      }
    }
    const result2 = await applyProjectUpgrade(plan, { forceModified: options.forceModified ?? false });
    process.stdout.write(`Upgrade complete: ${result2.updated.length} updated, ${result2.skipped.length} skipped.
`);
    if (result2.skipped.length > 0) process.exitCode = 1;
  })
);
cli.command("doctor", "Diagnose project and host compatibility").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--json", "Print structured JSON results", { default: false }).action(
  withErrorHandling(async (options) => {
    const configPath = resolve13(process.cwd(), options.config ?? "loom.yaml");
    const project = await loadLoomProject(configPath);
    const manifest = await loadProjectManifest(project.projectRoot);
    const stack = manifest.kind === "missing" ? void 0 : findStackDefinition(manifest.manifest.stack.id);
    const results = await runProjectDoctor({
      projectRoot: project.projectRoot,
      config: project.config,
      manifest,
      stack
    });
    if (options.json) process.stdout.write(formatDoctorJson(results));
    else process.stdout.write(formatDoctorResults(results));
    process.exitCode = doctorExitCode(results);
  })
);
cli.command("clean", "Remove stack-declared generated paths").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--force", "Run without interactive confirmation", { default: false }).option("--dry-run", "Preview without removing paths", { default: false }).action(
  withErrorHandling(async (options) => {
    const configPath = resolve13(process.cwd(), options.config ?? "loom.yaml");
    const project = await loadLoomProject(configPath);
    const loaded = await loadProjectManifest(project.projectRoot);
    if (loaded.kind === "missing") {
      throw new Error(`No Loom project manifest found in '${project.projectRoot}'. Run 'loom init' or 'loom adopt' first.`);
    }
    if (loaded.kind === "migration-required") {
      throw new Error("This project uses a v1 Loom manifest. Run 'loom upgrade --initialize-baseline' before cleaning.");
    }
    const stack = findStackDefinition(loaded.manifest.stack.id);
    if (!stack) {
      throw new Error(`Unknown stack '${loaded.manifest.stack.id}' in Loom project manifest. Available stacks: ${listStackIds().join(", ")}`);
    }
    const plan = await planProjectClean({ projectRoot: project.projectRoot, stack, manifest: loaded.manifest });
    renderCleanPlan(plan);
    if (options.dryRun) return;
    if (!options.force) {
      if (!process.stdin.isTTY) throw new Error("Cleanup requires an interactive terminal or the explicit --force option.");
      if (!await confirmProjectClean()) {
        process.stdout.write("Cleanup cancelled.\n");
        return;
      }
    }
    const result2 = await applyProjectClean(plan);
    process.stdout.write(`Cleanup complete: ${result2.removed.length} removed, ${result2.missing.length} missing.
`);
  })
);
cli.command("start", "Start Loom project services").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--recreate", "Remove existing project containers before starting", { default: false }).action(
  withErrorHandling(async (options) => {
    const orchestrator = await bootstrapProject(options.config);
    await orchestrator.start({ recreate: options.recreate ?? false });
  })
);
cli.command("stop", "Stop Loom project services").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).action(
  withErrorHandling(async (options) => {
    const orchestrator = await bootstrapProject(options.config);
    await orchestrator.stop();
  })
);
cli.command("restart", "Restart Loom project services").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--recreate", "Remove existing project containers before starting again", { default: false }).action(
  withErrorHandling(async (options) => {
    const orchestrator = await bootstrapProject(options.config);
    await orchestrator.restart({ recreate: options.recreate ?? false });
  })
);
cli.command("status", "Show project and runtime status").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).action(
  withErrorHandling(async (options) => {
    const orchestrator = await bootstrapProject(options.config);
    const status = await orchestrator.status();
    process.stdout.write(`${JSON.stringify(status, null, 2)}
`);
  })
);
cli.command("ps", "List project containers").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).action(
  withErrorHandling(async (options) => {
    const orchestrator = await bootstrapProject(options.config);
    const containers = await orchestrator.ps();
    process.stdout.write(`${JSON.stringify(containers, null, 2)}
`);
  })
);
cli.command("test", "Run test task from loom config").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--task <name>", "Task name", { default: "test" }).action(
  withErrorHandling(async (options) => {
    const taskName = options.task ?? "test";
    const orchestrator = await bootstrapProject(options.config);
    await runNamedTask(orchestrator, taskName);
  })
);
cli.command("logs <service>", "Show service logs").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--follow", "Follow logs", { default: true }).action(
  withErrorHandling(async (service, options) => {
    const orchestrator = await bootstrapProject(options.config);
    await orchestrator.logs(service, options.follow ?? true);
  })
);
cli.command("exec <service> [...cmd]", "Exec command in service container").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).action(
  withErrorHandling(async (service, cmd, options) => {
    const orchestrator = await bootstrapProject(options.config);
    const passthroughIndex = process.argv.indexOf("--");
    const passthrough = passthroughIndex >= 0 ? process.argv.slice(passthroughIndex + 1) : [];
    await orchestrator.exec(service, passthroughIndex >= 0 ? passthrough : cmd);
  })
);
cli.command("backup [service]", "Create backup file(s) for database services").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).option("--all", "Backup all supported database services in loom.yaml", { default: false }).option("--output <path>", "Output file path (defaults to .loom/backups/<project>-<service>-<timestamp>.*)").action(
  withErrorHandling(async (service, options) => {
    const orchestrator = await bootstrapProject(options.config);
    if (options.all) {
      const backups = await orchestrator.backupAll();
      for (const backup of backups) {
        process.stdout.write(`Backup created [${backup.service}]: ${backup.path}
`);
      }
      return;
    }
    if (!service) {
      throw new Error("Service name is required unless --all is provided.");
    }
    const output = await orchestrator.backup(service, options.output);
    process.stdout.write(`Backup created: ${output}
`);
  })
);
cli.command("restore <service> <input>", "Restore a backup file into a supported database service").option("--config <path>", "Path to loom config", { default: "loom.yaml" }).action(
  withErrorHandling(async (service, input, options) => {
    const orchestrator = await bootstrapProject(options.config);
    const restoredFrom = await orchestrator.restore(service, input);
    process.stdout.write(`Restore completed [${service}]: ${restoredFrom}
`);
  })
);
cli.help();
cli.version(package_default.version);
cli.parse(process.argv, { run: false });
await cli.runMatchedCommand();
//# sourceMappingURL=index.js.map
