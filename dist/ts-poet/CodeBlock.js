"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_imm_1 = require("ts-imm");
const CodeWriter_1 = require("./CodeWriter");
const FunctionSpec_1 = require("./FunctionSpec");
const ParameterSpec_1 = require("./ParameterSpec");
const PropertySpec_1 = require("./PropertySpec");
const SymbolSpecs_1 = require("./SymbolSpecs");
const TypeNames_1 = require("./TypeNames");
const utils_1 = require("./utils");
const NAMED_ARGUMENT = /^%([\w_]+):([\w]).*$/;
const LOWERCASE = /^[a-z]+[\w_]*$/;
const ARG_NAME = 1;
const TYPE_NAME = 2;
const NO_ARG_PLACEHOLDERS = ['%W', '%>', '%<', '%[', '%]'];
function isNoArgPlaceholder(c) {
    return ['%', '>', '<', '[', ']', 'W'].indexOf(c) > -1;
}
/**
 * A fragment of a .ts file, potentially containing declarations, statements, and documentation.
 * Code blocks are not necessarily well-formed TypeScript code, and are not validated. This class
 * assumes tsc will check correctness later!
 *
 * Code blocks support placeholders like [java.text.Format]. This class uses a percent sign
 * `%` but has its own set of permitted placeholders:
 *
 *  * `%L` emits a *literal* value with no escaping. Arguments for literals may be strings,
 *    primitives, [type declarations][ClassSpec], [decorators][DecoratorSpec] and even other code
 *    blocks.
 *  * `%N` emits a *name*, using name collision avoidance where necessary. Arguments for names may
 *    be strings (actually any [character sequence][CharSequence]), [parameters][ParameterSpec],
 *    [properties][PropertySpec], [functions][FunSpec], and [types][ClassSpec].
 *  * `%S` escapes the value as a *string*, wraps it with double quotes, and emits that. For
 *    example, `6" sandwich` is emitted `"6\" sandwich"`.
 *  * `%T` emits a *type* reference. Types will be imported if possible. Arguments for types may be
 *    [classes][Class], [type mirrors][javax.lang.model.type.TypeMirror], and
 *    [elements][javax.lang.model.element.Element].
 *  * `%%` emits a percent sign.
 *  * `%W` emits a space or a newline, depending on its position on the line. This prefers to wrap
 *    lines before 100 columns.
 *  * `%>` increases the indentation level.
 *  * `%<` decreases the indentation level.
 *  * `%[` begins a statement.
 *  * `%]` ends a statement.
 */
