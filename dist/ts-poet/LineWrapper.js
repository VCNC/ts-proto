"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringBuffer_1 = require("./StringBuffer");
/**
 * Implements soft line wrapping on an appendable. To use, append characters using
 * [LineWrapper.append] or soft-wrapping spaces using [LineWrapper.wrappingSpace].
 */
class LineWrapper {
    constructor(out, indent, columnLimit) {
        this.closed = false;
        /** Characters written since the last wrapping space that haven't yet been flushed.  */
        this.buffer = new StringBuffer_1.StringBuffer();
        /** The number of characters since the most recent newline. Includes both out and the buffer.  */
        this.column = 0;
        /** -1 if we have no buffering; otherwise the number of spaces to write after wrapping.  */
        this.indentLevel = -1;
        this.out = out;
        this.indent = indent;
        this.columnLimit = columnLimit;
    }
    /** Emit `s`. This may be buffered to permit line wraps to be inserted.  */
    append(s) {
        if (this.closed) {
            throw new Error('closed');
        }
        if (this.nextFlush) {
            const nextNewline = s.indexOf('\n');
            // If s doesn't cause the current line to cross the limit, buffer it and return. We'll decide
            // whether or not we have to wrap it later.
            if (nextNewline === -1 && this.column + s.length <= this.columnLimit) {
                this.buffer.append(s);
                this.column += s.length;
                return;
            }
            // Wrap if appending s would overflow the current line.
            const wrap = nextNewline === -1 || this.column + nextNewline > this.columnLimit;
            this.flush(wrap ? FlushType.WRAP : this.nextFlush);
        }
        this.out.append(s);
        const lastNewline = s.lastIndexOf('\n');
        this.column = lastNewline !== -1 ? s.length - lastNewline - 1 : this.column + s.length;
    }
    /** Emit either a space or a newline character.  */
    wrappingSpace(indentLevel) {
        if (this.closed) {
            throw new Error('closed');
        }
        if (this.nextFlush) {
            this.flush(this.nextFlush);
        }
        this.column++;
        this.nextFlush = FlushType.SPACE;
        this.indentLevel = indentLevel;
    }
    /** Emit a newline character if the line will exceed it's limit, otherwise do nothing. */
    zeroWidthSpace(indentLevel) {
        if (this.closed) {
            throw new Error('closed');
        }
        if (this.column === 0) {
            return;
        }
        if (this.nextFlush) {
            this.flush(this.nextFlush);
        }
        this.nextFlush = FlushType.EMPTY;
        this.indentLevel = indentLevel;
    }
    /** Flush any outstanding text and forbid future writes to this line wrapper.  */
    close() {
        if (this.nextFlush) {
            this.flush(this.nextFlush);
        }
        this.closed = true;
    }
    toString() {
        return this.out.toString();
    }
    /** Write the space followed by any buffered text that follows it.  */
    flush(wrap) {
        switch (wrap) {
            case FlushType.WRAP:
                this.out.append('\n');
                for (let i = 0; i < this.indentLevel; i++) {
                    this.out.append(this.indent);
                }
                this.column = this.indentLevel * this.indent.length;
                this.column += this.buffer.toString().length;
                break;
            case FlushType.SPACE:
                this.out.append(' ');
                break;
            case FlushType.EMPTY:
                break;
        }
        this.out.append(this.buffer.toString());
        this.buffer = new StringBuffer_1.StringBuffer();
        this.indentLevel = -1;
        this.nextFlush = undefined;
    }
}
exports.LineWrapper = LineWrapper;
var FlushType;
(function (FlushType) {
    FlushType[FlushType["WRAP"] = 0] = "WRAP";
    FlushType[FlushType["SPACE"] = 1] = "SPACE";
    FlushType[FlushType["EMPTY"] = 2] = "EMPTY";
})(FlushType || (FlushType = {}));
