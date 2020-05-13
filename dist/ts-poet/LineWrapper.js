"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringBuffer_1 = require("./StringBuffer");
class LineWrapper {
    constructor(out, indent, columnLimit) {
        this.closed = false;
        this.buffer = new StringBuffer_1.StringBuffer();
        this.column = 0;
        this.indentLevel = -1;
        this.out = out;
        this.indent = indent;
        this.columnLimit = columnLimit;
    }
    append(s) {
        if (this.closed) {
            throw new Error('closed');
        }
        if (this.nextFlush) {
            const nextNewline = s.indexOf('\n');
            if (nextNewline === -1 && this.column + s.length <= this.columnLimit) {
                this.buffer.append(s);
                this.column += s.length;
                return;
            }
            const wrap = nextNewline === -1 || this.column + nextNewline > this.columnLimit;
            this.flush(wrap ? FlushType.WRAP : this.nextFlush);
        }
        this.out.append(s);
        const lastNewline = s.lastIndexOf('\n');
        this.column = lastNewline !== -1 ? s.length - lastNewline - 1 : this.column + s.length;
    }
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
    close() {
        if (this.nextFlush) {
            this.flush(this.nextFlush);
        }
        this.closed = true;
    }
    toString() {
        return this.out.toString();
    }
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
