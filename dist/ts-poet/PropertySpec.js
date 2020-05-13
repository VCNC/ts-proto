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
class PropertySpec extends ts_imm_1.Imm {
    static create(name, type, optional = false, ...modifiers) {
        return new PropertySpec({
            name,
            type,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            decorators: [],
            modifiers,
            initializerField: undefined,
            optional,
            implicitlyType: false,
        });
    }
    emit(codeWriter, implicitModifiers = [], asStatement = false, withInitializer = true) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitDecorators(this.decorators, false);
        codeWriter.emitModifiers(this.modifiers, implicitModifiers);
        codeWriter.emitCode(this.name);
        if (this.optional) {
            codeWriter.emitCode('?');
        }
        if (!this.implicitlyType) {
            codeWriter.emitCode(`: %T`, this.type);
        }
        if (withInitializer && this.initializerField) {
            codeWriter.emit(' = ');
            codeWriter.emitCodeBlock(this.initializerField);
        }
        if (asStatement) {
            codeWriter.emit(';\n');
        }
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
    addDecorators(...decoratorSpecs) {
        return this.copy({
            decorators: [...this.decorators, ...decoratorSpecs],
        });
    }
    addDecorator(decoratorSpec) {
        return this.copy({
            decorators: [...this.decorators, decoratorSpec],
        });
    }
    addModifiers(...modifiers) {
        return this.copy({
            modifiers: [...this.modifiers, ...modifiers],
        });
    }
    setImplicitlyTyped() {
        return this.copy({ implicitlyType: true });
    }
    initializer(format, ...args) {
        return this.initializerBlock(CodeBlock_1.CodeBlock.of(format, ...args));
    }
    initializerBlock(codeBlock) {
        return this.copy({
            initializerField: codeBlock,
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
}
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "type", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "decorators", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "initializerField", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "optional", void 0);
__decorate([
    ts_imm_1.imm
], PropertySpec.prototype, "implicitlyType", void 0);
exports.PropertySpec = PropertySpec;
