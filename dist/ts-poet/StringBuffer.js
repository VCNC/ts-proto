"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringBuffer {
    constructor() {
        this.strings = [];
    }
    append(s) {
        this.strings.push(s);
        return this;
    }
    toString() {
        return this.strings.join('');
    }
}
exports.StringBuffer = StringBuffer;
