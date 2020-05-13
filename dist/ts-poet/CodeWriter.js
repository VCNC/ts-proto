"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const Path = __importStar(require("path"));
const ClassSpec_1 = require("./ClassSpec");
const CodeBlock_1 = require("./CodeBlock");
const DecoratorSpec_1 = require("./DecoratorSpec");
const EnumSpec_1 = require("./EnumSpec");
const InterfaceSpec_1 = require("./InterfaceSpec");
const LineWrapper_1 = require("./LineWrapper");
const Modifier_1 = require("./Modifier");
const StringBuffer_1 = require("./StringBuffer");
const SymbolSpecs_1 = require("./SymbolSpecs");
const utils_1 = require("./utils");
class CodeWriter {
    constructor(out, indentString = '  ', referencedSymbols = new Set()) {
        this.indentString = indentString;
        this.referencedSymbols = new Set();
        this.indentLevel = 0;
        this.javaDoc = false;
        this.comment = false;
        this.trailingNewline = false;
        this.out = new LineWrapper_1.LineWrapper(out, indentString, 100);
        referencedSymbols.forEach(sym => this.referencedSymbols.add(sym));
    }
    static emitToString(emittable) {
        const out = new StringBuffer_1.StringBuffer();
        emittable.emit(new CodeWriter(out));
        return out.toString();
    }
    referenced(symbol) {
        this.referencedSymbols.add(symbol);
    }
    indent(levels = 1) {
        this.indentLevel += levels;
        return this;
    }
    unindent(levels = 1) {
        utils_1.check(this.indentLevel - levels >= 0, `cannot unindent ${levels} from ${this.indentLevel}`);
        this.indentLevel -= levels;
        return this;
    }
    emitComment(codeBlock) {
        this.trailingNewline = true;
        this.comment = true;
        try {
            this.emitCodeBlock(codeBlock);
            this.emit('\n');
        }
        finally {
            this.comment = false;
        }
    }
    emitJavaDoc(javaDocCodeBlock) {
        if (javaDocCodeBlock.isEmpty()) {
            return;
        }
        this.emit('/**\n');
        this.javaDoc = true;
        try {
            this.emitCodeBlock(javaDocCodeBlock);
        }
        finally {
            this.javaDoc = false;
        }
        this.emit(' */\n');
    }
    emitDecorators(decorators, inline) {
        decorators.forEach(decoratorSpec => {
            decoratorSpec.emit(this, inline);
            this.emit(inline ? ' ' : '\n');
        });
    }
    emitModifiers(modifiers, implicitModifiers = []) {
        if (modifiers.length === 0) {
            return;
        }
        Modifier_1.ModifierOrder.forEach(m => {
            if (modifiers.includes(m) && !implicitModifiers.includes(m)) {
                this.emit(m).emit(' ');
            }
        });
    }
    emitTypeVariables(typeVariables) {
        if (typeVariables.length === 0) {
            return;
        }
        this.emit('<');
        let index = 0;
        typeVariables.forEach(typeVariable => {
            if (index > 0) {
                this.emit(', ');
            }
            let code = typeVariable.name;
            if (typeVariable.bounds.length > 0) {
                const parts = [];
                parts.push(' extends');
                let j = 0;
                typeVariable.bounds.forEach(bound => {
                    if (j > 0) {
                        parts.push(bound.combiner);
                    }
                    if (bound.modifier) {
                        parts.push(bound.modifier);
                    }
                    parts.push(bound.type.reference(this));
                    j++;
                });
                code += parts.join(' ');
            }
            this.emit(code);
            index++;
        });
        this.emit('>');
    }
    emitImports(path) {
        const imports = this.requiredImports();
        const augmentImports = lodash_1.default.groupBy(utils_1.filterInstances(imports, SymbolSpecs_1.Augmented), a => a.augmented);
        const sideEffectImports = lodash_1.default.groupBy(utils_1.filterInstances(imports, SymbolSpecs_1.SideEffect), a => a.source);
        if (imports.length > 0) {
            const m = lodash_1.default.groupBy(imports.filter(it => !(it instanceof SymbolSpecs_1.Augmented) || !(it instanceof SymbolSpecs_1.SideEffect)), it => it.source);
            Object.entries(m).forEach(([sourceImportPath, imports]) => {
                if (path === sourceImportPath || Path.resolve(path) === Path.resolve(sourceImportPath)) {
                    return;
                }
                const importPath = maybeRelativePath(path, sourceImportPath);
                utils_1.filterInstances(imports, SymbolSpecs_1.ImportsAll).forEach(i => {
                    this.emitCode("%[import * as %L from '%L';\n%]", i.value, importPath);
                    const augments = augmentImports[i.value];
                    if (augments) {
                        augments.forEach(augment => this.emitCode("%[import '%L';\n%]", augment.source));
                    }
                });
                const names = utils_1.unique(utils_1.filterInstances(imports, SymbolSpecs_1.ImportsName).map(it => it.value.split('.')[0]));
                const def = utils_1.unique(utils_1.filterInstances(imports, SymbolSpecs_1.ImportsDefault).map(it => it.value));
                if (names.length > 0 || def.length > 0) {
                    const namesPart = names.length > 0 ? [`{ ${names.join(', ')} }`] : [];
                    const defPart = def.length > 0 ? [def[0]] : [];
                    this.emitCode('import ')
                        .emitCode([...defPart, ...namesPart].join(', '))
                        .emitCode(" from '%L';\n", importPath);
                    [...names, ...def].forEach(name => {
                        const augments = augmentImports[name];
                        if (augments) {
                            augments.forEach(augment => this.emitCode("%[import '%L';\n%]", augment.source));
                        }
                    });
                }
            });
            Object.keys(sideEffectImports).forEach(it => {
                this.emitCode('%[import %S;\n%]', it);
            });
            this.emit('\n');
        }
        return this;
    }
    emitCode(format, ...args) {
        this.emitCodeBlock(CodeBlock_1.CodeBlock.of(format, ...args));
        return this;
    }
    emitCodeBlock(codeBlock) {
        codeBlock.referencedSymbols.forEach(sym => this.referencedSymbols.add(sym));
        let a = 0;
        codeBlock.formatParts.forEach(part => {
            switch (part) {
                case '%L':
                    this.emitLiteral(codeBlock.args[a++]);
                    break;
                case '%N':
                    this.emit(codeBlock.args[a++]);
                    break;
                case '%S':
                    this.emitString(codeBlock.args[a++]);
                    break;
                case '%T':
                    this.emitTypeName(codeBlock.args[a++]);
                    break;
                case '%%':
                    this.emit('%');
                    break;
                case '%>':
                    this.indent();
                    break;
                case '%<':
                    this.unindent();
                    break;
                case '%[':
                    break;
                case '%]':
                    break;
                case '%W':
                    this.emitWrappingSpace();
                    break;
                case '%F':
                    this.emitFunction(codeBlock.args[a++]);
                    break;
                default:
                    this.emit(part);
            }
        });
        if (codeBlock.trailer) {
            this.emitCodeBlock(codeBlock.trailer);
        }
        return this;
    }
    emit(s) {
        let first = true;
        s.split('\n').forEach(line => {
            if (!first) {
                if ((this.javaDoc || this.comment) && this.trailingNewline) {
                    this.emitIndentation();
                    this.out.append(this.javaDoc ? ' *' : '//');
                }
                this.out.append('\n');
                this.trailingNewline = true;
            }
            first = false;
            if (line.length === 0) {
                return;
            }
            if (this.trailingNewline) {
                this.emitIndentation();
                if (this.javaDoc) {
                    this.out.append(' * ');
                }
                else if (this.comment) {
                    this.out.append('// ');
                }
            }
            this.out.append(line);
            this.trailingNewline = false;
        });
        return this;
    }
    newLine() {
        return this.emit('\n');
    }
    requiredImports() {
        const imported = [];
        this.referencedSymbols.forEach(sym => {
            if (sym instanceof SymbolSpecs_1.Imported) {
                imported.push(sym);
            }
        });
        return imported;
    }
    emitIndentation() {
        for (let j = 0; j < this.indentLevel; j++) {
            this.out.append(this.indentString);
        }
    }
    emitWrappingSpace() {
        this.out.wrappingSpace(this.indentLevel + 2);
        return this;
    }
    emitTypeName(typeName) {
        this.emit(typeName.reference(this));
    }
    emitFunction(fn) {
        fn.emit(this);
    }
    emitString(s) {
        if (s === null) {
            this.emit('null');
        }
        else if (s === undefined) {
            this.emit('undefined');
        }
        else {
            this.emit(utils_1.stringLiteralWithQuotes(s));
        }
    }
    emitLiteral(o) {
        if (o instanceof ClassSpec_1.ClassSpec) {
            return o.emit(this);
        }
        else if (o instanceof InterfaceSpec_1.InterfaceSpec) {
            return o.emit(this);
        }
        else if (o instanceof EnumSpec_1.EnumSpec) {
            return o.emit(this);
        }
        else if (o instanceof DecoratorSpec_1.DecoratorSpec) {
            return o.emit(this, true, true);
        }
        else if (o instanceof CodeBlock_1.CodeBlock) {
            this.emitCodeBlock(o);
        }
        else if (typeof o === 'object' && o) {
            this.emit(o.toString());
        }
        else {
            this.emit(String(o));
        }
    }
}
exports.CodeWriter = CodeWriter;
function maybeRelativePath(outputPath, importPath) {
    if (!importPath.startsWith('./')) {
        return importPath;
    }
    const dirs = outputPath.split('').filter(l => l === '/').length;
    if (dirs === 0) {
        return importPath;
    }
    const a = new Array(dirs);
    const prefix = a.fill('..', 0, dirs).join('/');
    return prefix + importPath.substring(1);
}
