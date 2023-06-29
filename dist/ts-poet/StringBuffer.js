"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A really simple string buffer.
 *
 * This is not at all for performance reasons and instead just to match
 * the existing poet code/pattern.
 */
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
