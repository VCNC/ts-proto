"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const fileNamePattern = '(?:[a-zA-Z0-9._-]+)';
const modulePattern = `@?(?:(?:!${fileNamePattern})|(?:${fileNamePattern}(?:/${fileNamePattern})*))`;
const identPattern = `(?:(?:[a-zA-Z][_a-zA-Z0-9.]*)|(?:[_a-zA-Z][_a-zA-Z0-9.]+))`;
exports.moduleSeparator = '[*@+=]';
const importPattern = `^(${identPattern})?(${exports.moduleSeparator})(${modulePattern})(?:#(${identPattern}))?`;
class SymbolSpec {
    constructor(value) {
        this.value = value;
    }
    static from(spec) {
        const matched = spec.match(importPattern);
        if (matched != null) {
            const modulePath = matched[3];
            const type = matched[2] || '@';
            const symbolName = matched[1] || (lodash_1.default.last(modulePath.split('/')) || '').replace('!', '');
            const targetName = matched[4];
            switch (type) {
                case '*':
                    return SymbolSpecs.importsAll(symbolName, modulePath);
                case '@':
                    return SymbolSpecs.importsName(symbolName, modulePath);
                case '=':
                    return SymbolSpecs.importsDefault(symbolName, modulePath);
                case '+':
                    return targetName
                        ? SymbolSpecs.augmented(symbolName, modulePath, targetName)
                        : SymbolSpecs.sideEffect(symbolName, modulePath);
                default:
                    throw new Error('Invalid type character');
            }
        }
        return SymbolSpecs.implicit(spec);
    }
    static fromMaybeString(spec) {
        return typeof spec === 'string' ? SymbolSpec.from(spec) : spec;
    }
    reference(trackedBy) {
        if (trackedBy) {
            trackedBy.referenced(this);
        }
        return this.value;
    }
}
exports.SymbolSpec = SymbolSpec;
class SymbolSpecs {
    static importsAll(localName, from) {
        return new ImportsAll(localName, from);
    }
    static importsName(exportedName, from) {
        return new ImportsName(exportedName, from);
    }
    static augmented(symbolName, from, target) {
        return new Augmented(symbolName, from, target);
    }
    static sideEffect(symbolName, from) {
        return new SideEffect(symbolName, from);
    }
    static implicit(name) {
        return new Implicit(name);
    }
    static importsDefault(exportedName, from) {
        return new ImportsDefault(exportedName, from);
    }
}
exports.SymbolSpecs = SymbolSpecs;
class Implicit extends SymbolSpec {
    constructor(value) {
        super(value);
    }
    reference() {
        return this.value;
    }
}
exports.Implicit = Implicit;
class Imported extends SymbolSpec {
    constructor(value, source) {
        super(source);
        this.value = value;
        this.source = source;
    }
}
exports.Imported = Imported;
class ImportsName extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsName = ImportsName;
class ImportsDefault extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsDefault = ImportsDefault;
class ImportsAll extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsAll = ImportsAll;
class Augmented extends Imported {
    constructor(value, source, augmented) {
        super(value, source);
        this.augmented = augmented;
    }
}
exports.Augmented = Augmented;
class SideEffect extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.SideEffect = SideEffect;
