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
/**
 * Specifies a symbol and its related origin, either via import or implicit/local declaration.
 *
 * @param value Value of the symbol
 */
class SymbolSpec {
    constructor(value) {
        this.value = value;
    }
    /**
     * Parses a symbol reference pattern to create a symbol. The pattern
     * allows the simple definition of all symbol types including any possible
     * import variation. If the spec to parse does not follow the proper format
     * an implicit symbol is created from the unparsed spec.
     *
     * Pattern: `<symbol_name>? <import_type> <module_path> (#<augmented_symbol_name>)?`
     *
     * * symbol_name = `[a-zA-Z0-9._]+`
     *
     *        Any legal compound JS/TS symbol (e.g. symbol._member.member). If no symbol name is
     *        specified then the last component of the module path is used as the symbol name;
     *        allows easy use with libraries that follow normal conventions.
     *
     * * import_type = `@ | * | +`
     *
     *        `@` = Import named symbol from module (e.g. `import { <symbol_name> } from '<module_name>'`)
     *
     *        `*` = Import all symbols from module (e.g. `*Foo` becomes `import * as Foo from 'Foo'`,
     *          `Foo*foo` becomes `import * as Foo from 'foo').
     *
     *        `+` = Symbol is declared implicitly via import of the module (e.g. `import '<module_name>'`)
     *
     * * module_path = `!<filename> | <filename>(/<filename)*`
     *
     *        Path name specifying the module. If the module path begins with a `!` then it is considered
     *        to be a file being generated. This ensures the paths are output as relative imports.
     *
     * * augmented_symbol_name = `[a-zA-Z0-9_]+`
     *
     *        Any valid symbol name that represents the symbol that is being augmented. For example,
     *        the import `rxjs/add/observable/from` attaches the `from` method to the `Observable` class.
     *        To import it correctly the spec should be `+rxjs/add/observable/from#Observable`. Adding this
     *        parameter to augmented imports ensures they are output only when the symbol being augmented
     *        is actually used.
     *
     *
     * @param spec Symbol spec to parse.
     * @return Parsed symbol specification
     */
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
    /**
     * Creates an import of all the modules exported symbols as a single
     * local named symbol
     *
     * e.g. `import * as Engine from 'templates';`
     *
     * @param localName The local name of the imported symbols
     * @param from The module to import the symbols from
     */
    static importsAll(localName, from) {
        return new ImportsAll(localName, from);
    }
    /**
     * Creates an import of a single named symbol from the module's exported
     * symbols.
     *
     * e.g. `import { Engine } from 'templates';`
     *
     * @param exportedName The symbol that is both exported and imported
     * @param from The module the symbol is exported from
     */
    static importsName(exportedName, from) {
        return new ImportsName(exportedName, from);
    }
    /**
     * Creates a symbol that is brought in by a whole module import
     * that "augments" an existing symbol.
     *
     * e.g. `import 'rxjs/add/operator/flatMap'`
     *
     * @param symbolName The augmented symbol to be imported
     * @param from The entire import that does the augmentation
     * @param target The symbol that is augmented
     */
    static augmented(symbolName, from, target) {
        return new Augmented(symbolName, from, target);
    }
    /**
     * Creates a symbol that is brought in as a side effect of
     * an import.
     *
     * e.g. `import 'mocha'`
     *
     * @param symbolName The symbol to be imported
     * @param from The entire import that does the augmentation
     */
    static sideEffect(symbolName, from) {
        return new SideEffect(symbolName, from);
    }
    /**
     * An implied symbol that does no tracking of imports
     *
     * @param name The implicit symbol name
     */
    static implicit(name) {
        return new Implicit(name);
    }
    /**
     * Creates an import of a single named symbol from the module's exported
     * default.
     *
     * e.g. `import Engine from 'engine';`
     *
     * @param exportedName The symbol that is both exported and imported
     * @param from The module the symbol is exported from
     */
    static importsDefault(exportedName, from) {
        return new ImportsDefault(exportedName, from);
    }
}
exports.SymbolSpecs = SymbolSpecs;
/**
 * Non-imported symbol
 */
class Implicit extends SymbolSpec {
    constructor(value) {
        super(value);
    }
    reference() {
        return this.value;
    }
}
exports.Implicit = Implicit;
/**
 * Common base class for imported symbols
 */
class Imported extends SymbolSpec {
    constructor(value, source) {
        super(source);
        this.value = value;
        this.source = source;
    }
}
exports.Imported = Imported;
/**
 * Imports a single named symbol from the module's exported
 * symbols.
 *
 * e.g. `import { Engine } from 'templates';`
 */
class ImportsName extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsName = ImportsName;
/**
 * Imports a single named symbol from the module's exported
 * default.
 *
 * e.g. `import Engine from 'engine';`
 */
class ImportsDefault extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsDefault = ImportsDefault;
/**
 * Imports all of the modules exported symbols as a single
 * named symbol
 *
 * e.g. `import * as Engine from 'templates';`
 */
class ImportsAll extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.ImportsAll = ImportsAll;
/**
 * A symbol that is brought in by a whole module import
 * that "augments" an existing symbol.
 *
 * e.g. `import 'rxjs/add/operator/flatMap'`
 */
class Augmented extends Imported {
    constructor(value, source, augmented) {
        super(value, source);
        this.augmented = augmented;
    }
}
exports.Augmented = Augmented;
/**
 * A symbol that is brought in as a side effect of an
 * import.
 *
 * E.g. `from("Foo+mocha")` will add `import 'mocha'`
 */
class SideEffect extends Imported {
    constructor(value, source) {
        super(value, source);
    }
}
exports.SideEffect = SideEffect;
