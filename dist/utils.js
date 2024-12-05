"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
function readToBuffer(stream) {
    return new Promise(resolve => {
        const ret = [];
        let len = 0;
        stream.on('readable', () => {
            let chunk;
            while ((chunk = stream.read())) {
                ret.push(chunk);
                len += chunk.length;
            }
        });
        stream.on('end', () => {
            resolve(Buffer.concat(ret, len));
        });
    });
}
exports.readToBuffer = readToBuffer;
function fail(message) {
    throw new Error(message);
}
exports.fail = fail;
function singular(name) {
    return name.substring(0, name.length - 1);
}
exports.singular = singular;
function lowerFirst(name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
exports.lowerFirst = lowerFirst;
function upperFirst(name) {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
}
exports.upperFirst = upperFirst;
function optionsFromParameter(parameter) {
    const options = {
        useContext: false,
        snakeToCamel: true,
        forceLong: main_1.LongOption.NUMBER
    };
    if (parameter) {
        if (parameter.includes('context=true')) {
            options.useContext = true;
        }
        if (parameter.includes('snakeToCamel=false')) {
            options.snakeToCamel = false;
        }
        if (parameter.includes('forceLong=string')) {
            options.forceLong = main_1.LongOption.STRING;
        }
        if (parameter.includes('forceLong=long')) {
            options.forceLong = main_1.LongOption.LONG;
        }
    }
    return options;
}
exports.optionsFromParameter = optionsFromParameter;
const PercentAll = /\%/g;
const CloseComment = /\*\//g;
function maybeAddComment(desc, process) {
    if (desc.leadingComments || desc.trailingComments) {
        return process((desc.leadingComments || desc.trailingComments || '').replace(PercentAll, '%%').replace(CloseComment, '* /'));
    }
}
exports.maybeAddComment = maybeAddComment;