class CodeBlock extends ts_imm_1.Imm {
    static of(format, ...args) {
        return CodeBlock.empty().add(format, ...args);
    }
    static empty() {
        return new CodeBlock({
            formatParts: [],
            args: [],
            referencedSymbols: new Set(),
            trailer: undefined,
        });
    }
    /** Returns a code block for doing multiline lambdas. */
    static lambda(...parameterNames) {
        return CodeBlock.empty()
            .add('(%L) => {\n', parameterNames.join(', '))
            .indent()
            .addTrailer(CodeBlock.empty()
            .unindent()
            .add('}'));
    }
    static asyncLambda(...parameterNames) {
        return CodeBlock.empty()
            .add('async (%L) => {\n', parameterNames.join(', '))
            .indent()
            .addTrailer(CodeBlock.empty()
            .unindent()
            .add('}'));
    }
    static joinToCode(blocks, separator = ', ', prefix = '', suffix = '') {
        if (blocks.length === 0) {
            return CodeBlock.empty();
        }
        const placeholders = blocks.map(_ => '%L');
        return CodeBlock.of(prefix + placeholders.join(separator) + suffix, ...blocks);
    }
    indent() {
        return this.copy({
            formatParts: [...this.formatParts, '%>'],
        });
    }
    unindent() {
        return this.copy({
            formatParts: [...this.formatParts, '%<'],
        });
    }
    /**
     * @param controlFlow the control flow construct and its code, such as "if (foo == 5)".
     *     Shouldn't contain braces or newline characters.
     */
    beginControlFlow(controlFlow, ...args) {
        return this.add(`${controlFlow} {\n`, ...args).indent();
    }
    /**
     * @param controlFlow the control flow construct and its code, such as "else if (foo == 10)".
     *     Shouldn't contain braces or newline characters.
     */
    nextControlFlow(controlFlow, ...args) {
        return this.unindent()
            .add(`} ${controlFlow} {\n`, ...args)
            .indent();
    }
    endControlFlow() {
        return this.unindent().add('}\n');
    }
    beginLambda(controlFlow, ...args) {
        return this.add(`${controlFlow} {\n`, ...args).indent();
    }
    endLambda(closing, ...args) {
        return this.unindent().add(`}${closing}\n`, ...args);
    }
    beginHash() {
        return this.add('{')
            .newLine()
            .indent();
    }
    endHash() {
        return this.unindent().add('}');
    }
    addHashEntry(key, value) {
        if (key instanceof FunctionSpec_1.FunctionSpec) {
            return this.add('%F', key.setEnclosed(FunctionSpec_1.Encloser.HASH))
                .add(',')
                .newLine();
        }
        else if (value instanceof CodeBlock) {
            return this.add('%L: ', key)
                .addCode(value)
                .add(',')
                .newLine();
        }
        else {
            return this.add('%L: %L,', key, value).newLine();
        }
    }
    newLine() {
        return this.add('\n');
    }
    addStatement(format, ...args) {
        return this.add('%[')
            .add(format, ...args)
            .add(';\n%]');
    }
    addFunction(fn) {
        return this.add('%F', fn);
    }
    addCode(codeBlock) {
        return this.copy({
            formatParts: [...this.formatParts, ...codeBlock.formatParts],
            args: [...this.args, ...codeBlock.args],
            referencedSymbols: new Set([...this.referencedSymbols, ...codeBlock.referencedSymbols]),
        });
        return this;
    }
    addTrailer(codeBlock) {
        return this.copy({ trailer: codeBlock });
    }
    /**
     * Add code with positional or relative arguments.
     *
     * Relative arguments map 1:1 with the placeholders in the format string.
     *
     * Positional arguments use an index after the placeholder to identify which argument index
     * to use. For example, for a literal to reference the 3rd argument: "%3L" (1 based index)
     *
     * Mixing relative and positional arguments in a call to add is invalid and will result in an
     * error.
     */
    add(format, ...args) {
        // keep some mutable state so we don't have to completely gut this
        const newFormatParts = [];
        const newArgs = [];
        const newSymbols = [];
        let hasRelative = false;
        let hasIndexed = false;
        let relativeParameterCount = 0;
        const indexedParameterCount = [];
        args.forEach(() => indexedParameterCount.push(0));
        let p = 0;
        while (p < format.length) {
            if (format[p] !== '%') {
                let nextP = format.indexOf('%', p + 1);
                if (nextP === -1) {
                    nextP = format.length;
                }
                newFormatParts.push(format.substring(p, nextP));
                p = nextP;
                continue;
            }
            p++; // '%'.
            // Consume zero or more digits, leaving 'c' as the first non-digit char after the '%'.
            const indexStart = p;
            utils_1.check(p < format.length, `dangling format characters in '${format}'`);
            let c = format[p++];
            while (c.match(/[0-9]/)) {
                utils_1.check(p < format.length, `dangling format characters in '${format}'`);
                c = format[p++];
            }
            const indexEnd = p - 1;
            // If 'c' doesn't take an argument, we're done.
            if (isNoArgPlaceholder(c)) {
                utils_1.check(indexStart === indexEnd, '%%, %>, %<, %[, %], and %W may not have an index');
                newFormatParts.push(`%${c}`);
                continue;
            }
            // Find either the indexed argument, or the relative argument. (0-based).
            let index;
            if (indexStart < indexEnd) {
                index = parseInt(format.substring(indexStart, indexEnd), 10) - 1;
                hasIndexed = true;
                if (args.length > 0) {
                    indexedParameterCount[index % args.length]++; // modulo is needed, checked below anyway
                }
            }
            else {
                index = relativeParameterCount;
                hasRelative = true;
                relativeParameterCount++;
            }
            utils_1.check(index >= 0 && index < args.length, `index ${index + 1} for '${format.substring(indexStart - 1, indexEnd + 1)}' not in range (received ${args.length} arguments)`);
            utils_1.check(!hasIndexed || !hasRelative, 'cannot mix indexed and positional parameters');
            const [newArg, symbols] = formatToArgAndSymbols(format, c, args[index]);
            newArgs.push(newArg);
            newFormatParts.push(`%${c}`);
            newSymbols.push(...symbols);
        }
        if (hasRelative) {
            utils_1.check(relativeParameterCount >= args.length, `unused arguments: expected ${relativeParameterCount}, received ${args.length}`);
        }
        if (hasIndexed) {
            const unused = [];
            for (let i = 0; i < args.length; i++) {
                if (indexedParameterCount[i] === 0) {
                    unused.push('%' + (i + 1));
                }
            }
            const s = unused.length === 1 ? '' : 's';
            utils_1.check(unused.length === 0, `unused argument${s}: ${unused.join(', ')}`);
        }
        return this.copy({
            formatParts: [...this.formatParts, ...newFormatParts],
            args: [...this.args, ...newArgs],
            referencedSymbols: new Set([...this.referencedSymbols, ...newSymbols]),
        });
    }
    /**
     * Adds code using named arguments.
     *
     * Named arguments specify their name after the '%' followed by : and the corresponding type
     * character. Argument names consist of characters in `a-z, A-Z, 0-9, and _` and must start
     * with a lowercase character.
     *
     * For example, to refer to the type [java.lang.Integer] with the argument name `clazz` use a
     * format string containing `%clazz:T` and include the key `clazz` with value
     * `java.lang.Integer.class` in the argument map.
     */
    addNamed(format, args) {
        // keep some mutable state so we don't have to completely gut this
        const newFormatParts = [];
        const newArgs = [];
        const newSymbols = [];
        Object.keys(args).forEach(arg => {
            utils_1.check(arg.match(LOWERCASE) !== null, `argument '${arg}' must start with a lowercase character`);
        });
        let p = 0;
        while (p < format.length) {
            const nextP = format.indexOf('%', p);
            if (nextP === -1) {
                newFormatParts.push(format.substring(p, format.length));
                break;
            }
            if (p !== nextP) {
                newFormatParts.push(format.substring(p, nextP));
                p = nextP;
            }
            let matchResult = null;
            const colon = format.indexOf(':', p);
            if (colon !== -1) {
                const endIndex = Math.min(colon + 2, format.length);
                matchResult = format.substring(p, endIndex).match(NAMED_ARGUMENT);
            }
            if (matchResult) {
                const argumentName = matchResult[ARG_NAME];
                utils_1.check(args.hasOwnProperty(argumentName), `Missing named argument for %${argumentName}`);
                const formatChar = matchResult[TYPE_NAME].charAt(0);
                const [arg, symbols] = formatToArgAndSymbols(format, formatChar, args[argumentName]);
                newArgs.push(arg);
                newFormatParts.push(`%${formatChar}`);
                newSymbols.push(...symbols);
                // ugly copy/paste from earlier line
                const endIndex = Math.min(colon + 2, format.length);
                p = endIndex;
            }
            else {
                utils_1.check(p < format.length - 1, 'dangling % at end');
                utils_1.check(isNoArgPlaceholder(format[p + 1]), `unknown format %${format[p + 1]} at ${p + 1} in '${format}'`);
                newFormatParts.push(format.substring(p, p + 2));
                p += 2;
            }
        }
        return this.copy({
            formatParts: [...this.formatParts, ...newFormatParts],
            args: [...this.args, ...newArgs],
            referencedSymbols: new Set([...this.referencedSymbols, ...newSymbols]),
        });
    }
    remove(matching) {
        let newFormatParts = [];
        this.formatParts.forEach(part => {
            part = part.replace(matching, '');
            if (part.length > 0) {
                newFormatParts.push(part);
            }
        });
        for (let i = 0; i < newFormatParts.length - 3; i++) {
            if (newFormatParts[i] === '%[' && newFormatParts[i + 1] === ';\n' && newFormatParts[i + 2] === '%]') {
                newFormatParts = newFormatParts.slice(0, i).concat(newFormatParts.slice(i + 3));
                i--;
            }
        }
        return this.copy({ formatParts: newFormatParts });
    }
    isEmpty() {
        return this.formatParts.length === 0;
    }
    isNotEmpty() {
        return !this.isEmpty();
    }
    emit(codeWriter) {
        codeWriter.emitCodeBlock(this);
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
    /**
     * Returns a code block with `prefix` stripped off, or null if this code block doesn't start with
     * `prefix`.
     *
     * This is a pretty anyType implementation that might not cover cases like mismatched whitespace. We
     * could offer something more lenient if necessary.
     */
    withoutPrefix(prefix) {
        if (this.formatParts.length < prefix.formatParts.length || this.args.length < prefix.args.length) {
            return undefined;
        }
        let prefixArgCount = 0;
        let firstFormatPart;
        // Walk through the formatParts of prefix to confirm that it's a of this.
        for (let index = 0; index < prefix.formatParts.length; index++) {
            const theirPart = prefix.formatParts[index] || '';
            const ourPart = this.formatParts[index] || '';
            if (ourPart !== theirPart) {
                // We've found a format part that doesn't match. If this is the very last format part check
                // for a string prefix match. If that doesn't match, we're done.
                if (index === prefix.formatParts.length - 1 && ourPart.startsWith(theirPart)) {
                    firstFormatPart = ourPart.substring(theirPart.length);
                }
                else {
                    return undefined;
                }
            }
            // If the matching format part has an argument, check that too.
            if (theirPart.startsWith('%') && !isNoArgPlaceholder(theirPart[1])) {
                if (this.args[prefixArgCount] !== prefix.args[prefixArgCount]) {
                    return undefined; // Argument doesn't match.
                }
                prefixArgCount++;
            }
        }
        // We found a prefix. Prepare the suffix as a result.
        const resultFormatParts = [];
        if (firstFormatPart) {
            resultFormatParts.push(firstFormatPart);
        }
        for (let i = prefix.formatParts.length; i < this.formatParts.length; i++) {
            resultFormatParts.push(this.formatParts[i] || '');
        }
        const resultArgs = [];
        for (let i = prefix.args.length; i < this.args.length; i++) {
            resultArgs.push(this.args[i] || '');
        }
        return this.copy({
            formatParts: resultFormatParts,
            args: resultArgs,
        });
    }
    /**
     * Returns a copy of the code block without leading and trailing no-arg placeholders
     * (`%W`, `%<`, `%>`, `%[`, `%]`).
     */
    trim() {
        let start = 0;
        let end = this.formatParts.length;
        const isNoArg = (i) => {
            const arg = this.formatParts[i];
            return arg !== undefined && NO_ARG_PLACEHOLDERS.includes(arg);
        };
        while (start < end && isNoArg(start)) {
            start++;
        }
        while (start < end && isNoArg(end)) {
            end--;
        }
        if (start > 0 || end < this.formatParts.length) {
            return this.copy({
                args: this.args,
                formatParts: this.formatParts.slice(start, end),
                referencedSymbols: this.referencedSymbols,
            });
        }
        else {
            return this;
        }
    }
}
__decorate([
    ts_imm_1.imm
], CodeBlock.prototype, "formatParts", void 0);
__decorate([
    ts_imm_1.imm
], CodeBlock.prototype, "args", void 0);
__decorate([
    ts_imm_1.imm
], CodeBlock.prototype, "referencedSymbols", void 0);
__decorate([
    ts_imm_1.imm
], CodeBlock.prototype, "trailer", void 0);
exports.CodeBlock = CodeBlock;
// And ugly gyration to turn the side-effect reference into a tuple
function toTuple(o) {
    const symbols = [];
    const name = o.reference(new (class {
        referenced(symbol) {
            symbols.push(symbol);
        }
    })());
    return [name, symbols];
}
/** Look at `c` to tell what arg + related symbols we should add. */
function formatToArgAndSymbols(format, c, arg) {
    switch (c) {
        case 'N':
            return argToName(arg);
        case 'L':
            return argToLiteral(arg);
        case 'S':
            return argToString(arg);
        case 'T':
            return argToType(arg);
        case 'F':
            return [arg, []];
        default:
            throw new Error(`invalid format string: '${format}'`);
    }
}
function argToName(o) {
    if (typeof o === 'string') {
        return [o, []];
    }
    else if (o instanceof SymbolSpecs_1.SymbolSpec) {
        return toTuple(o);
    }
    else if (o instanceof TypeNames_1.TypeName) {
        return toTuple(o);
    }
    else if (o instanceof ParameterSpec_1.ParameterSpec) {
        return [o.name, []];
    }
    else if (o instanceof PropertySpec_1.PropertySpec) {
        return [o.name, []];
    }
    else {
        throw new Error(`expected name but was ${o}`);
    }
}
function argToLiteral(o) {
    if (o instanceof SymbolSpecs_1.SymbolSpec) {
        return toTuple(o);
    }
    else if (o instanceof CodeBlock) {
        return [o.toString(), [...o.referencedSymbols.values()]];
    }
    else if (o === null) {
        return ['null', []];
    }
    else if (o !== undefined) {
        return [o.toString(), []];
    }
    else {
        throw new Error('not sure how to output ' + o);
    }
}
function argToString(o) {
    return [(o || '').toString(), []];
}
function argToType(o) {
    if (o instanceof TypeNames_1.TypeName) {
        return [o, toTuple(o)[1]];
    }
    else if (typeof o === 'string') {
        const type = TypeNames_1.TypeNames.importedType(o);
        return [type, toTuple(type)[1]];
    }
    else {
        throw new Error(`expected type but was ${o}`);
    }
}
