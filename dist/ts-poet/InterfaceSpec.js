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
        if (this.functionSpecs.length > 0 && !(this.callableField || this.propertySpecs || this.indexableSpecs)) {
            codeWriter.newLine();
        }
        if (this.callableField) {
            this.callableField.emit(codeWriter, [Modifier_1.Modifier.ABSTRACT]);
        }
        this.propertySpecs.forEach(propertySpec => {
            propertySpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC], true);
        });
        this.indexableSpecs.forEach(funSpec => {
            funSpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC, Modifier_1.Modifier.ABSTRACT]);
        });
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
            const type = TypeNames_1.TypeNames.anyTypeMaybeString(maybeType);
            const data = maybeData || {};
            propertySpec = PropertySpec_1.PropertySpec.create(name, type).copy(data);
        }
        return this.copy({
            propertySpecs: [...this.propertySpecs, propertySpec],
        });
    }
    addFunctions(...functionSpecs) {
        let curr = this;
        functionSpecs.forEach(it => {
            curr = curr.addFunction(it);
        });
        return curr;
    }
    addFunction(functionSpec) {
        return this.copy({
            functionSpecs: [...this.functionSpecs, functionSpec.setEnclosed(FunctionSpec_1.Encloser.INTERFACE)],
        });
    }
    addIndexables(...indexableSpecs) {
        let curr = this;
        indexableSpecs.forEach(it => {
            curr = curr.addIndexable(it);
        });
        return curr;
    }
    addIndexable(functionSpec) {
        return this.copy({
            indexableSpecs: [...this.indexableSpecs, functionSpec],
        });
    }
    callable(callable) {
        if (callable) {
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
