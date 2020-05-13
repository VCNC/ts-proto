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
const Modifier_1 = require("./Modifier");
const utils_1 = require("./utils");
class EnumSpec extends ts_imm_1.Imm {
    static create(name) {
        return new EnumSpec({
            name,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            modifiers: [],
            constants: new Map(),
        });
    }
    emit(codeWriter) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitModifiers(this.modifiers);
        codeWriter.emitCode('enum %L {\n', this.name);
        codeWriter.indent();
        let left = this.constants.size;
        this.constants.forEach((constant, key) => {
            if (constant.javaDoc) {
                codeWriter.emitJavaDoc(constant.javaDoc);
            }
            codeWriter.emitCode('%L', key);
            if (constant.value) {
                codeWriter.emitCode(' = ');
                codeWriter.emitCodeBlock(constant.value);
            }
            if (left-- > 0) {
                codeWriter.emit(',\n');
            }
            else {
                codeWriter.emit('\n');
            }
        });
        codeWriter.unindent();
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
        modifiers.forEach(it => utils_1.check(it === Modifier_1.Modifier.EXPORT || it === Modifier_1.Modifier.DECLARE || it === Modifier_1.Modifier.CONST));
        modifiers.forEach(m => this.modifiers.push(m));
        return this;
    }
    addConstant(name, initializer, javaDoc) {
        this.constants.set(name, { value: typeof initializer === 'string' ? CodeBlock_1.CodeBlock.of(initializer) : initializer, javaDoc: javaDoc });
        return this;
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
    hasNoBody() {
        return this.constants.size === 0;
    }
}
__decorate([
    ts_imm_1.imm
], EnumSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], EnumSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], EnumSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], EnumSpec.prototype, "constants", void 0);
exports.EnumSpec = EnumSpec;
