"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_imm_1 = require("ts-imm");
const CodeBlock_1 = require("./CodeBlock");
const CodeWriter_1 = require("./CodeWriter");
const FunctionSpec_1 = require("./FunctionSpec");
const Modifier_1 = require("./Modifier");
const PropertySpec_1 = require("./PropertySpec");
const TypeNames_1 = require("./TypeNames");
/** A generated `interface` declaration. */
class InterfaceSpec extends ts_imm_1.Imm {
    static create(name) {
        return new InterfaceSpec({
            name,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            modifiers: [],
            typeVariables: [],
            superInterfaces: [],
            propertySpecs: [],
            functionSpecs: [],
            indexableSpecs: [],
            callableField: undefined,
        });
    }
    emit(codeWriter) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitModifiers(this.modifiers);
        codeWriter.emit('interface');
        codeWriter.emitCode(' %L', this.name);
        codeWriter.emitTypeVariables(this.typeVariables);
        const superClasses = this.superInterfaces.map(it => CodeBlock_1.CodeBlock.of('%T', it));
        if (superClasses.length > 0) {
            codeWriter.emitCodeBlock(CodeBlock_1.CodeBlock.joinToCode(superClasses, ', ', ' extends '));
        }
        codeWriter.emit(' {\n');
        codeWriter.indent();
        // If we have functions, then we'll break them apart by newlines. But if we don't have any functions,
        // we want to keep the body condensed, sans new lines. So only emit this beginning newline if we have
        // upcoming functions ...and we have a callable/property/indexable spec was otherwise we'll have two
        // newlines together in a row: this one and the one before the first function.
        if (this.functionSpecs.length > 0 && !(this.callableField || this.propertySpecs || this.indexableSpecs)) {
            codeWriter.newLine();
        }
        // Callable
        if (this.callableField) {
            this.callableField.emit(codeWriter, [Modifier_1.Modifier.ABSTRACT]);
        }
        // Properties.
        this.propertySpecs.forEach(propertySpec => {
            propertySpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC], true);
        });
        // Indexables
        this.indexableSpecs.forEach(funSpec => {
            funSpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC, Modifier_1.Modifier.ABSTRACT]);
        });
        // Functions.
        this.functionSpecs.forEach(funSpec => {
            if (!funSpec.isConstructor()) {
                codeWriter.newLine();
                funSpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC, Modifier_1.Modifier.ABSTRACT]);
            }
        });
        codeWriter.unindent();
        if (!this.hasNoBody && this.functionSpecs.length > 0) {
            codeWriter.newLine();
        }
        codeWriter.emit('}\n');
    }
    addJavadoc(format, ...args) {
        return this.copy({
            javaDoc: this.javaDoc.add(format, ...args),
        });
    }
    addJavadocBlock(block) {
        return this.copy({
            javaDoc: this.javaDoc.addCode(block),
        });
    }
    addModifiers(...modifiers) {
        return this.copy({
            modifiers: [...this.modifiers, ...modifiers],
        });
    }
    addTypeVariables(...typeVariables) {
        return this.copy({
            typeVariables: [...this.typeVariables, ...typeVariables],
        });
    }
    addTypeVariable(typeVariable) {
        return this.copy({
            typeVariables: [...this.typeVariables, typeVariable],
        });
    }
    addSuperInterfaces(...superInterfaces) {
        return this.copy({
            superInterfaces: [...this.superInterfaces, ...superInterfaces],
        });
    }
    addSuperInterface(superClass) {
        return this.copy({
            superInterfaces: [...this.superInterfaces, superClass],
        });
    }
    addProperties(...propertySpecs) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curr = this;
        propertySpecs.forEach(it => {
            curr = curr.addProperty(it);
        });
        return curr;
    }
    addProperty(nameOrProp, maybeType, maybeData) {
        let propertySpec;
        if (nameOrProp instanceof PropertySpec_1.PropertySpec) {
            propertySpec = nameOrProp;
        }
        else {
            const name = nameOrProp;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const type = TypeNames_1.TypeNames.anyTypeMaybeString(maybeType);
            const data = maybeData || {};
            propertySpec = PropertySpec_1.PropertySpec.create(name, type).copy(data);
        }
        // require(propertySpec.decorators.isEmpty()) { "Interface properties cannot have decorators" }
        // require(propertySpec.initializer == null) { "Interface properties cannot have initializers" }
        return this.copy({
            propertySpecs: [...this.propertySpecs, propertySpec],
        });
    }
    addFunctions(...functionSpecs) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curr = this;
        functionSpecs.forEach(it => {
            curr = curr.addFunction(it);
        });
        return curr;
    }
    addFunction(functionSpec) {
        // require(functionSpec.modifiers.contains(Modifier.ABSTRACT)) { "Interface methods must be abstract" }
        // require(functionSpec.body.isEmpty()) { "Interface methods cannot have code" }
        // require(!functionSpec.isConstructor) { "Interfaces cannot have a constructor" }
        // require(functionSpec.decorators.isEmpty()) { "Interface functions cannot have decorators" }
        return this.copy({
            functionSpecs: [...this.functionSpecs, functionSpec.setEnclosed(FunctionSpec_1.Encloser.INTERFACE)],
        });
    }
    addIndexables(...indexableSpecs) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curr = this;
        indexableSpecs.forEach(it => {
            curr = curr.addIndexable(it);
        });
        return curr;
    }
    addIndexable(functionSpec) {
        // require(functionSpec.modifiers.contains(Modifier.ABSTRACT)) { "Indexables must be ABSTRACT" }
        return this.copy({
            indexableSpecs: [...this.indexableSpecs, functionSpec],
        });
    }
    callable(callable) {
        if (callable) {
            // require(callable.isCallable) { "expected a callable signature but was ${callable.name}; use FunctionSpec.createCallable when building" }
            // require(callable.modifiers == setOf(Modifier.ABSTRACT)) { "Callable must be ABSTRACT and nothing else" }
        }
        return this.copy({
            callableField: callable,
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
    get hasNoBody() {
        return (this.propertySpecs.length === 0 &&
            this.functionSpecs.length === 0 &&
            this.indexableSpecs.length === 0 &&
            this.callableField === undefined);
    }
}
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "typeVariables", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "superInterfaces", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "propertySpecs", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "functionSpecs", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "indexableSpecs", void 0);
__decorate([
    ts_imm_1.imm
], InterfaceSpec.prototype, "callableField", void 0);
exports.InterfaceSpec = InterfaceSpec;
