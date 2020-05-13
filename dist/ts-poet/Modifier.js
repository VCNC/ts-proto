"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Modifier;
(function (Modifier) {
    Modifier["ASYNC"] = "async";
    Modifier["EXPORT"] = "export";
    Modifier["PUBLIC"] = "public";
    Modifier["PROTECTED"] = "protected";
    Modifier["PRIVATE"] = "private";
    Modifier["READONLY"] = "readonly";
    Modifier["GET"] = "get";
    Modifier["SET"] = "set";
    Modifier["STATIC"] = "static";
    Modifier["ABSTRACT"] = "abstract";
    Modifier["DECLARE"] = "declare";
    Modifier["CONST"] = "const";
    Modifier["LET"] = "let";
    Modifier["VAR"] = "var";
})(Modifier = exports.Modifier || (exports.Modifier = {}));
exports.ModifierOrder = [
    Modifier.EXPORT,
    Modifier.DECLARE,
    Modifier.PUBLIC,
    Modifier.PROTECTED,
    Modifier.PRIVATE,
    Modifier.READONLY,
    Modifier.ABSTRACT,
    Modifier.GET,
    Modifier.SET,
    Modifier.STATIC,
    Modifier.ASYNC,
    Modifier.CONST,
    Modifier.LET,
    Modifier.VAR,
];
