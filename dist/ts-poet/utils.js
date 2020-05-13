"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringBuffer_1 = require("./StringBuffer");
function check(b, message = 'check failed') {
    if (!b) {
        throw new Error(message);
    }
}
exports.check = check;
function filterInstances(list, t) {
    return list.filter(e => e instanceof t);
}
exports.filterInstances = filterInstances;
function unique(list) {
    return [...new Set(list)];
}
exports.unique = unique;
// Based on original javapoet code; it looks like typescriptpoet has
// an extra branch to cover multi-line strings; haven't handled that yet.
function stringLiteralWithQuotes(value, indent = '  ') {
    const result = new StringBuffer_1.StringBuffer();
    result.append('"');
    for (let i = 0; i < value.length; i++) {
        const c = value.charAt(i);
        // trivial case: single quote must not be escaped
        if (c === "'") {
            result.append("'");
            continue;
        }
        // trivial case: double quotes must be escaped
        if (c === '"') {
            result.append('\\"');
            continue;
        }
        // default case: just let character literal do its work
        result.append(characterLiteralWithoutSingleQuotes(c));
        // need to append indent after linefeed?
        if (c === '\n' && i + 1 < value.length) {
            result
                .append('"\n')
                .append(indent)
                .append(indent)
                .append('+ "');
        }
    }
    result.append('"');
    return result.toString();
}
exports.stringLiteralWithQuotes = stringLiteralWithQuotes;
function characterLiteralWithoutSingleQuotes(c) {
    // see https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.6
    switch (c) {
        case '\b':
            return '\\b'; /* \u0008: backspace (BS) */
        case '\t':
            return '\\t'; /* \u0009: horizontal tab (HT) */
        case '\n':
            return '\\n'; /* \u000a: linefeed (LF) */
        case '\f':
            return '\\f'; /* \u000c: form feed (FF) */
        case '\r':
            return '\\r'; /* \u000d: carriage return (CR) */
        case '"':
            return '"'; /* \u0022: double quote (") */
        case "'":
            return "\\'"; /* \u0027: single quote (') */
        case '\\':
            return '\\\\'; /* \u005c: backslash (\) */
        default:
            return c;
    }
}
