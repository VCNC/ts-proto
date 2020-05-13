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
function stringLiteralWithQuotes(value, indent = '  ') {
    const result = new StringBuffer_1.StringBuffer();
    result.append('"');
    for (let i = 0; i < value.length; i++) {
        const c = value.charAt(i);
        if (c === "'") {
            result.append("'");
            continue;
        }
        if (c === '"') {
            result.append('\\"');
            continue;
        }
        result.append(characterLiteralWithoutSingleQuotes(c));
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
    switch (c) {
        case '\b':
            return '\\b';
        case '\t':
            return '\\t';
        case '\n':
            return '\\n';
        case '\f':
            return '\\f';
        case '\r':
            return '\\r';
        case '"':
            return '"';
        case "'":
            return "\\'";
        case '\\':
            return '\\\\';
        default:
            return c;
    }
}
